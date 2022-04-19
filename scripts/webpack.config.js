const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const { PWD, NODE_ENV: mode } = process.env;
const isEnvDevelopment = mode === 'development';

console.log('PWD', PWD);
module.exports = {
  mode,
  devtool: isEnvDevelopment ? 'inline-source-map' : false,
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
  performance: {
    maxAssetSize: 700000,
  },
  resolve: {
    extensions: ['.js', '.ts'],
    modules: [path.resolve(PWD, 'node_modules')],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(PWD, 'src')],
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new ESLintPlugin({
    //   extensions: ['js', 'ts'],
    //   context: path.resolve(PWD),
    //   files: 'src',
    //   eslintPath: require.resolve('eslint'),
    // }),
  ],
};
