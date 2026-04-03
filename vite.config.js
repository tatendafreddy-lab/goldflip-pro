import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.VITE_GOLD_API_KEY ?? "";

  console.log("[vite] Gold API key loaded:", apiKey ? `${apiKey.slice(0, 8)}...` : "MISSING");

  return {
    plugins: [react()],
    server: {
      port: 5314,
      strictPort: true,
      host: "0.0.0.0"
    },
    preview: {
      port: 5315,
      strictPort: true,
      host: "0.0.0.0"
    }
  };
});
