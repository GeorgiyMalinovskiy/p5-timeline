declare interface Config {
  limit: { min: number; max: number; value: number; step: number };
  yearSpan: { end?: number; start?: number };
  requestTimeout: number;
  theme: {
    palette: { primary: string; secondary: string; background: [string, string] };
  }
}

declare interface ServerOptions {
  host: string;
  port: number;
}

declare type YearData = [string | number, string, number];
declare interface YearMap {
  name: string | number;
  date: string;
  count: number;
}

declare interface MockData {
  cols: ['name', 'date', 'count'];
  data: YearData[];
}

declare interface MonthMap {
  [k: number]: YearMap[]
}
