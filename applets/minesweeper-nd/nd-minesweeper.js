// applets/minesweeper-nd/nd-minesweeper.js
import { createButton } from '../shared/js/ui-components.js';
import { clamp } from '../shared/js/math-utils.js';

class NDMinesweeper {
  constructor(root) {
    this.root = root;
    this.dimensions = 2; // Start with 2D
    this.sizes = [12, 12]; // Start with classic size
    this.mineCount = 20;
    this.game = null;
    this.gameState = 'ready';
    this.firstClick = true;
    this.view3D = false;
    this.selectedSlice = 0; // For 3D cube view
    
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
        <!-- Top Controls -->
        <div class="controls-bar">
          <div class="controls-section">
            <label for="dimensions">Dimensions:</label>
            <select id="dimensions" class="control-select">
              <option value="2" selected>2D (Classic)</option>
              <option value="3">3D (Cube)</option>
              <option value="4">4D (Tesseract)</option>
              <option value="5">5D (Hyperspace)</option>
            </select>
          </div>

          <div class="controls-section" id="view-toggle-section" style="display: none;">
            <label>View:</label>
            <div class="toggle-buttons">
              <button id="view-slices" class="toggle-btn active">Slices</button>
              <button id="view-cube" class="toggle-btn">3D Cube</button>
            </div>
          </div>

          <div class="controls-section">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty" class="control-select">
              <option value="easy">Easy (10%)</option>
              <option value="medium" selected>Medium (15%)</option>
              <option value="hard">Hard (20%)</option>
              <option value="expert">Expert (25%)</option>
            </select>
          </div>

          <div class="controls-section" id="size-controls">
            <!-- Dynamic size controls -->
          </div>

          <div class="controls-section">
            <label for="mine-count">Mines:</label>
            <input type="number" id="mine-count" value="20" min="1" max="500" class="control-input">
          </div>

          <div class="controls-section">
            <div class="game-controls">
              <button id="new-game" class="btn btn-primary">
                <i class="fas fa-plus"></i> New Game
              </button>
              <button id="hint" class="btn btn-secondary">
                <i class="fas fa-lightbulb"></i> Hint
              </button>
            </div>
          </div>

          <div class="controls-section">
            <div class="game-info">
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span id="game-status" class="info-value">Ready</span>
              </div>
              <div class="info-item">
                <span class="info-label">Mines:</span>
                <span id="mines-left" class="info-value">20</span>
              </div>
              <div class="info-item">
                <span class="info-label">Safe Cells:</span>
                <span id="cells-left" class="info-value">0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Game View -->
        <div class="game-view">
          <div class="view-header">
            <h2 id="view-title">2D Classic Minesweeper</h2>
            <div class="dimension-info" id="dimension-info">12×12 grid</div>
          </div>

          <div class="view-container" id="view-container">
            <!-- Slice selector for 3D cube view -->
            <div class="slice-selector" id="slice-selector" style="display: none;">
              <label>Viewing Slice:</label>
              <input type="range" id="slice-slider" min="0" max="5" value="0" class="slice-slider">
              <span id="slice-display">0 / 5</span>
            </div>

            <!-- 2D/Slice View -->
            <div class="slices-view" id="slices-view">
              <div class="slices-container" id="slices-container">
                <!-- Game boards rendered here -->
              </div>
            </div>

            <!-- 3D Cube View -->
            <div class="cube-view" id="cube-view" style="display: none;">
              <div class="cube-wrapper">
                <div class="cube-container">
                  <div class="cube" id="cube">
                    <!-- 3D cube faces -->
                  </div>
                </div>
                <div class="cube-controls">
                  <div class="cube-control-row">
                    <button class="cube-control-btn" data-axis="x" data-dir="-1">↑</button>
                  </div>
                  <div class="cube-control-row">
                    <button class="cube-control-btn" data-axis="y" data-dir="1">←</button>
                    <button class="cube-control-btn" id="cube-reset">Reset</button>
                    <button class="cube-control-btn" data-axis="y" data-dir="-1">→</button>
                  </div>
                  <div class="cube-control-row">
                    <button class="cube-control-btn" data-axis="x" data-dir="1">↓</button>
                  </div>
                  <div class="cube-info">
                    <p>Use slice selector above to view different layers</p>
                    <p>Drag or use arrow keys to rotate</p>
                  </div>
                </div>
              </div>
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
    
    // View toggle
    document.getElementById('view-slices')?.addEventListener('click', () => this.setView('slices'));
    document.getElementById('view-cube')?.addEventListener('click', () => this.setView('cube'));
    
    // Slice selector for 3D cube
    document.getElementById('slice-slider')?.addEventListener('input', (e) => {
      this.selectedSlice = parseInt(e.target.value);
      this.updateSliceDisplay();
      this.render3DCube();
    });
    
    // Settings
    document.getElementById('dimensions').addEventListener('change', (e) => {
      this.dimensions = parseInt(e.target.value);
      this.updateSizeControls();
      this.updateViewToggle();
      this.newGame(); // Auto start new game
    });

    document.getElementById('difficulty').addEventListener('change', () => {
      this.updateDifficulty();
      this.newGame();
    });

    document.getElementById('mine-count').addEventListener('change', (e) => {
      this.mineCount = parseInt(e.target.value);
    });
  }

