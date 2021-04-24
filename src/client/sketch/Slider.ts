import type p5 from 'p5';

import { DataProvider, config } from '../utils';
import { Year } from './Year';

export interface Slider {
  isOver: boolean;
  slider: p5.Element;
  show: () => void;
}

const DEFAULT_VALUE = 100;

let instance: Slider;
export default (p: p5, years: Year[]): Slider => {
  if (instance) return instance;

  const {
    limit: {
      min,
      max,
      value,
      step,
    },
  } = config;
  const cachedValue = DataProvider.storage.getItem('slider.value');
  const sliderValue = +(cachedValue || value || DEFAULT_VALUE);
  if (!cachedValue) DataProvider.storage.setItem('slider.value', `${sliderValue}`);
  const slider = p.createSlider(min, max, sliderValue, step);

  const group = p.createDiv();
  group.style('position', 'relative');
  const label = p.createSpan();
  label.parent(group);
  label.style(`
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translate(0, -50%);
  margin-right: 10px;
  font-family: Arial;
  font-size: 12px;
  white-space: nowrap;
  color: white;
  `);
  const getLabelText = () => `top ${slider?.value()}/year`;

  label.html(getLabelText());

  slider.parent(group);
  slider.size(120);

  slider.mouseClicked(() => {
    label.html(getLabelText());
    const limit = slider?.value();
    DataProvider.storage.setItem('slider.value', `${limit}`);
    years.forEach((year) => {
      if (year.onscreen) {
        const key = year.label;
        const query = `${key}/${limit}`;
        DataProvider.request({ key, query });
      }
    });
  });

  let isOver = false;
  let opacity = 0.5;
  group.mouseOver(() => { isOver = true; opacity = 1; });
  group.mouseOut(() => { isOver = false; opacity = 0.25; });

  instance = {
    get isOver() { return isOver; },
    slider,
    show() {
      group.position(p.width - 130, 10);
      group.style('opacity', opacity);
    },
  };

  return instance;
};
