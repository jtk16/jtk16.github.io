// applets/minesweeper-nd/nd-minesweeper.js
import { createButton } from '../shared/js/ui-components.js';
import { clamp } from '../shared/js/math-utils.js';

class NDMinesweeper {
  constructor(root) {
    this.root = root;
    this.dimensions = 3; // Start with 3D
    this.sizes = [5, 5, 5]; // Size in each dimension
    this.mineCount = 8;
    this.game = null;
    this.gameState = 'ready'; // ready, playing, won, lost
    this.firstClick = true;
    
    this.init();
  }

  init() {
    this.createUI();
    this.newGame();
    this.setupKeyboardControls();
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
            <input type="number" id="mine-count" value="8" min="1" max="200">
          </div>

          <div class="game-controls">
            <button id="new-game" class="btn btn-primary">
              <i class="fas fa-plus"></i> New Game
            </button>
            <button id="hint" class="btn btn-secondary">
              <i class="fas fa-lightbulb"></i> Hint
            </button>
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
            <div class="info-item">
              <span class="info-label">Total Volume:</span>
              <span id="total-volume" class="info-value">125</span>
            </div>
          </div>
        </div>

        <div class="game-panel">
          <div class="dimensional-view">
            <div class="view-header">
              <h2 id="view-title">3D Cube View</h2>
              <div class="dimension-info" id="dimension-info">
                Viewing all slices of 5×5×5 cube
              </div>
            </div>
            <div class="slices-container" id="slices-container">
              <!-- Slices will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateSizeControls();
  }

