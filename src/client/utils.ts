import type p5 from 'p5';
import configJSON from '../config.json';

export const config = configJSON as Config;

export const checkTouchAvailable = (): boolean => {
  let hasTouchScreen = false;
  switch (true) {
    case 'maxTouchPoints' in navigator:
      hasTouchScreen = navigator.maxTouchPoints > 0;
      break;
    case 'msMaxTouchPoints' in navigator:
      hasTouchScreen = navigator.msMaxTouchPoints > 0;
      break;
    default:
      const mQ = 'matchMedia' in window && matchMedia('(pointer:coarse)'); // eslint-disable-line no-case-declarations
      if (mQ && mQ.media === '(pointer:coarse)') {
        hasTouchScreen = !!mQ.matches;
      } else if ('orientation' in window) {
        hasTouchScreen = true; // deprecated, but good fallback
      } else {
        // Only as a last resort, fall back to user agent sniffing
        const UA = navigator.userAgent;
        hasTouchScreen = (
          /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA)
          || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
        );
      }
      break;
  }
  return hasTouchScreen;
};

export const drawGradient = (p: p5) => (
  c1: p5.Color,
  c2: p5.Color,
  width: number = p.width,
  height: number = p.height,
): void => {
  p.noFill();
  for (let y = 0; y < height; y++) {
    const inter = p.map(y, 0, height, 0, 1);
    const c = p.lerpColor(c1, c2, inter);
    p.stroke(c);
    p.line(0, y, width, y);
  }
};

export const getSpan = (start: number, end: number): number[] => {
  if (end <= start) console.warn('"end" parameter should be > "start"'); // eslint-disable-line no-console
  return [...new Array(end - start + 1)]
    .map((_, i) => end - i);
};

interface NumAbbreviationParams { text: string; remainder: number }
export const getNumAbbreviation = ({
  text = '',
  remainder = 0,
}: Partial<NumAbbreviationParams>): NumAbbreviationParams => {
  let _text = text;
  let _remainder = remainder;

  if (_remainder >= 1e9) {
    _text += `${Math.floor(_remainder / 1e9)} `; // B
    _remainder %= 1e9;
  } else if (_remainder >= 1e6) {
    _text += ` ${Math.floor(_remainder / 1e6)} `; // M
    _remainder %= 1e6;
  } else if (_remainder >= 1e3) {
    _text += ` ${Math.floor(_remainder / 1e3)} `; // K
    _remainder %= 1e3;
  } else if (_remainder > 0) {
    _text += ` ${_remainder}`;
    _remainder = 0;
  }

  const result = { text: _text, remainder: _remainder };
  if (_remainder > 0) return getNumAbbreviation(result);
  return result;
};

export const DataProvider = {
  storage: window.sessionStorage,
  request(
    input: {
      key: string;
      query: string;
    },
    init?: RequestInit,
  ): Promise<MonthMap> {
    const { key, query } = input;
    return fetch(`/api/${query}`, init)
      .then((req) => {
        if (req.ok) return req.json();
        throw new Error(`${req.status}`);
      })
      .then((data) => {
        this.storage.setItem(key, JSON.stringify(data));
        return data;
      })
      .catch((error) => {
        console.warn(error); // eslint-disable-line no-console
      });
  },
};
