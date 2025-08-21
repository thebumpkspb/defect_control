/** @type {import('next').NextConfig} */
const path = require("path");
const webpack = require("webpack");
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  output: "standalone",
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
//   pageExtensions: [
//     "page.tsx",
//     "page.ts",
//     // FIXME: Next.js has a bug which does not resolve not-found.page.tsx correctly
//     // Instead, use `not-found.ts` as a workaround
//     // "ts" is required to resolve `not-found.ts`
//     // https://github.com/vercel/next.js/issues/65447
//     // "ts"
// ],
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      use: "frontmatter-markdown-loader",
    });

    config.plugins.push(
      new webpack.EnvironmentPlugin({
        NODE_ENV: process.env.NODE_ENV,
      })
    );

    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = withNextIntl({ ...nextConfig });
