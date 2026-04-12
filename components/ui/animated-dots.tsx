"use client";

import { useEffect, useRef } from "react";

interface AnimatedDotsProps {
  className?: string;
  colors?: [number, number, number][];
  dotSize?: number;
  speed?: number;
}

export function AnimatedDots({
  className,
  colors = [[45, 90, 71], [127, 182, 154]],
  dotSize = 3,
  speed = 1,
}: AnimatedDotsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    resize();
    window.addEventListener("resize", resize);

    const spacing = 28;
    let time = 0;

    function draw() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      time += 0.008 * speed;

      const cols = Math.ceil(w / (spacing * dpr)) + 2;
      const rows = Math.ceil(h / (spacing * dpr)) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing * dpr;
          const y = row * spacing * dpr;

          // Ripple from center
          const cx = w / 2;
          const cy = h / 2;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
          const normDist = dist / maxDist;

          // Animated wave
          const wave = Math.sin(dist * 0.003 - time * 3) * 0.5 + 0.5;
          const opacity = 0.08 + wave * 0.35 * (1 - normDist * 0.5);

          // Color interpolation
          const colorIdx = (Math.sin(time + col * 0.1 + row * 0.15) * 0.5 + 0.5);
          const c0 = colors[0];
          const c1 = colors[1] ?? colors[0];
          const r = Math.round(c0[0] + (c1[0] - c0[0]) * colorIdx);
          const g = Math.round(c0[1] + (c1[1] - c0[1]) * colorIdx);
          const b = Math.round(c0[2] + (c1[2] - c0[2]) * colorIdx);

          // Size pulse
          const size = dotSize * dpr * (0.6 + wave * 0.5);

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [colors, dotSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
