"use client";

import { useEffect } from "react";

// Registra el service worker solo en producción (en dev interferiría con el HMR).
// Falla en silencio: si el navegador no soporta SW, la página funciona igual.
export default function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
