import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 19,
          background: "#F0EDE6",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2D5C3F",
          fontWeight: 600,
        }}
      >
        H
      </div>
    ),
    { ...size },
  );
}
