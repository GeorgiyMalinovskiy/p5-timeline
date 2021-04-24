import type p5 from 'p5';
import getDate from 'date-fns/getDate';

import type { Month } from './Month';
import { getBounds as getMonthsBounds } from './Month';
import {
  config,
  getNumAbbreviation,
  DataProvider,
} from '../utils';

export interface Year {
  active: boolean;
  readonly isOver: boolean;
  readonly onscreen: boolean;
  readonly index: number;
  readonly alpha: number;
  readonly label: string;
  readonly labelColor: p5.Color;
  readonly statsColor: p5.Color;
  data?: MonthMap;
  timer?: NodeJS.Timeout;
  rotation: p5.Vector;
  position: p5.Vector;
  update(span: number, angle: number): Year;
  getStats(): number;
  showConnections(month: Month): Year;
  showStats(): Year;
  showLabel(): void;
}

export const getOrigin = (p: p5) => p.createVector(p.width / 2, 0);
export const getBase = (p: p5) => p.createVector(p.width / 2, p.height - ((p.height / 100) * 5));
export const getAngle = (p: p5) => Math.abs(
  p.degrees(p.createVector(0, p.height / 2).angleBetween(getBase(p))),
);
const getMax = (): { total: number; entry: number } => {
  const max = DataProvider.storage.getItem('max');
  return max ? JSON.parse(max) : { total: 0, entry: 0 };
};

