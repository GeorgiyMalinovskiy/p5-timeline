const path = require('path');
const { merge } = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { PWD } = process.env;

const base = require('../webpack.config.js');

const plugins = [
  new CopyWebpackPlugin({
    patterns: [
      {
        force: true,
        from: 'src/server/mock',
        to: 'mock',
        context: path.resolve(PWD),
      },
    ],
  }),
];

module.exports = merge({
  target: 'node',
  externals: [nodeExternals()],
  entry: path.resolve(PWD, 'src/server', 'index.ts'),
  output: {
    path: path.resolve(PWD, 'build/server'),
    filename: 'index.js',
  },
  plugins,
}, base);
