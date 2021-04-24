import type p5 from 'p5';

import {
  config,
  getSpan,
  drawGradient,
  DataProvider,
} from '../utils';
import yearFactory, { Year, getAngle, getBase as getYearBase } from './Year';
import monthFactory, { Month, getBase as getMonthBase, getBounds as getMonthBounds } from './Month';
import createSlider, { Slider } from './Slider';
import buttonFactory, { Button } from './Button';
import createInfo, { Info } from './Info';

interface SketchOptions { hasTouchScreen: boolean }

export default ({ hasTouchScreen }: SketchOptions) => (p: p5) => {
  const OFFSET_CONSTRAIN = 5;
  const { theme: { palette: { background } } } = config;
  let offset: p5.Vector;
  let angle: number;
  let info: Info;
  let slider: Slider;
  let leftCtrlButton: Button;
  let leftArrowIcon: p5.Image;
  let rightCtrlButton: Button;
  let rightArrowIcon: p5.Image;

  let years: Year[];
  let months: Month[];

  const getMaxCountInSpan = (start: number, end: number) => {
    const key = 'max';
    const limit = DataProvider.storage.getItem('slider.value');

    const query = `${key}/${start}-${end}/${limit}`;
    return DataProvider.request({ key, query });
  };

  p.preload = () => {
    leftArrowIcon = p.loadImage('../assets/arrow_left.svg');
    rightArrowIcon = p.loadImage('../assets/arrow_right.svg');
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    offset = p.createVector(0, 0);
    angle = getAngle(p);

    info = createInfo(p);

    const btnSize = 68;
    const [xBounds, yBounds] = getMonthBounds(p);
    const yBtnPos = yBounds + ((p.height - yBounds) / 2) - (btnSize / 2);
    leftCtrlButton = buttonFactory(p)(
      btnSize,
      p.createVector(0, yBtnPos),
      leftArrowIcon,
    );
    rightCtrlButton = buttonFactory(p)(
      btnSize,
      p.createVector(p.width - btnSize, yBtnPos),
      rightArrowIcon,
    );

    const { yearSpan: { end = new Date().getFullYear(), start = 1990 } } = config;
    months = getSpan(0, 11).map((_, index) => monthFactory(p)(index));
    years = getSpan(start, end).map(yearFactory(p, months));
    slider = createSlider(p, years);

    getMaxCountInSpan(start, end).then(() => {
      setInterval(() => {
        getMaxCountInSpan(start, end);
      }, config.requestTimeout);
    });
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.keyPressed = () => {
    const step = 1;
    let { x } = offset;

    switch (true) {
      case p.keyCode === p.LEFT_ARROW:
        x += step;
        break;
      case p.keyCode === p.RIGHT_ARROW:
        x -= step;
        break;
      default: break;
    }

    offset.set(p.constrain(x, -OFFSET_CONSTRAIN, OFFSET_CONSTRAIN), offset.y);
  };

  if (hasTouchScreen) {
    p.touchStarted = (event) => {
      console.log('TOUCH', event, p.touches);
      return false;
    };
  }

  p.mousePressed = () => {
    let triggered = false;
    if (info.isOver) info.active = !info.active;

    if (!triggered && leftCtrlButton.isOver) {
      triggered = true;
      offset.set(p.constrain(offset.x + 1, -OFFSET_CONSTRAIN, OFFSET_CONSTRAIN), offset.y);
    }
    if (!triggered && rightCtrlButton.isOver) {
      triggered = true;
      offset.set(p.constrain(offset.x - 1, -OFFSET_CONSTRAIN, OFFSET_CONSTRAIN), offset.y);
    }

    if (!triggered) {
      months.forEach((month) => {
        if (month.isOver) {
          triggered = true;
          month.active = !month.active;
        }
      });
    }

    if (!triggered) {
      years.forEach((month) => {
        if (month.isOver) {
          month.active = !month.active;
        }
      });
    }
  };

  p.mouseReleased = () => {
    if (!slider.isOver && !leftCtrlButton.isOver && !rightCtrlButton.isOver) {
      offset.set(0, 0);
    }
  };

  p.doubleClicked = () => {
    let triggered = false;

    if (leftCtrlButton.isOver || rightCtrlButton.isOver) {
      triggered = true;
    }

    const totalMonthsActive = months.filter(({ active }) => active).length;
    const allMonthsActive = totalMonthsActive === months.length;

    if (
      !triggered
      && p.mouseY > getMonthBase(p).y - 20
      && p.mouseY < getMonthBase(p).y + 20
    ) {
      triggered = true;
      let active = true;
      if (allMonthsActive) active = false;
      months.forEach((month) => {
        month.active = active;
      });
    }

    if (
      !triggered
      && p.mouseY > getYearBase(p).y - 20
      && p.mouseY < getYearBase(p).y + 20
    ) {
      const totalYearsActive = years.filter(({ active }) => active).length;
      const allYearsActive = totalYearsActive === years.length;

      let active = true;
      if (allYearsActive) active = false;
      years.forEach((year) => {
        year.active = active;
      });
    }
  };

  p.draw = () => {
    p.angleMode(p.DEGREES);

    const [c1, c2] = background;
    drawGradient(p)(p.color(c1), p.color(c2));
    info.show();
    slider.show();
    leftCtrlButton.show();
    rightCtrlButton.show();

    months.forEach((month) => {
      month.update(months.length).show();
    });

    years.forEach((year) => {
      year.update(years.length, angle).showStats().showLabel();
      if (year.rotation.heading() > 0) {
        months.forEach((month) => {
          year.showConnections(month);
        });
      }
    });

    if (p.mouseIsPressed) {
      if (
        !leftCtrlButton.isOver && !rightCtrlButton.isOver
        && p.mouseY < getYearBase(p).y - 20
        && p.mouseY > getMonthBase(p).y + 20
      ) {
        offset.set(Math.round(
          p.map(p.mouseX, 0, p.width, OFFSET_CONSTRAIN, -OFFSET_CONSTRAIN),
        ), 0);
      }
    }

    p.translate(p.width / 2, 0);

    p.noStroke();
    p.fill(255, 50);
    const step = (p.width / 20);
    const xOffset = offset.x * step * -1;
    p.rect(0, p.height - 5, xOffset, 5);
    p.stroke(255, 50);

    if (xOffset) {
      p.line(0, p.height - 10, 0, p.height);
    }

    angle += offset.x / 10;
  };
};
