/* eslint-disable no-console */

import path from 'path';
import express from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv';

import { getEnvOptions } from '../../scripts/utils';
import { mockData, transformData } from './utils';

const { PWD, NODE_ENV: mode } = process.env;
const isEnvDevelopment = mode === 'development';

dotenv.config({ path: path.resolve(PWD as string, '.env') });
const { tsl } = process.env;

const { host: appHost = '127.0.0.1', port: appPort } = getEnvOptions('app') as ServerOptions;
const dbConnection = mysql.createConnection(getEnvOptions('db'));
dbConnection.connect((error) => {
  if (error) console.error(error);
});

const isDbConnected = () => isEnvDevelopment && dbConnection.state === 'authenticated';

const app = express();
app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    `http${tsl ? 's' : ''}://${appHost}${appPort ? `:${appPort}` : ''}`,
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  next();
});

app.get('/max/:span([0-9]{4}-[0-9]{4})/:limit([0-9]{2,4})?', (req, res) => {
  const { span } = req.params;
  const [start, end] = span.split('-');

  if (isDbConnected()) {
    const queryMaxTotal = `SELECT SUM(count) as total FROM data WHERE YEAR(date) BETWEEN ${start} AND ${end} GROUP BY YEAR(date) ORDER BY total DESC LIMIT 1`;
    const queryMaxEntry = `SELECT count FROM data WHERE count=(SELECT max(count) FROM data WHERE YEAR(date) BETWEEN ${start} AND ${end})`;
    dbConnection.query(`SELECT (${queryMaxTotal}) AS total, (${queryMaxEntry}) AS entry`, (error, [result] = []) => {
      if (error) {
        console.error('Database query error: ', error);
        res.status(500).send(error);
      } else {
        res.status(200).send(result);
      }
    });
  } else {
    const { data } = mockData;
    let entry = 0;
    type TotalByYear = Record<string, number>
    const totalByYear = data.reduce((
      acc,
      [name, date, count], // eslint-disable-line @typescript-eslint/no-unused-vars
    ) => {
      const year = new Date(date).getFullYear();
      if (year < +end && year > +start) {
        if (count > entry) entry = count;
        return { ...acc, [year]: (acc[year] || 0) + count };
      }
      return acc;
    }, {} as TotalByYear);

    const total = Math.max(...Object.values(totalByYear));
    res.status(200).send({ total, entry });
  }
});

app.get('/:year([0-9]{4})/:limit([0-9]{2,4})?', (req, res) => {
  const { year, limit } = req.params;

  if (isDbConnected()) {
    let query = `SELECT date, name, count FROM data WHERE YEAR(date) = ${year} ORDER BY count DESC`;
    if (limit) query += ` LIMIT ${limit}`;

    dbConnection.query(
      query,
      (error, result) => {
        if (error) {
          console.error('Database query error: ', error);
          res.status(500).end(error);
        } else {
          res.status(result.length ? 200 : 404).send(transformData(result));
        }
      },
    );
  } else {
    const { data } = mockData;
    const result = data
      .filter(([_, date]) => `${date}`.includes(year)) // eslint-disable-line @typescript-eslint/no-unused-vars
      .map(([name, date, count]) => ({ name, date, count })) as YearMap[];

    if (result.length) {
      res.status(200).send(transformData(result));
    } else {
      res.sendStatus(404);
    }
  }
});

const { host: apiHost = '127.0.0.1', port: apiPort = 3001 } = getEnvOptions('api') as ServerOptions;
app.listen(apiPort, () => {
  console.log(
    `App listening at http${tsl ? 's' : ''}://${apiHost}${apiPort ? `:${apiPort}` : ''}`,
  ); // eslint-disable-line no-console
}).on('error', (error) => {
  console.error('Server startup error: ', error);
});
