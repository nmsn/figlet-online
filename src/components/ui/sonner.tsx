"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        style: {
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#fff",
        },
      }}
    />
  );
}
