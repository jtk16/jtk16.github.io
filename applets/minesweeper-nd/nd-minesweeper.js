import { createButton } from '../shared/js/ui-components.js';

class NDMinesweeper {
  constructor(root, dimension = 2, size = 5) {
    this.root = root;
    this.dimension = dimension;
    this.size = size;
    this.init();
  }

  init() {
    this.board = document.createElement('div');
    this.board.className = 'board';
    this.board.style.gridTemplateColumns = `repeat(${this.size}, 24px)`;
    for (let i = 0; i < this.size * this.size; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.addEventListener('click', () => this.reveal(cell));
      this.board.appendChild(cell);
    }
    this.root.appendChild(this.board);
    this.root.appendChild(createButton('Reset', () => this.reset()));
  }

  reveal(cell) {
    cell.classList.add('revealed');
  }

  reset() {
    this.root.innerHTML = '';
    this.init();
  }
}

new NDMinesweeper(document.getElementById('game-root'));
