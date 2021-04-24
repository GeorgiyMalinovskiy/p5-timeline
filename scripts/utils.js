const { spawn } = require('child_process');
const path = require('path');

const { PWD } = process.env;

const spawnNodemon = (script) => {
  const isWin = process.platform.includes('win32');
  const scriptPath = path.resolve(PWD, script);
  const cp = spawn(
    `nodemon${isWin ? '.cmd' : ''}`,
    [scriptPath],
    {
      detached: true,
      stdio: ['inherit', 'inherit', 'inherit'],
      cwd: path.dirname(scriptPath),
    },
  );

  cp.unref();

  return cp;
};

const compilerCb = (cb) => (
  error,
  stats,
) => {
  if (error) {
    console.error(error.stack || error);

    if (error.details) {
      console.error(error.details);
    }

    process.exit(1);
  }

  const info = stats.toJson(true);

  if (stats.hasErrors()) {
    info.errors.forEach(({ message }) => {
      console.error(message);
    });
    process.exit(1);
  }

  if (stats.hasWarnings()) {
    info.warnings.forEach(({ message }) => {
      console.warn(message);
    });
  }

  if (cb) cb();
};

const getEnvOptions = (prefix) => (
  prefix
    ? Object.entries(process.env)
      .filter(([key]) => new RegExp(`^${prefix.toUpperCase()}`).test(key))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key.split('_').pop().toLowerCase()]: value,
      }), {})
    : {}
);

module.exports = {
  spawnNodemon,
  compilerCb,
  getEnvOptions,
};
