"use client";

import { useEffect, useRef, useCallback } from "react";

interface DitheringShaderProps {
  shape?: "sphere" | "torus" | "diamond";
  type?: "2x2" | "4x4" | "8x8";
  colorBack?: string;
  colorFront?: string;
  pxSize?: number;
  speed?: number;
  width?: number;
  height?: number;
  className?: string;
}

/* ── Bayer dithering matrices ─────────────────────────────────────────────── */

const BAYER_2x2 = [0, 2, 3, 1];
const BAYER_4x4 = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
];
const BAYER_8x8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4,
  36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33,
  9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63,
  31, 55, 23, 61, 29, 53, 21,
];

function getMatrix(type: string) {
  if (type === "2x2") return { data: BAYER_2x2, size: 2, levels: 4 };
  if (type === "4x4") return { data: BAYER_4x4, size: 4, levels: 16 };
  return { data: BAYER_8x8, size: 8, levels: 64 };
}

/* ── Shaders ──────────────────────────────────────────────────────────────── */

const VERT = `#version 300 es
in vec4 a_position;
void main(){ gl_Position = a_position; }`;

function buildFrag(
  shape: string,
  matSize: number,
  matLevels: number,
  matData: number[],
  colorFront: [number, number, number],
  colorBack: [number, number, number],
  pxSize: number,
) {
  const matStr = matData.map((v) => `${v}.0`).join(",");
  const sdf =
    shape === "torus"
      ? `float sdf(vec3 p){vec2 q=vec2(length(p.xz)-0.55,p.y);return length(q)-0.25;}`
      : shape === "diamond"
        ? `float sdf(vec3 p){return (abs(p.x)+abs(p.y)+abs(p.z)-0.7)*0.577;}`
        : `float sdf(vec3 p){return length(p)-0.6;}`;

  return `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 fragColor;

${sdf}

vec3 calcNormal(vec3 p){vec2 e=vec2(0.001,0.0);return normalize(vec3(sdf(p+e.xyy)-sdf(p-e.xyy),sdf(p+e.yxy)-sdf(p-e.yxy),sdf(p+e.yyx)-sdf(p-e.yyx)));}

float bayerMatrix[${matSize * matSize}] = float[](${matStr});

float dither(vec2 coord, float brightness){
  int s = ${matSize};
  int x = int(mod(coord.x, float(s)));
  int y = int(mod(coord.y, float(s)));
  float threshold = bayerMatrix[y * s + x] / ${matLevels}.0;
  return brightness > threshold ? 1.0 : 0.0;
}

void main(){
  float px = ${pxSize}.0;
  vec2 fc = floor(gl_FragCoord.xy / px) * px;
  vec2 uv = (fc - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

  float t = u_time;
  float ct = cos(t), st = sin(t);

  vec3 ro = vec3(0.0, 0.0, 2.0);
  vec3 rd = normalize(vec3(uv, -1.0));

  // Rotate
  mat3 ry = mat3(ct,0,st,0,1,0,-st,0,ct);
  mat3 rx = mat3(1,0,0,0,cos(t*0.7),-sin(t*0.7),0,sin(t*0.7),cos(t*0.7));
  rd = ry * rx * rd;
  ro = ry * rx * ro;

  // March
  float d = 0.0;
  for(int i=0;i<64;i++){
    vec3 p = ro + rd * d;
    float h = sdf(p);
    if(h < 0.001 || d > 10.0) break;
    d += h;
  }

  float brightness = 0.0;
  if(d < 10.0){
    vec3 p = ro + rd * d;
    vec3 n = calcNormal(p);
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    brightness = max(dot(n, light), 0.0) * 0.8 + 0.2;
  }

  vec2 ditherCoord = floor(gl_FragCoord.xy / px);
  float pattern = dither(ditherCoord, brightness);

  vec3 front = vec3(${colorFront[0]}, ${colorFront[1]}, ${colorFront[2]});
  vec3 back = vec3(${colorBack[0]}, ${colorBack[1]}, ${colorBack[2]});
  vec3 color = mix(back, front, pattern);
  float alpha = d < 10.0 ? pattern : 0.0;
  fragColor = vec4(color, alpha);
}`;
}

/* ── Hex → normalized RGB ─────────────────────────────────────────────────── */

function hexToGL(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function DitheringShader({
  shape = "sphere",
  type = "8x8",
  colorBack = "#000000",
  colorFront = "#ffffff",
  pxSize = 2,
  speed = 1,
  width = 400,
  height = 400,
  className,
}: DitheringShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const glRef = useRef<WebGL2RenderingContext | null>(null);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    glRef.current = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const { data, size, levels } = getMatrix(type);

    const isTransparent = colorBack === "transparent";
    const backGL: [number, number, number] = isTransparent ? [0, 0, 0] : hexToGL(colorBack);
    const frontGL = hexToGL(colorFront);

    const fragSrc = buildFrag(shape, size, levels, data, frontGL, backGL, pxSize);

    function compile(t: number, src: string) {
      const s = gl!.createShader(t)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let start = performance.now();
    function frame() {
      if (!gl || !canvas) return;
      const t = ((performance.now() - start) / 1000) * speed;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animRef.current = requestAnimationFrame(frame);
    }
    frame();
  }, [shape, type, colorBack, colorFront, pxSize, speed]);

  useEffect(() => {
    init();
    return () => cancelAnimationFrame(animRef.current);
  }, [init]);

  // Check WebGL2 support
  if (typeof window !== "undefined") {
    const testCanvas = document.createElement("canvas");
    if (!testCanvas.getContext("webgl2")) return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ width, height }}
    />
  );
}
