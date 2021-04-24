import type p5 from 'p5';

export interface Button {
  isOver: boolean;
  show: () => void;
}

export default (p: p5) => (
  size: number,
  position: p5.Vector,
  icon: p5.Image,
): Button => ({
  get isOver() {
    return (
      p.mouseX > position.x
      && p.mouseX < (position.x + size)
      && p.mouseY > position.y
      && p.mouseY < (position.y + size)
    );
  },
  show() {
    const iconSize = size / 2;
    p.push();
    p.translate(position);
    p.noFill();
    p.image(
      icon,
      (size / 2) - (iconSize / 2),
      (size / 2) - (iconSize / 2),
      iconSize,
      iconSize,
    );
    p.pop();
  },
});
