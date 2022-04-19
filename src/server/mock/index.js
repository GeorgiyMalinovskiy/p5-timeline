const { generateDb } = require('./utils');

module.exports = async () => {
  try {
    const db = await generateDb();
    console.log('DB generated');
  } catch (error) {
    console.error(error);
  }
};
