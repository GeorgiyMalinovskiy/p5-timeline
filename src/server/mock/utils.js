const fs = require('fs/promises');
const path = require('path');

const uuid = require('uuid');

const shema = require('./shema.json');

const generateDb = async () => {
  const data = [];
  for (let i = 0; i <= 1000; i++) {
    const record = [];
    for (const [name, type] of Object.entries(shema)) {
      let value;

      switch(type) {
        case 'date':
          value = new Date();
          value.setFullYear(Math.floor(1985 + Math.random() * (2022 - 1985)));
          value.setMonth(Math.floor(Math.random() * 12));
          value.setDate(Math.floor(Math.random() * 28));
          break;
        case 'number':
          value = Math.floor(10 + Math.random() * (100 - 10));
          break;
        default:
          value = uuid.v4().substring(0, 8);
        break;
      }
      record.push(value);
    }

    data.push(record);
  }

  const db = {
    cols: Object.keys(shema),
    data,
  };
  await fs.writeFile(path.resolve(__dirname, 'data.json'), JSON.stringify(db));
  return db;
};

module.exports = {
  generateDb,
};
