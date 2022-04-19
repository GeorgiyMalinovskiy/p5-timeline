const path = require('path');
const Webpack = require('webpack');

const { spawnNodemon, compilerCb } = require('../utils');

const { PWD } = process.env;
const isWatchMode = process.argv.includes('--watch');
const shouldStart = process.argv.includes('--start');

const env = isWatchMode ? 'development' : 'production';
process.env.NODE_ENV = env;
process.env.BABEL_ENV = env;

const config = require('./webpack.config');

const buildServer = () => new Promise((resolve) => {
  if (isWatchMode) {
    console.log('Build is running in watch mode.');

    Webpack(config).watch({
      aggregateTimeout: 1000,
      poll: undefined,
    }, compilerCb(() => {
      resolve();
    }));
  } else {
    Webpack(config, compilerCb(resolve));
  }
});

buildServer()
  .then(async () => {
    if (shouldStart) {
      const generateDb = require('../../src/server/mock');
      const db = await generateDb();
      return spawnNodemon(path.resolve(PWD, 'build/server', 'index.js'));
    }
    return null;
  })
  .then(() => {
    if (!isWatchMode) process.exit(0);
    return null;
  })
  .catch((err) => {
    console.error(err);
  });
