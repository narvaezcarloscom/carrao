import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://carraocanta.com"),
  title: "Carrao — Información de emergencia verificada · Venezuela",
  description:
    "Sismo en Venezuela: réplicas y estado de tsunami en vivo desde fuentes oficiales, qué hacer ahora y dónde buscar a tu gente. Información verificada, ligera para tu teléfono.",
  keywords: [
    "sismo Venezuela",
    "terremoto Venezuela",
    "réplica",
    "tsunami Venezuela",
    "temblor hoy Venezuela",
    "emergencia Venezuela",
  ],
  openGraph: {
    title: "Carrao — Información de emergencia verificada · Venezuela",
    description:
      "Un puente, no un medio: reunimos lo que las fuentes confiables ya verificaron y te lo damos ligero. Réplicas, tsunami, qué hacer y dónde buscar a tu gente.",
    locale: "es_VE",
    type: "website",
    url: "https://carraocanta.com",
    siteName: "Carrao",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f4ec",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