  bindEvents() {
    // Game controls
    document.getElementById('new-game').addEventListener('click', () => this.newGame());
    document.getElementById('hint').addEventListener('click', () => this.showHint());
    
    // Settings
    document.getElementById('dimensions').addEventListener('change', (e) => {
      this.dimensions = parseInt(e.target.value);
      this.updateSizeControls();
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
      2: [12, 12],
      3: [5, 5, 5],
      4: [4, 4, 4, 4],
      5: [3, 3, 3, 3, 3]
    };
    
    this.sizes = defaultSizes[this.dimensions] || new Array(this.dimensions).fill(3);

    const dimLabels = ['X', 'Y', 'Z', 'W', 'V'];
    
    for (let i = 0; i < this.dimensions; i++) {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'control-group';
      controlDiv.innerHTML = `
        <label for="size-${i}">${dimLabels[i]} Size:</label>
        <input type="number" id="size-${i}" value="${this.sizes[i]}" min="2" max="15" class="size-input">
      `;
      container.appendChild(controlDiv);
      
      document.getElementById(`size-${i}`).addEventListener('change', (e) => {
        this.sizes[i] = parseInt(e.target.value);
        this.updateDimensionInfo();
      });
    }
  }

  updateDimensionInfo() {
    const dimLabels = ['X', 'Y', 'Z', 'W', 'V'];
    const dimNames = ['2D Grid', '3D Cube', '4D Tesseract', '5D Hyperspace', '6D+ Spacetime'];
    
    const sizeStr = this.sizes.slice(0, this.dimensions).join('×');
    const totalVolume = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
    
    document.getElementById('view-title').textContent = `${dimNames[this.dimensions - 2]} View`;
    document.getElementById('dimension-info').textContent = `Viewing all slices of ${sizeStr} ${dimNames[this.dimensions - 2].toLowerCase()}`;
    document.getElementById('total-volume').textContent = totalVolume.toLocaleString();
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (this.gameState !== 'playing' && this.gameState !== 'ready') return;
      
      switch(e.key) {
        case 'n':
        case 'N':
          this.newGame();
          break;
        case 'h':
        case 'H':
          this.showHint();
          break;
        case 'Escape':
          // Reset any highlights
          document.querySelectorAll('.cell.hint').forEach(cell => {
            cell.classList.remove('hint');
          });
          break;
      }
    });
  }

  updateDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    const totalCells = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
    
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
    this.updateDimensionInfo();
    this.game = new NDMinesweeperGame(this.dimensions, this.sizes.slice(0, this.dimensions), this.mineCount);
    this.gameState = 'ready';
    this.firstClick = true;
    this.renderAllSlices();
    this.updateGameInfo();
  }

  renderAllSlices() {
    const container = document.getElementById('slices-container');
    container.innerHTML = '';
    container.className = `slices-container dim-${this.dimensions}`;
    
    if (this.dimensions === 2) {
      this.render2D(container);
    } else if (this.dimensions === 3) {
      this.render3D(container);
    } else if (this.dimensions === 4) {
      this.render4D(container);
    } else if (this.dimensions === 5) {
      this.render5D(container);
    }
  }

  render2D(container) {
    const sliceWrapper = this.createSliceWrapper('2D Grid', []);
    const board = this.createBoard([this.sizes[0], this.sizes[1]], []);
    sliceWrapper.appendChild(board);
    container.appendChild(sliceWrapper);
  }

  render3D(container) {
    for (let z = 0; z < this.sizes[2]; z++) {
      const sliceWrapper = this.createSliceWrapper(`Z Slice ${z}`, [z]);
      const board = this.createBoard([this.sizes[0], this.sizes[1]], [z]);
      sliceWrapper.appendChild(board);
      container.appendChild(sliceWrapper);
    }
  }

  render4D(container) {
    for (let w = 0; w < this.sizes[3]; w++) {
      const hypersliceDiv = document.createElement('div');
      hypersliceDiv.className = 'hyperslice';
      
      const header = document.createElement('div');
      header.className = 'hyperslice-header';
      header.innerHTML = `
        <h3>W=${w} Hyperslice</h3>
        <div class="hyperslice-slices">
      `;
      
      const slicesGrid = document.createElement('div');
      slicesGrid.className = 'slices-grid';
      slicesGrid.style.display = 'grid';
      slicesGrid.style.gridTemplateColumns = `repeat(auto-fit, minmax(150px, 1fr))`;
      slicesGrid.style.gap = '1rem';
      
      for (let z = 0; z < this.sizes[2]; z++) {
        const sliceWrapper = this.createSliceWrapper(`Z=${z}`, [z, w]);
        const board = this.createBoard([this.sizes[0], this.sizes[1]], [z, w]);
        sliceWrapper.appendChild(board);
        slicesGrid.appendChild(sliceWrapper);
      }
      
      const hypersliceWrapper = document.createElement('div');
      hypersliceWrapper.className = 'slice-wrapper';
      hypersliceWrapper.style.background = 'var(--bg-secondary)';
      hypersliceWrapper.style.border = '2px solid var(--border)';
      hypersliceWrapper.style.borderRadius = 'var(--radius-lg)';
      hypersliceWrapper.style.padding = '1.5rem';
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'slice-header';
      headerDiv.innerHTML = `
        <h3 class="slice-title">W=${w} Hyperslice</h3>
        <p class="slice-coords">[*, *, Z, ${w}]</p>
      `;
      
      hypersliceWrapper.appendChild(headerDiv);
      hypersliceWrapper.appendChild(slicesGrid);
      container.appendChild(hypersliceWrapper);
    }
  }

  render5D(container) {
    for (let v = 0; v < this.sizes[4]; v++) {
      const hypersliceDiv = document.createElement('div');
      hypersliceDiv.className = 'slice-wrapper';
      hypersliceDiv.style.background = 'var(--bg-secondary)';
      hypersliceDiv.style.border = '2px solid var(--border)';
      hypersliceDiv.style.borderRadius = 'var(--radius-lg)';
      hypersliceDiv.style.padding = '1.5rem';
      
      const headerDiv = document.createElement('div');
      headerDiv.className = 'slice-header';
      headerDiv.innerHTML = `
        <h3 class="slice-title">V=${v} Hyperslice</h3>
        <p class="slice-coords">[*, *, *, *, ${v}]</p>
      `;
      
      const wSlicesGrid = document.createElement('div');
      wSlicesGrid.style.display = 'grid';
      wSlicesGrid.style.gridTemplateColumns = `repeat(auto-fit, minmax(200px, 1fr))`;
      wSlicesGrid.style.gap = '1rem';
      wSlicesGrid.style.marginTop = '1rem';
      
      for (let w = 0; w < this.sizes[3]; w++) {
        const wWrapper = document.createElement('div');
        wWrapper.className = 'w-slice-wrapper';
        wWrapper.style.background = 'var(--bg-tertiary)';
        wWrapper.style.border = '1px solid var(--border)';
        wWrapper.style.borderRadius = 'var(--radius)';
        wWrapper.style.padding = '1rem';
        
        const wHeader = document.createElement('div');
        wHeader.innerHTML = `<h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 0.75rem;">W=${w}</h4>`;
        
        const zSlicesGrid = document.createElement('div');
        zSlicesGrid.style.display = 'grid';
        zSlicesGrid.style.gridTemplateColumns = `repeat(auto-fit, minmax(80px, 1fr))`;
        zSlicesGrid.style.gap = '0.5rem';
        
        for (let z = 0; z < this.sizes[2]; z++) {
          const miniSlice = document.createElement('div');
          miniSlice.style.background = 'var(--bg-primary)';
          miniSlice.style.border = '1px solid var(--border-light)';
          miniSlice.style.borderRadius = '4px';
          miniSlice.style.padding = '0.5rem';
          
          const miniHeader = document.createElement('div');
          miniHeader.innerHTML = `<span style="font-size: 0.6rem; color: var(--text-muted);">Z=${z}</span>`;
          
          const board = this.createBoard([this.sizes[0], this.sizes[1]], [z, w, v], true);
          board.style.gap = '0.5px';
          
          miniSlice.appendChild(miniHeader);
          miniSlice.appendChild(board);
          zSlicesGrid.appendChild(miniSlice);
        }
        
        wWrapper.appendChild(wHeader);
        wWrapper.appendChild(zSlicesGrid);
        wSlicesGrid.appendChild(wWrapper);
      }
      
      hypersliceDiv.appendChild(headerDiv);
      hypersliceDiv.appendChild(wSlicesGrid);
      container.appendChild(hypersliceDiv);
    }
  }

  createSliceWrapper(title, coords) {
    const wrapper = document.createElement('div');
    wrapper.className = 'slice-wrapper';
    
    const header = document.createElement('div');
    header.className = 'slice-header';
    
    const coordsStr = coords.length > 0 ? 
      `[*, *, ${coords.join(', ')}]` : 
      '[X, Y]';
    
    header.innerHTML = `
      <h3 class="slice-title">${title}</h3>
      <p class="slice-coords">${coordsStr}</p>
    `;
    
    wrapper.appendChild(header);
    return wrapper;
  }

  createBoard(gridSize, extraCoords, mini = false) {
    const board = document.createElement('div');
    board.className = 'board';
    board.style.gridTemplateColumns = `repeat(${gridSize[0]}, 1fr)`;
    
    const cellSize = mini ? '12px' : '24px';
    const fontSize = mini ? '0.5rem' : '0.7rem';
    
    for (let y = 0; y < gridSize[1]; y++) {
      for (let x = 0; x < gridSize[0]; x++) {
        const coords = [x, y, ...extraCoords];
        const cell = this.game.getCell(coords);
        const cellElement = this.createCellElement(coords, cell, mini);
        
        if (mini) {
          cellElement.style.width = cellSize;
          cellElement.style.height = cellSize;
          cellElement.style.fontSize = fontSize;
        }
        
        board.appendChild(cellElement);
      }
    }
    
    return board;
  }

  createCellElement(coords, cell, mini = false) {
    const cellEl = document.createElement('div');
    cellEl.className = 'cell';
    cellEl.dataset.coords = JSON.stringify(coords);
    
    if (cell.revealed) {
      cellEl.classList.add('revealed');
      if (cell.isMine) {
        cellEl.classList.add('mine');
        cellEl.innerHTML = mini ? '●' : '💣';
      } else if (cell.neighborMines > 0) {
        cellEl.textContent = cell.neighborMines;
        cellEl.classList.add(`mines-${cell.neighborMines}`);
      }
    } else if (cell.flagged) {
      cellEl.classList.add('flagged');
      cellEl.innerHTML = mini ? '🚩' : '🚩';
    }
    
    // Add visual cues for connected cells in other dimensions
    if (this.dimensions > 2 && !mini) {
      const connected = this.getConnectedCellsInfo(coords);
      if (connected.mines > 0) {
        cellEl.classList.add('has-connected-mines');
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
    if (this.dimensions === 3) {
      // For 3D, check other Z slices
      for (let z = 0; z < this.sizes[2]; z++) {
        if (z === coords[2]) continue;
        const otherCoords = [coords[0], coords[1], z];
        const otherCell = this.game.getCell(otherCoords);
        if (otherCell.isMine) mines++;
        if (otherCell.revealed) revealed++;
      }
    } else if (this.dimensions === 4) {
      // For 4D, check other W hyperslices
      for (let w = 0; w < this.sizes[3]; w++) {
        if (w === coords[3]) continue;
        const otherCoords = [coords[0], coords[1], coords[2], w];
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
    
    this.renderAllSlices();
    this.updateGameInfo();
  }

  handleCellRightClick(e, coords) {
    e.preventDefault();
    if (this.gameState !== 'playing' && this.gameState !== 'ready') return;
    
    this.game.toggleFlag(coords);
    this.renderAllSlices();
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
      playing: 'Playing...',
      won: '🎉 Victory!',
      lost: '💥 Game Over'
    };
    
    document.getElementById('game-status').textContent = statusMap[this.gameState];
    document.getElementById('mines-left').textContent = this.game.getRemainingFlags();
    document.getElementById('cells-left').textContent = this.game.getRemainingCells();
    
    // Update status styling
    const statusEl = document.getElementById('game-status');
    statusEl.className = `info-value status-${this.gameState}`;
  }

  showHint() {
    if (this.gameState !== 'playing' && this.gameState !== 'ready') return;
    
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
      
      // Highlight the hint cell
      setTimeout(() => {
        const cellEl = document.querySelector(`[data-coords='${JSON.stringify(hintCoords)}']`);
        if (cellEl) {
          cellEl.classList.add('hint');
          cellEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => cellEl.classList.remove('hint'), 3000);
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