import type p5 from 'p5';

export interface Info {
  active: boolean;
  isOver: boolean;
  label: string;
  position: p5.Vector;
  show: () => void;
}

let instance: Info;
export default (p: p5): Info => {
  if (instance) return instance;

  instance = {
    active: false,
    get isOver() {
      return (
        p.mouseX > this.position.x
        && p.mouseX < this.position.x + p.textWidth(this.label)
        && p.mouseY > this.position.y - 10
        && p.mouseY < this.position.y + 10
      );
    },
    label: '(?) how-to',
    position: p.createVector(10, 20),
    show() {
      p.textAlign(p.LEFT, p.CENTER);
      p.fill(255, this.active ? 255 : 80);
      p.text(this.label, this.position.x, this.position.y);

      if (this.active) {
        p.fill(255, this.active ? 180 : 80);
        [
          'PRESS LEFT/RIGHT arrow keys to set year scale spin direction/velocity',
          'CLICK AND HOLD on connections field to spin year scale',
          'CLICK/TAP on month/year label to toggle on/off single entry',
          'DOUBLE CLICK on month/year row to toggle on/off all items',
        ].forEach((text, i) => {
          p.text(text, this.position.x, this.position.y + ((i + 1) * 25));
        });
      }
    },
  };

  return instance;
};
