import configJSON from '../config.json';
import mockDataJSON from './mock/data.json';

export const config = configJSON as Config;
export const mockData = mockDataJSON as MockData;
export const transformData = (
  data: YearMap[],
): MonthMap => data.reduce((acc, { name, date, count }) => {
  const month = new Date(date).getMonth();
  const entry = { name, date, count };

  return acc
    ? { ...acc, [month]: [...(acc[month] || []), entry] }
    : { [month]: [entry] };
}, {} as MonthMap);
