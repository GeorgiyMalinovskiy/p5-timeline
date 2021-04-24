const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const { compilerCb } = require('../utils');

const shouldServe = process.argv.includes('--serve');
const env = shouldServe ? 'development' : 'production';
process.env.NODE_ENV = env;
process.env.BABEL_ENV = env;

const { devServer, ...config } = require('./webpack.config');

const compiler = Webpack(config);

if (shouldServe) {
  const { port, host } = devServer;
  const server = new WebpackDevServer(compiler, devServer);
  server.listen(port, host, () => {
    console.log(`Webpack dev server started on ${host}:${port}`);
  });
} else {
  compiler.run(compilerCb(() => {
    console.log('Client compiled!');
  }));
}
