/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  // appDirectory: 'app',
  // assetsBuildDirectory: 'public/build',
  // publicPath: '/build/',
  // serverBuildDirectory: 'build',
  // devServerPort: 8002,
  serverBuildTarget: "vercel",
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  ignoredRouteFiles: [".*"],
  serverDependenciesToBundle: ["nanoid"],
}
