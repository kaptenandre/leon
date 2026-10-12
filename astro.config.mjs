import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

export default defineConfig({
  site: "https://itsleonmusic.com",
  output: "static",
  adapter: netlify(),
});
