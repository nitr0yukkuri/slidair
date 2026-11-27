import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://slidair.lolipop-now.app",
  output: "server",
  adapter: node({ mode: "standalone" }),
  security: {
    allowedDomains: [
      { hostname: "slidair.lolipop-now.app", protocol: "https" },
      { hostname: "*.preview.lolipop-now.app", protocol: "https" },
    ],
  },
});
