/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  env: {
    MAILERSEND_API_KEY: process.env.MAILERSEND_API_KEY
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
