import { ImageResponse } from "next/og";

export const alt = "Carrao — Información de emergencia verificada · Venezuela";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f7f4ec",
          color: "#1b1a17",
          padding: "90px",
        }}
      >
        {/* Marca: el canto que anuncia, alcanzando lejos */}
        <svg width="92" height="92" viewBox="0 0 64 64">
          <circle cx="22" cy="32" r="5" fill="#b45309" />
          <path
            d="M33 21 A14 14 0 0 1 33 43"
            fill="none"
            stroke="#b45309"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M40 15 A23 23 0 0 1 40 49"
            fill="none"
            stroke="#b45309"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>

        <div
          style={{
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: "-3px",
            marginTop: 30,
            lineHeight: 1,
          }}
        >
          Carrao
        </div>

        <div
          style={{
            width: 96,
            height: 7,
            background: "#b45309",
            borderRadius: 4,
            marginTop: 28,
            marginBottom: 28,
          }}
        />

        <div style={{ fontSize: 56, fontWeight: 600 }}>
          Un puente, no un medio.
        </div>

        <div style={{ fontSize: 30, color: "#57534b", marginTop: 26 }}>
          Información de emergencia verificada · Venezuela
        </div>
      </div>
    ),
    { ...size }
  );
}
