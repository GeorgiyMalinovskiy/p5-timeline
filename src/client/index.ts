import { checkTouchAvailable } from './utils';

(async () => {
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';

  const main = document.createElement('main');
  document.body.appendChild(main);

  const { default: P5 } = await import('p5');
  const { default: sketch } = await import('./sketch');

  new P5(sketch({ hasTouchScreen: checkTouchAvailable() }), main);
})();
