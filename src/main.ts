import './style.css';
import { runYoga } from './yoga';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <button id="run" type="button">RUN</button>
    <canvas id="debugCanvas"></canvas>
  </div>
`;

const button = document.querySelector<HTMLButtonElement>('#run')!;

button.addEventListener('click', runYoga);
