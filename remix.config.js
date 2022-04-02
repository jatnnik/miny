/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  // appDirectory: 'app',
  // assetsBuildDirectory: 'public/build',
  // publicPath: '/build/',
  // serverBuildDirectory: 'build',
  // devServerPort: 8002,
  ignoredRouteFiles: ['.*'],
  server: process.env.NODE_ENV === 'development' ? undefined : './server.js',
  serverBuildTarget: 'vercel',
}
