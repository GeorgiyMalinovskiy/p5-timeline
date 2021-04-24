const path = require('path');
const { merge } = require('webpack-merge');
const dotenv = require('dotenv');

// const { ProvidePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { getEnvOptions } = require('../utils');

const { PWD, NODE_ENV } = process.env;
const isEnvProduction = NODE_ENV === 'production';

const base = require('../webpack.config');

dotenv.config({ path: path.resolve(PWD, '.env') });

const plugins = [
  new HtmlWebpackPlugin({
    template: path.resolve(PWD, 'src/client', 'template.html'),
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        force: true,
        from: 'src/client/assets',
        to: 'assets',
        context: path.resolve(PWD),
      },
    ],
  }),
];

if (isEnvProduction) plugins.push(new BundleAnalyzerPlugin());

const { host: appHost = 'localhost', port: appPort = 3000 } = getEnvOptions('app');
const { host: apiHost = 'localhost', port: apiPort = 3001 } = getEnvOptions('api');
const { tsl } = process.env;

module.exports = merge({
  entry: path.resolve(PWD, 'src/client', 'index.ts'),
  output: {
    path: path.resolve(PWD, 'build/public'),
    filename: '[name].[contenthash].js',
  },
  plugins,
  devServer: {
    compress: true,
    liveReload: true,
    open: true,
    stats: { colors: true },
    host: appHost,
    port: appPort,
    proxy: {
      '/api': {
        target: `http${tsl ? 's' : ''}://${apiHost}${apiPort ? `:${apiPort}` : ''}`,
        pathRewrite: { '^/api': '' },
        secure: false,
        changeOrigin: true,
      },
    },
  },
}, base);