export default (p: p5, months: Month[]) => (label: number, index: number): Year => ({
  active: true,
  get isOver() {
    return (
      p.mouseX > (this.position.x - (p.textWidth(this.label) / 2))
      && p.mouseX < (this.position.x + p.textWidth(this.label) / 2)
      && p.mouseY > this.position.y - 15
      && p.mouseY < this.position.y + 15
    );
  },
  get onscreen() {
    const offset = 50;
    return this.rotation.heading() > 0
      && this.position.x > -offset
      && this.position.x < (p.width + offset);
  },
  index,
  get alpha() {
    return Math.round(
      this.position.x < (p.width / 2)
        ? p.map(this.position.x, 0, p.width / 2, 0, 235)
        : p.map(this.position.x, p.width / 2, p.width, 235, 0),
    );
  },
  get label() { return `${label}`; },
  get statsColor() {
    const { theme: { palette: { primary, secondary } } } = config;
    const color = p.lerpColor(
      p.color(secondary),
      p.color(primary),
      p.map(this.alpha, 0, 235, 0, 1),
    );

    color.setAlpha(this.alpha);
    return color;
  },
  get labelColor() {
    return p.color(255, this.alpha);
  },
  get data() {
    const key = this.label;
    if (!this.timer) {
      DataProvider.request({ key, query: `${key}/${DataProvider.storage.getItem('slider.value')}` });
      this.timer = setInterval(() => {
        if (this.onscreen) DataProvider.request({ key, query: `${key}/${DataProvider.storage.getItem('slider.value')}` });
      }, config.requestTimeout);
    }
    const cached = DataProvider.storage.getItem(key);
    return cached ? JSON.parse(cached) : undefined;
  },
  rotation: p.createVector(),
  get position() {
    return getOrigin(p).add(
      p.createVector(
        this.rotation.x,
        getBase(p).y,
      ),
    );
  },
  update(span: number, angle: number) {
    this.rotation = getBase(p).rotate(angle + (360 / span) * this.index);
    return this;
  },
  getStats() {
    let count = 0;
    if (this.active) {
      months.forEach((month) => {
        if (month.active && this.data?.[month.index]) {
          count += this.data?.[month.index].reduce((acc, { count: c }) => acc + c, 0);
        }
      });
    }

    return count;
  },
  showConnections(month: Month) {
    if (
      this.onscreen
      && this.active
      && month.active
      && this.data?.[month.index]
    ) {
      const monthKeys = Object.keys(this.data);
      const daysInMonth = 31;
      const [xBounds] = getMonthsBounds(p);
      const monthWidth = xBounds / 12;
      const distance = (this.position.y - month.position.y);
      const yTextPadding = 25;
      const max = getMax();

      this.data?.[month.index].forEach(({ name, date, count }, i) => {
        const day = getDate(new Date(date));
        const dayPosition = p.createVector(
          month.position.x - (monthWidth / 2) + p.map(day, 0, daysInMonth, 0, monthWidth),
          month.position.y,
        );

        const a1 = dayPosition.copy().add(0, yTextPadding);
        const c1 = p.createVector(
          dayPosition.x,
          dayPosition.y + (distance / 2),
        );
        const c2 = p.createVector(
          this.position.x,
          this.position.y - (distance / 2),
        );
        const a2 = p.createVector(
          (this.position.x + i + monthKeys.indexOf(`${month.index}`)) - (monthKeys.length / 2),
          this.position.y - yTextPadding - 1,
        );

        p.stroke(this.statsColor);
        p.noFill();
        p.beginShape();
        p.strokeWeight(1);
        p.vertex(a1.x, a1.y);
        p.bezierVertex(
          c1.x, c1.y,
          c2.x, c2.y,
          a2.x, a2.y,
        );
        p.endShape();

        p.push();
        p.translate(dayPosition);
        p.rotate(-90);

        p.noStroke();
        p.fill(this.statsColor);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(10);
        const mappedOffset = p.map(count, 0, max.entry, 0, dayPosition.y - 60);
        const yTextOffset = (count > 1 ? mappedOffset : 0);
        const text = name;
        p.text(text, yTextOffset + yTextPadding, 0);

        p.pop();
      });
    }

    return this;
  },
  showStats() {
    if (
      this.onscreen
      && this.active
    ) {
      const count = this.getStats();

      if (count) {
        p.noStroke();
        p.fill(this.statsColor);
        p.beginShape();
        const yTextPadding = 25;

        const xOffset = p.textWidth(this.label) + 30;
        const a1 = p.createVector(
          this.position.x - xOffset,
          this.position.y - yTextPadding,
        );
        p.vertex(a1.x, a1.y);

        const max = getMax();
        const countOffset = p.map(count, 0, max.total, 0, 50);
        const a2 = p.createVector(
          this.position.x,
          this.position.y - yTextPadding - countOffset,
        );
        const a3 = p.createVector(
          this.position.x + xOffset,
          a1.y,
        );

        const c1 = p.createVector(a1.x + 50, a1.y);
        const c2 = p.createVector(a2.x - 15, a2.y);

        p.bezierVertex(
          c1.x, c1.y,
          c2.x, c2.y,
          a2.x, a2.y,
        );

        const c3 = p.createVector(a2.x + 15, a2.y);
        const c4 = p.createVector(a3.x - 50, a3.y);

        p.bezierVertex(
          c3.x, c3.y,
          c4.x, c4.y,
          a3.x, a3.y,
        );

        p.endShape();
      }
    }

    return this;
  },
  showLabel() {
    p.push();
    p.translate(this.position);

    p.noStroke();
    const color = this.labelColor;

    if (this.rotation.heading() > 0) {
      if (!this.active) {
        color.setAlpha(p.constrain(this.alpha, 0, 50));
      }

      p.fill(this.statsColor);
      p.textSize(10);
      p.textAlign(p.CENTER, p.BOTTOM);

      const count = this.getStats();
      const { text } = getNumAbbreviation({ remainder: count });
      p.text(
        text,
        0,
        -12,
      );

      p.fill(color);
      p.textSize(18);
    } else {
      color.setAlpha(p.map(this.alpha, 0, 255, 0, 50));
      p.fill(color);
      p.textSize(12);
    }

    p.textAlign(p.CENTER, p.CENTER);
    p.text(this.label, 0, 0);

    p.pop();
    return this;
  },
});
