import { useEffect } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {});
      }
      return;
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => {});
    }
  }, []);
  return null;
}