import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  // el indicador de desarrollo tapaba el pie de la barra lateral
  devIndicators: { position: "bottom-right" },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-math"],
    // \\frac → \\dfrac: fracciones legibles también dentro de un párrafo
    rehypePlugins: [["rehype-katex", { strict: false, throwOnError: false, macros: { "\\frac": "\\dfrac" } }]],
  },
});

export default withMDX(nextConfig);
