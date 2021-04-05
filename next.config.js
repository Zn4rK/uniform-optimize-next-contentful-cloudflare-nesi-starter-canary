module.exports = {
  serverRuntimeConfig: {},
  publicRuntimeConfig: {
    gaTrackingId: process.env.GA_UA_ID,
    segmentTrackingId: process.env.SEGMENT_ID,
  },
  trailingSlash: true,
  webpack: (config, { dev }) => {
    // next builds with source maps are too big for workers KV to handle, disable
    // until this changes.

    // disable sourcemaps of webpack
    config.devtool = false
    
    // disable soucemaps of babel-loader
    for (const r of config.module.rules) {
      if (r.loader === 'babel-loader') {
        r.options.sourceMaps = false
      }
    }

    return config
  }
};
