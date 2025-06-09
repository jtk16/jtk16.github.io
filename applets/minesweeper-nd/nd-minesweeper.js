// applets/minesweeper-nd/nd-minesweeper.js
import { createButton } from '../shared/js/ui-components.js';
import { clamp } from '../shared/js/math-utils.js';

class NDMinesweeper {
  constructor(root) {
    this.root = root;
    this.dimensions = 3; // Start with 3D
    this.sizes = [5, 5, 5]; // Size in each dimension
    this.mineCount = 8;
    this.currentSlice = [0, 0, 0]; // Current position in each dimension
    this.game = null;
    this.gameState = 'ready'; // ready, playing, won, lost
    this.firstClick = true;
    
    this.init();
  }

  init() {
    this.createUI();
    this.newGame();
  }

  createUI() {
    this.root.innerHTML = `
      <div class="nd-minesweeper">
        <div class="controls-panel">
          <div class="control-group">
            <label for="dimensions">Dimensions:</label>
            <select id="dimensions" class="control-select">
              <option value="2">2D (Classic)</option>
              <option value="3" selected>3D (Cube)</option>
              <option value="4">4D (Tesseract)</option>
              <option value="5">5D (Hyperspace)</option>
            </select>
          </div>
          
          <div class="control-group">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty" class="control-select">
              <option value="easy">Easy</option>
              <option value="medium" selected>Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div class="size-controls" id="size-controls">
            <!-- Dynamic size controls will be inserted here -->
          </div>

          <div class="control-group">
            <label for="mine-count">Mines:</label>
            <input type="number" id="mine-count" value="8" min="1" max="50">
          </div>

          <div class="game-controls">
            <button id="new-game" class="btn btn-primary">New Game</button>
            <button id="hint" class="btn btn-secondary">Hint</button>
          </div>

          <div class="game-info">
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span id="game-status" class="info-value">Ready</span>
            </div>
            <div class="info-item">
              <span class="info-label">Mines Left:</span>
              <span id="mines-left" class="info-value">8</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cells Left:</span>
              <span id="cells-left" class="info-value">0</span>
            </div>
          </div>
        </div>

        <div class="game-panel">
          <div class="navigation-panel">
            <div class="nav-header">
              <h3>Navigation</h3>
              <div class="current-position" id="current-position">Position: [0, 0, 0]</div>
            </div>
            <div class="nav-controls" id="nav-controls">
              <!-- Dynamic navigation controls -->
            </div>
          </div>

          <div class="board-container">
            <div class="board-header">
              <h3 id="slice-title">2D Slice</h3>
              <div class="view-info" id="view-info">
                Viewing dimensions X×Y at depth Z=0
              </div>
            </div>
            <div class="board" id="game-board">
              <!-- Game board will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateSizeControls();
    this.updateNavigationControls();
  }

  bindEvents() {
    // Game controls
    document.getElementById('new-game').addEventListener('click', () => this.newGame());
    document.getElementById('hint').addEventListener('click', () => this.showHint());
    
    // Settings
    document.getElementById('dimensions').addEventListener('change', (e) => {
      this.dimensions = parseInt(e.target.value);
      this.updateSizeControls();
      this.updateNavigationControls();
      this.newGame();
    });

    document.getElementById('difficulty').addEventListener('change', () => {
      this.updateDifficulty();
      this.newGame();
    });

    document.getElementById('mine-count').addEventListener('change', (e) => {
      this.mineCount = parseInt(e.target.value);
    });
  }

  updateSizeControls() {
    const container = document.getElementById('size-controls');
    container.innerHTML = '';
    
    // Default sizes based on dimension
    const defaultSizes = {
      2: [10, 10],
      3: [5, 5, 5],
      4: [4, 4, 4, 4],
      5: [3, 3, 3, 3, 3]
    };
    
    this.sizes = defaultSizes[this.dimensions] || new Array(this.dimensions).fill(3);
    this.currentSlice = new Array(this.dimensions).fill(0);

    const dimLabels = ['X', 'Y', 'Z', 'W', 'V'];
    
    for (let i = 0; i < this.dimensions; i++) {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'control-group';
      controlDiv.innerHTML = `
        <label for="size-${i}">${dimLabels[i]} Size:</label>
        <input type="number" id="size-${i}" value="${this.sizes[i]}" min="3" max="15" class="size-input">
      `;
      container.appendChild(controlDiv);
      
      document.getElementById(`size-${i}`).addEventListener('change', (e) => {
        this.sizes[i] = parseInt(e.target.value);
        this.currentSlice[i] = Math.min(this.currentSlice[i], this.sizes[i] - 1);
        this.updateNavigationControls();
      });
    }
  }

  updateNavigationControls() {
    const container = document.getElementById('nav-controls');
    container.innerHTML = '';
    
    const dimLabels = ['X', 'Y', 'Z', 'W', 'V'];
    
    for (let i = 2; i < this.dimensions; i++) { // Skip X and Y (shown in 2D slice)
      const navDiv = document.createElement('div');
      navDiv.className = 'nav-dimension';
      navDiv.innerHTML = `
        <div class="nav-label">${dimLabels[i]} Slice:</div>
        <div class="nav-slider-container">
          <button class="nav-btn" data-dim="${i}" data-dir="-1">◀</button>
          <input type="range" id="nav-${i}" min="0" max="${this.sizes[i] - 1}" value="${this.currentSlice[i]}" class="nav-slider">
          <button class="nav-btn" data-dim="${i}" data-dir="1">▶</button>
        </div>
        <div class="nav-value">${this.currentSlice[i]} / ${this.sizes[i] - 1}</div>
      `;
      container.appendChild(navDiv);
      
      // Slider events
      document.getElementById(`nav-${i}`).addEventListener('input', (e) => {
        this.currentSlice[i] = parseInt(e.target.value);
        this.updatePosition();
        this.renderBoard();
      });
      
      // Button events
      navDiv.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const dim = parseInt(btn.dataset.dim);
          const dir = parseInt(btn.dataset.dir);
          this.currentSlice[dim] = clamp(this.currentSlice[dim] + dir, 0, this.sizes[dim] - 1);
          document.getElementById(`nav-${dim}`).value = this.currentSlice[dim];
          this.updatePosition();
          this.renderBoard();
        });
      });
    }
    
    // Add keyboard navigation
    this.setupKeyboardNavigation();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.gameState !== 'playing') return;
      
      let changed = false;
      switch(e.key) {
        case 'ArrowUp':
          if (this.dimensions > 2) {
            this.currentSlice[2] = clamp(this.currentSlice[2] - 1, 0, this.sizes[2] - 1);
            changed = true;
          }
          break;
        case 'ArrowDown':
          if (this.dimensions > 2) {
            this.currentSlice[2] = clamp(this.currentSlice[2] + 1, 0, this.sizes[2] - 1);
            changed = true;
          }
          break;
        case 'PageUp':
          if (this.dimensions > 3) {
            this.currentSlice[3] = clamp(this.currentSlice[3] - 1, 0, this.sizes[3] - 1);
            changed = true;
          }
          break;
        case 'PageDown':
          if (this.dimensions > 3) {
            this.currentSlice[3] = clamp(this.currentSlice[3] + 1, 0, this.sizes[3] - 1);
            changed = true;
          }
          break;
      }
      
      if (changed) {
        e.preventDefault();
        this.updateNavigationControls();
        this.updatePosition();
        this.renderBoard();
      }
    });
  }

  updatePosition() {
    document.getElementById('current-position').textContent = 
      `Position: [${this.currentSlice.join(', ')}]`;
    
    // Update slider values
    for (let i = 2; i < this.dimensions; i++) {
      const slider = document.getElementById(`nav-${i}`);
      if (slider) {
        slider.value = this.currentSlice[i];
        const valueDiv = slider.parentElement.parentElement.querySelector('.nav-value');
        valueDiv.textContent = `${this.currentSlice[i]} / ${this.sizes[i] - 1}`;
      }
    }

    // Update view info
    const dimLabels = ['X', 'Y', 'Z', 'W', 'V'];
    let viewInfo = `Viewing ${dimLabels[0]}×${dimLabels[1]}`;
    if (this.dimensions > 2) {
      const depthInfo = this.currentSlice.slice(2).map((pos, i) => 
        `${dimLabels[i + 2]}=${pos}`
      ).join(', ');
      viewInfo += ` at ${depthInfo}`;
    }
    document.getElementById('view-info').textContent = viewInfo;
  }

  updateDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    const totalCells = this.sizes.reduce((a, b) => a * b, 1);
    
    const ratios = {
      easy: 0.1,
      medium: 0.15,
      hard: 0.2,
      expert: 0.25
    };
    
    this.mineCount = Math.max(1, Math.floor(totalCells * ratios[difficulty]));
    document.getElementById('mine-count').value = this.mineCount;
  }

  newGame() {
    this.updateDifficulty();
    this.game = new NDMinesweeperGame(this.dimensions, this.sizes, this.mineCount);
    this.gameState = 'ready';
    this.firstClick = true;
    this.renderBoard();
    this.updateGameInfo();
  }

  renderBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Create 2D slice
    const [xSize, ySize] = this.sizes;
    board.style.gridTemplateColumns = `repeat(${xSize}, 1fr)`;
    
    for (let y = 0; y < ySize; y++) {
      for (let x = 0; x < xSize; x++) {
        const coords = [x, y, ...this.currentSlice.slice(2)];
        const cell = this.game.getCell(coords);
        const cellElement = this.createCellElement(coords, cell);
        board.appendChild(cellElement);
      }
    }
  }

  createCellElement(coords, cell) {
    const cellEl = document.createElement('div');
    cellEl.className = 'cell';
    cellEl.dataset.coords = JSON.stringify(coords);
    
    if (cell.revealed) {
      cellEl.classList.add('revealed');
      if (cell.isMine) {
        cellEl.classList.add('mine');
        cellEl.innerHTML = '💣';
      } else if (cell.neighborMines > 0) {
        cellEl.textContent = cell.neighborMines;
        cellEl.classList.add(`mines-${cell.neighborMines}`);
      }
    } else if (cell.flagged) {
      cellEl.classList.add('flagged');
      cellEl.innerHTML = '🚩';
    }
    
    // Add visual cues for connected cells in other dimensions
    if (this.dimensions > 2) {
      const connected = this.getConnectedCellsInfo(coords);
      if (connected.mines > 0) {
        cellEl.classList.add('has-connected-mines');
        cellEl.dataset.connectedMines = connected.mines;
      }
      if (connected.revealed > 0) {
        cellEl.classList.add('has-connected-revealed');
      }
    }
    
    cellEl.addEventListener('click', (e) => this.handleCellClick(e, coords));
    cellEl.addEventListener('contextmenu', (e) => this.handleCellRightClick(e, coords));
    
    return cellEl;
  }

  getConnectedCellsInfo(coords) {
    let mines = 0;
    let revealed = 0;
    
    // Check cells at same X,Y position in other dimensional slices
    for (let i = 2; i < this.dimensions; i++) {
      for (let slice = 0; slice < this.sizes[i]; slice++) {
        if (slice === this.currentSlice[i]) continue;
        
        const otherCoords = [...coords];
        otherCoords[i] = slice;
        const otherCell = this.game.getCell(otherCoords);
        
        if (otherCell.isMine) mines++;
        if (otherCell.revealed) revealed++;
      }
    }
    
    return { mines, revealed };
  }

  handleCellClick(e, coords) {
    e.preventDefault();
    if (this.gameState !== 'ready' && this.gameState !== 'playing') return;
    
    const cell = this.game.getCell(coords);
    if (cell.revealed || cell.flagged) return;
    
    if (this.firstClick) {
      this.game.generateMines(coords); // Ensure first click is safe
      this.firstClick = false;
      this.gameState = 'playing';
    }
    
    const result = this.game.revealCell(coords);
    
    if (result.gameOver) {
      this.gameState = 'lost';
      this.revealAllMines();
    } else if (result.won) {
      this.gameState = 'won';
    }
    
    this.renderBoard();
    this.updateGameInfo();
  }

  handleCellRightClick(e, coords) {
    e.preventDefault();
    if (this.gameState !== 'playing') return;
    
    this.game.toggleFlag(coords);
    this.renderBoard();
    this.updateGameInfo();
  }

  revealAllMines() {
    for (const coords of this.game.getAllCoords()) {
      const cell = this.game.getCell(coords);
      if (cell.isMine) {
        cell.revealed = true;
      }
    }
  }

  updateGameInfo() {
    const statusMap = {
      ready: 'Ready to play',
      playing: 'Playing',
      won: '🎉 You won!',
      lost: '💥 Game over'
    };
    
    document.getElementById('game-status').textContent = statusMap[this.gameState];
    document.getElementById('mines-left').textContent = this.game.getRemainingFlags();
    document.getElementById('cells-left').textContent = this.game.getRemainingCells();
    
    // Update status styling
    const statusEl = document.getElementById('game-status');
    statusEl.className = `info-value status-${this.gameState}`;
  }

  showHint() {
    if (this.gameState !== 'playing') return;
    
    // Find a safe cell to reveal
    const safeCells = [];
    for (const coords of this.game.getAllCoords()) {
      const cell = this.game.getCell(coords);
      if (!cell.revealed && !cell.flagged && !cell.isMine) {
        safeCells.push(coords);
      }
    }
    
    if (safeCells.length > 0) {
      const hintCoords = safeCells[Math.floor(Math.random() * safeCells.length)];
      
      // Navigate to hint location if not in current slice
      const needsNavigation = hintCoords.slice(2).some((coord, i) => 
        coord !== this.currentSlice[i + 2]
      );
      
      if (needsNavigation) {
        this.currentSlice = [...hintCoords];
        this.updateNavigationControls();
        this.updatePosition();
        this.renderBoard();
      }
      
      // Highlight the hint cell
      setTimeout(() => {
        const cellEl = document.querySelector(`[data-coords='${JSON.stringify(hintCoords)}']`);
        if (cellEl) {
          cellEl.classList.add('hint');
          setTimeout(() => cellEl.classList.remove('hint'), 2000);
        }
      }, 100);
    }
  }
}

class NDMinesweeperGame {
  constructor(dimensions, sizes, mineCount) {
    this.dimensions = dimensions;
    this.sizes = sizes;
    this.mineCount = mineCount;
    this.grid = new Map();
    this.minesGenerated = false;
    this.flagCount = 0;
    
    this.initializeGrid();
  }

  initializeGrid() {
    for (const coords of this.getAllCoords()) {
      this.grid.set(this.coordsToKey(coords), {
        isMine: false,
        revealed: false,
        flagged: false,
        neighborMines: 0
      });
    }
  }

  getAllCoords() {
    const coords = [];
    
    const generate = (current, dimension) => {
      if (dimension === this.dimensions) {
        coords.push([...current]);
        return;
      }
      
      for (let i = 0; i < this.sizes[dimension]; i++) {
        current[dimension] = i;
        generate(current, dimension + 1);
      }
    };
    
    generate(new Array(this.dimensions), 0);
    return coords;
  }

  coordsToKey(coords) {
    return coords.join(',');
  }

  getCell(coords) {
    return this.grid.get(this.coordsToKey(coords));
  }

  generateMines(safeCoords) {
    if (this.minesGenerated) return;
    
    const allCoords = this.getAllCoords();
    const safeKey = this.coordsToKey(safeCoords);
    const availableCoords = allCoords.filter(coords => 
      this.coordsToKey(coords) !== safeKey
    );
    
    // Place mines randomly
    for (let i = 0; i < this.mineCount && availableCoords.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableCoords.length);
      const mineCoords = availableCoords.splice(randomIndex, 1)[0];
      const cell = this.getCell(mineCoords);
      cell.isMine = true;
    }
    
    // Calculate neighbor counts
    this.calculateNeighborCounts();
    this.minesGenerated = true;
  }

  calculateNeighborCounts() {
    for (const coords of this.getAllCoords()) {
      const cell = this.getCell(coords);
      if (!cell.isMine) {
        cell.neighborMines = this.getNeighbors(coords)
          .filter(neighborCoords => {
            const neighbor = this.getCell(neighborCoords);
            return neighbor && neighbor.isMine;
          }).length;
      }
    }
  }

  getNeighbors(coords) {
    const neighbors = [];
    
    const generate = (current, dimension) => {
      if (dimension === this.dimensions) {
        // Skip the center cell
        if (!coords.every((coord, i) => coord === current[i])) {
          neighbors.push([...current]);
        }
        return;
      }
      
      const coord = coords[dimension];
      for (let offset = -1; offset <= 1; offset++) {
        const newCoord = coord + offset;
        if (newCoord >= 0 && newCoord < this.sizes[dimension]) {
          current[dimension] = newCoord;
          generate(current, dimension + 1);
        }
      }
    };
    
    generate(new Array(this.dimensions), 0);
    return neighbors;
  }

  revealCell(coords) {
    const cell = this.getCell(coords);
    if (cell.revealed || cell.flagged) {
      return { gameOver: false, won: false };
    }
    
    cell.revealed = true;
    
    if (cell.isMine) {
      return { gameOver: true, won: false };
    }
    
    // Auto-reveal empty neighbors
    if (cell.neighborMines === 0) {
      for (const neighborCoords of this.getNeighbors(coords)) {
        const neighbor = this.getCell(neighborCoords);
        if (neighbor && !neighbor.revealed && !neighbor.flagged) {
          this.revealCell(neighborCoords);
        }
      }
    }
    
    // Check win condition
    const won = this.checkWinCondition();
    return { gameOver: false, won };
  }

  toggleFlag(coords) {
    const cell = this.getCell(coords);
    if (cell.revealed) return;
    
    if (cell.flagged) {
      cell.flagged = false;
      this.flagCount--;
    } else if (this.flagCount < this.mineCount) {
      cell.flagged = true;
      this.flagCount++;
    }
  }

  checkWinCondition() {
    for (const coords of this.getAllCoords()) {
      const cell = this.getCell(coords);
      if (!cell.isMine && !cell.revealed) {
        return false;
      }
    }
    return true;
  }

  getRemainingFlags() {
    return this.mineCount - this.flagCount;
  }

  getRemainingCells() {
    let unrevealed = 0;
    for (const coords of this.getAllCoords()) {
      const cell = this.getCell(coords);
      if (!cell.revealed && !cell.isMine) {
        unrevealed++;
      }
    }
    return unrevealed;
  }
}

// Initialize the game
new NDMinesweeper(document.getElementById('game-root'));