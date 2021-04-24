import type p5 from 'p5';

export interface Month {
  active: boolean;
  readonly isOver: boolean;
  readonly index: number;
  readonly label: string;
  readonly labelColor: p5.Color;
  position: p5.Vector;
  update: (span: number) => Month;
  show: () => void;
}

export const getBounds = (p: p5) => [p.width, p.height / 3];
export const getBase = (p: p5) => {
  const [xBounds, yBounds] = getBounds(p);
  const offsetX = xBounds - p.width;
  return p.createVector(offsetX > 0 ? offsetX / 2 : 0, yBounds);
};

export default (p: p5) => (index: number): Month => ({
  active: true,
  get isOver() {
    return (
      p.mouseX > (this.position.x - (p.textWidth(this.label) / 2))
      && p.mouseX < (this.position.x + p.textWidth(this.label) / 2)
      && p.mouseY > this.position.y - 15
      && p.mouseY < this.position.y + 15
    );
  },
  index,
  get label() {
    const date = new Date();
    date.setMonth(this.index);
    return date.toLocaleString('en-GB', { month: 'long' });
  },
  get labelColor() {
    const color = p.color(255, this.active ? 235 : 100);
    return color;
  },
  position: getBase(p),
  update(span: number) {
    const [width] = getBounds(p);
    const { x: baseX, y: baseY } = getBase(p);
    const offsetX = width / span;
    this.position = p.createVector((offsetX * this.index) + (offsetX / 2) + baseX, baseY);
    return this;
  },
  show() {
    const daysInMonth = 31;
    const [xBounds] = getBounds(p);
    const monthWidth = xBounds / 12;

    p.noStroke();
    p.stroke(255, 50);
    p.push();
    const monthStartPosition = p.createVector(
      this.position.x - (monthWidth / 2),
      this.position.y + 15,
    );
    p.translate(monthStartPosition);
    for (let i = 0; i <= daysInMonth; i++) {
      const xOffset = p.map(i, 0, daysInMonth, 0, monthWidth);
      p.line(
        xOffset,
        0,
        xOffset,
        (!i || i === daysInMonth) ? -10 : -5,
      );
    }
    p.pop();

    p.push();
    p.translate(this.position);

    p.noStroke();
    p.fill(this.labelColor);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    p.text(this.label, 0, 0);
    p.pop();
  },
});