  updateViewToggle() {
    const viewToggleSection = document.getElementById('view-toggle-section');
    if (this.dimensions === 3) {
      viewToggleSection.style.display = 'block';
    } else {
      viewToggleSection.style.display = 'none';
      this.setView('slices');
    }
  }

  setView(viewType) {
    this.view3D = (viewType === 'cube');
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view-${viewType}`).classList.add('active');
    
    // Show/hide views
    document.getElementById('slices-view').style.display = this.view3D ? 'none' : 'block';
    document.getElementById('cube-view').style.display = this.view3D ? 'block' : 'none';
    
    // Show/hide slice selector
    const sliceSelector = document.getElementById('slice-selector');
    if (this.view3D && this.dimensions === 3) {
      sliceSelector.style.display = 'flex';
      this.updateSliceSelector();
    } else {
      sliceSelector.style.display = 'none';
    }
    
    this.renderView();
  }

  updateSliceSelector() {
    const slider = document.getElementById('slice-slider');
    slider.max = this.sizes[2] - 1;
    slider.value = Math.min(this.selectedSlice, this.sizes[2] - 1);
    this.selectedSlice = parseInt(slider.value);
    this.updateSliceDisplay();
  }

  updateSliceDisplay() {
    const display = document.getElementById('slice-display');
    display.textContent = `${this.selectedSlice} / ${this.sizes[2] - 1}`;
  }

  updateSizeControls() {
    const container = document.getElementById('size-controls');
    container.innerHTML = '';
    
    // Better default sizes
    const defaultSizes = {
      2: [12, 12],
      3: [6, 6, 6],
      4: [5, 5, 4, 4],
      5: [4, 4, 4, 3, 3]
    };
    
    this.sizes = defaultSizes[this.dimensions] || new Array(this.dimensions).fill(4);

    const dimLabels = ['W', 'H', 'D', 'A', 'K'];
    
    for (let i = 0; i < this.dimensions; i++) {
      const sizeControl = document.createElement('div');
      sizeControl.className = 'size-control';
      sizeControl.innerHTML = `
        <label for="size-${i}">${dimLabels[i]}:</label>
        <input type="number" id="size-${i}" value="${this.sizes[i]}" min="3" max="16" class="control-input size-input">
      `;
      container.appendChild(sizeControl);
      
      document.getElementById(`size-${i}`).addEventListener('change', (e) => {
        this.sizes[i] = parseInt(e.target.value);
        this.updateDimensionInfo();
      });
    }
  }

  updateDimensionInfo() {
    const dimNames = ['Classic Minesweeper', '3D Cube', '4D Tesseract', '5D Hyperspace', '6D+ Spacetime'];
    const sizeStr = this.sizes.slice(0, this.dimensions).join('×');
    const totalVolume = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
    
    document.getElementById('view-title').textContent = 
      this.dimensions === 2 ? '2D Classic Minesweeper' :
      this.dimensions === 3 && this.view3D ? '3D Interactive Cube' : 
      `${this.dimensions}D ${dimNames[this.dimensions - 1]}`;
    document.getElementById('dimension-info').textContent = `${sizeStr} (${totalVolume.toLocaleString()} cells)`;
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
        case '3':
          if (this.dimensions === 3) {
            this.setView(this.view3D ? 'slices' : 'cube');
          }
          break;
        case 'ArrowLeft':
          if (this.view3D && this.dimensions === 3) {
            this.selectedSlice = Math.max(0, this.selectedSlice - 1);
            this.updateSliceSelector();
            this.render3DCube();
          }
          break;
        case 'ArrowRight':
          if (this.view3D && this.dimensions === 3) {
            this.selectedSlice = Math.min(this.sizes[2] - 1, this.selectedSlice + 1);
            this.updateSliceSelector();
            this.render3DCube();
          }
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
    
    if (this.view3D && this.dimensions === 3) {
      this.updateSliceSelector();
    }
    
    this.renderView();
    this.updateGameInfo();
  }

  renderView() {
    if (this.dimensions === 3 && this.view3D) {
      this.render3DCube();
    } else {
      this.renderSlices();
    }
  }

  renderSlices() {
    const container = document.getElementById('slices-container');
    container.innerHTML = '';
    container.className = `slices-container dim-${this.dimensions}`;
    
    if (this.dimensions === 2) {
      this.render2D(container);
    } else if (this.dimensions === 3) {
      this.render3DSlices(container);
    } else if (this.dimensions === 4) {
      this.render4D(container);
    } else if (this.dimensions === 5) {
      this.render5D(container);
    }
  }

  render2D(container) {
    const board = this.createBoard([this.sizes[0], this.sizes[1]], [], 'large');
    container.appendChild(board);
  }

  render3DSlices(container) {
    // Horizontal layout for better space usage
    for (let z = 0; z < this.sizes[2]; z++) {
      const sliceWrapper = this.createSliceWrapper(`Layer ${z}`, [z]);
      const board = this.createBoard([this.sizes[0], this.sizes[1]], [z], 'medium');
      sliceWrapper.appendChild(board);
      container.appendChild(sliceWrapper);
    }
  }

  render4D(container) {
    // Grid layout for 4D - Ana slices with embedded Z layers
    for (let w = 0; w < this.sizes[3]; w++) {
      const anaWrapper = document.createElement('div');
      anaWrapper.className = 'ana-slice-wrapper';
      
      const anaHeader = document.createElement('div');
      anaHeader.className = 'ana-header';
      anaHeader.innerHTML = `<h3>Ana ${w}</h3>`;
      
      const layersGrid = document.createElement('div');
      layersGrid.className = 'layers-grid';
      
      for (let z = 0; z < this.sizes[2]; z++) {
        const sliceWrapper = this.createSliceWrapper(`Layer ${z}`, [z, w]);
        const board = this.createBoard([this.sizes[0], this.sizes[1]], [z, w], 'small');
        sliceWrapper.appendChild(board);
        layersGrid.appendChild(sliceWrapper);
      }
      
      anaWrapper.appendChild(anaHeader);
      anaWrapper.appendChild(layersGrid);
      container.appendChild(anaWrapper);
    }
  }

  render5D(container) {
    // Nested grid for 5D
    for (let v = 0; v < this.sizes[4]; v++) {
      const kataWrapper = document.createElement('div');
      kataWrapper.className = 'kata-slice-wrapper';
      
      const kataHeader = document.createElement('div');
      kataHeader.className = 'kata-header';
      kataHeader.innerHTML = `<h3>Kata ${v}</h3>`;
      
      const anaGrid = document.createElement('div');
      anaGrid.className = 'ana-grid';
      
      for (let w = 0; w < this.sizes[3]; w++) {
        const anaSubWrapper = document.createElement('div');
        anaSubWrapper.className = 'ana-sub-wrapper';
        
        const anaSubHeader = document.createElement('h4');
        anaSubHeader.textContent = `Ana ${w}`;
        anaSubHeader.className = 'ana-sub-header';
        
        const layersGrid = document.createElement('div');
        layersGrid.className = 'layers-mini-grid';
        
        for (let z = 0; z < this.sizes[2]; z++) {
          const miniBoard = this.createBoard([this.sizes[0], this.sizes[1]], [z, w, v], 'tiny');
          layersGrid.appendChild(miniBoard);
        }
        
        anaSubWrapper.appendChild(anaSubHeader);
        anaSubWrapper.appendChild(layersGrid);
        anaGrid.appendChild(anaSubWrapper);
      }
      
      kataWrapper.appendChild(kataHeader);
      kataWrapper.appendChild(anaGrid);
      container.appendChild(kataWrapper);
    }
  }

  render3DCube() {
    const cubeContainer = document.getElementById('cube');
    cubeContainer.innerHTML = '';
    
    // Create transparent cube showing the selected slice
    const board = this.createBoard([this.sizes[0], this.sizes[1]], [this.selectedSlice], 'medium');
    board.className += ' cube-slice-board';
    
    // Create cube frame
    const cubeFrame = document.createElement('div');
    cubeFrame.className = 'cube-frame';
    
    // Add wireframe edges to show 3D structure
    for (let i = 0; i < 12; i++) {
      const edge = document.createElement('div');
      edge.className = `cube-edge edge-${i}`;
      cubeFrame.appendChild(edge);
    }
    
    cubeContainer.appendChild(cubeFrame);
    cubeContainer.appendChild(board);
    
    this.setupCubeControls();
  }

  setupCubeControls() {
    const cube = document.getElementById('cube');
    let rotationX = -15;
    let rotationY = 25;
    
    const updateRotation = () => {
      cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    };
    
    // Control buttons
    document.querySelectorAll('.cube-control-btn[data-axis]').forEach(btn => {
      btn.addEventListener('click', () => {
        const axis = btn.dataset.axis;
        const dir = parseInt(btn.dataset.dir);
        
        if (axis === 'x') {
          rotationX += dir * 15;
        } else {
          rotationY += dir * 15;
        }
        updateRotation();
      });
    });
    
    // Reset button
    document.getElementById('cube-reset')?.addEventListener('click', () => {
      rotationX = -15;
      rotationY = 25;
      updateRotation();
    });
    
    updateRotation();
  }

  createSliceWrapper(title, coords) {
    const wrapper = document.createElement('div');
    wrapper.className = 'slice-wrapper';
    
    const header = document.createElement('div');
    header.className = 'slice-header';
    header.innerHTML = `<h4 class="slice-title">${title}</h4>`;
    
    wrapper.appendChild(header);
    return wrapper;
  }

  createBoard(gridSize, extraCoords, size = 'medium') {
    const board = document.createElement('div');
    board.className = `board board-${size}`;
    board.style.gridTemplateColumns = `repeat(${gridSize[0]}, 1fr)`;
    
    for (let y = 0; y < gridSize[1]; y++) {
      for (let x = 0; x < gridSize[0]; x++) {
        const coords = [x, y, ...extraCoords];
        const cell = this.game.getCell(coords);
        const cellElement = this.createCellElement(coords, cell, size);
        board.appendChild(cellElement);
      }
    }
    
    return board;
  }

  createCellElement(coords, cell, size = 'medium') {
    const cellEl = document.createElement('div');
    cellEl.className = `cell cell-${size}`;
    cellEl.dataset.coords = JSON.stringify(coords);
    
    if (cell.revealed) {
      cellEl.classList.add('revealed');
      if (cell.isMine) {
        cellEl.classList.add('mine');
        cellEl.innerHTML = size === 'tiny' ? '●' : '💣';
      } else if (cell.neighborMines > 0) {
        cellEl.textContent = cell.neighborMines;
        cellEl.classList.add(`mines-${cell.neighborMines}`);
      }
    } else if (cell.flagged) {
      cellEl.classList.add('flagged');
      cellEl.innerHTML = '🚩';
    }
    
    cellEl.addEventListener('click', (e) => this.handleCellClick(e, coords));
    cellEl.addEventListener('contextmenu', (e) => this.handleCellRightClick(e, coords));
    
    return cellEl;
  }

  handleCellClick(e, coords) {
    e.preventDefault();
    if (this.gameState !== 'ready' && this.gameState !== 'playing') return;
    
    const cell = this.game.getCell(coords);
    if (cell.revealed || cell.flagged) return;
    
    if (this.firstClick) {
      this.game.generateMinesWithSafeArea(coords);
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
    
    this.renderView();
    this.updateGameInfo();
  }

  handleCellRightClick(e, coords) {
    e.preventDefault();
    if (this.gameState !== 'playing' && this.gameState !== 'ready') return;
    
    this.game.toggleFlag(coords);
    this.renderView();
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
      ready: 'Ready',
      playing: 'Playing',
      won: '🎉 Won!',
      lost: '💥 Lost'
    };
    
    document.getElementById('game-status').textContent = statusMap[this.gameState];
    document.getElementById('mines-left').textContent = this.game.getRemainingFlags();
    document.getElementById('cells-left').textContent = this.game.getRemainingCells();
    
    const statusEl = document.getElementById('game-status');
    statusEl.className = `info-value status-${this.gameState}`;
  }

  showHint() {
    if (this.gameState !== 'playing' && this.gameState !== 'ready') return;
    
    const safeCells = [];
    for (const coords of this.game.getAllCoords()) {
      const cell = this.game.getCell(coords);
      if (!cell.revealed && !cell.flagged && !cell.isMine) {
        safeCells.push(coords);
      }
    }
    
    if (safeCells.length > 0) {
      const hintCoords = safeCells[Math.floor(Math.random() * safeCells.length)];
      
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

// Game logic class (unchanged from before)
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

  generateMinesWithSafeArea(safeCoords) {
    if (this.minesGenerated) return;
    
    const allCoords = this.getAllCoords();
    const safeArea = new Set();
    safeArea.add(this.coordsToKey(safeCoords));
    
    for (const neighborCoords of this.getNeighbors(safeCoords)) {
      safeArea.add(this.coordsToKey(neighborCoords));
    }
    
    const availableCoords = allCoords.filter(coords => 
      !safeArea.has(this.coordsToKey(coords))
    );
    
    for (let i = 0; i < this.mineCount && availableCoords.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableCoords.length);
      const mineCoords = availableCoords.splice(randomIndex, 1)[0];
      const cell = this.getCell(mineCoords);
      cell.isMine = true;
    }
    
    this.calculateNeighborCounts();
    this.minesGenerated = true;
    this.revealCell(safeCoords);
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
    
    if (cell.neighborMines === 0) {
      for (const neighborCoords of this.getNeighbors(coords)) {
        const neighbor = this.getCell(neighborCoords);
        if (neighbor && !neighbor.revealed && !neighbor.flagged) {
          this.revealCell(neighborCoords);
        }
      }
    }
    
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