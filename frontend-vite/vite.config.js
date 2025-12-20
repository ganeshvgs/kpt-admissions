import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: true,
    port: 10000,
    allowedHosts: [
      "kpt-admissions-1.onrender.com"
    ],
  },
});
