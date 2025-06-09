// applets/minesweeper-nd/nd-minesweeper.js
import { createButton } from '../shared/js/ui-components.js';
import { clamp } from '../shared/js/math-utils.js';

class NDMinesweeper {
  constructor(root) {
    this.root = root;
    this.dimensions = 3; // Start with 3D
    this.sizes = [6, 6, 6]; // Bigger default sizes for better visibility
    this.mineCount = 15;
    this.game = null;
    this.gameState = 'ready'; // ready, playing, won, lost
    this.firstClick = true;
    this.view3D = false; // Toggle for 3D cube view
    
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

          <div class="control-group" id="view-toggle-group" style="display: none;">
            <label>3D View:</label>
            <div class="toggle-buttons">
              <button id="view-slices" class="toggle-btn active">Slices</button>
              <button id="view-cube" class="toggle-btn">3D Cube</button>
            </div>
          </div>
          
          <div class="control-group">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty" class="control-select">
              <option value="easy">Easy (10%)</option>
              <option value="medium" selected>Medium (15%)</option>
              <option value="hard">Hard (20%)</option>
              <option value="expert">Expert (25%)</option>
            </select>
          </div>

          <div class="size-controls" id="size-controls">
            <!-- Dynamic size controls will be inserted here -->
          </div>

          <div class="control-group">
            <label for="mine-count">Mines:</label>
            <input type="number" id="mine-count" value="15" min="1" max="200">
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
              <span id="mines-left" class="info-value">15</span>
            </div>
            <div class="info-item">
              <span class="info-label">Safe Cells:</span>
              <span id="cells-left" class="info-value">0</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Volume:</span>
              <span id="total-volume" class="info-value">216</span>
            </div>
          </div>

          <div class="legend">
            <h4>Legend:</h4>
            <div class="legend-item">
              <span class="legend-icon mine">💣</span>
              <span>Mine</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon flag">🚩</span>
              <span>Flagged</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon number">1-8</span>
              <span>Mine count</span>
            </div>
          </div>
        </div>

        <div class="game-panel">
          <div class="dimensional-view">
            <div class="view-header">
              <h2 id="view-title">3D Cube View</h2>
              <div class="dimension-info" id="dimension-info">
                Viewing 6×6×6 cube
              </div>
            </div>
            <div class="view-container" id="view-container">
              <div class="slices-container" id="slices-container">
                <!-- Slices will be rendered here -->
              </div>
              <div class="cube-container" id="cube-container" style="display: none;">
                <!-- 3D cube will be rendered here -->
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
    
    // Settings
    document.getElementById('dimensions').addEventListener('change', (e) => {
      this.dimensions = parseInt(e.target.value);
      this.updateSizeControls();
      this.updateViewToggle();
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

  updateViewToggle() {
    const viewToggleGroup = document.getElementById('view-toggle-group');
    if (this.dimensions === 3) {
      viewToggleGroup.style.display = 'block';
    } else {
      viewToggleGroup.style.display = 'none';
      this.setView('slices');
    }
  }

  setView(viewType) {
    this.view3D = (viewType === 'cube');
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view-${viewType}`).classList.add('active');
    
    // Show/hide containers
    document.getElementById('slices-container').style.display = this.view3D ? 'none' : 'block';
    document.getElementById('cube-container').style.display = this.view3D ? 'block' : 'none';
    
    this.renderView();
  }

  updateSizeControls() {
    const container = document.getElementById('size-controls');
    container.innerHTML = '';
    
    // Better default sizes for visibility
    const defaultSizes = {
      2: [16, 16],
      3: [6, 6, 6],
      4: [5, 5, 5, 5],
      5: [4, 4, 4, 4, 4]
    };
    
    this.sizes = defaultSizes[this.dimensions] || new Array(this.dimensions).fill(4);

    const dimLabels = ['Width', 'Height', 'Depth', 'Ana', 'Kata'];
    
    for (let i = 0; i < this.dimensions; i++) {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'control-group';
      controlDiv.innerHTML = `
        <label for="size-${i}">${dimLabels[i]}:</label>
        <input type="number" id="size-${i}" value="${this.sizes[i]}" min="3" max="12" class="size-input">
      `;
      container.appendChild(controlDiv);
      
      document.getElementById(`size-${i}`).addEventListener('change', (e) => {
        this.sizes[i] = parseInt(e.target.value);
        this.updateDimensionInfo();
      });
    }
  }

  updateDimensionInfo() {
    const dimNames = ['Grid', 'Cube', 'Tesseract', 'Hyperspace', 'Spacetime'];
    const sizeStr = this.sizes.slice(0, this.dimensions).join('×');
    const totalVolume = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
    
    document.getElementById('view-title').textContent = 
      this.dimensions === 3 && this.view3D ? '3D Cube View' : `${this.dimensions}D ${dimNames[this.dimensions - 1]} View`;
    document.getElementById('dimension-info').textContent = `${sizeStr} ${dimNames[this.dimensions - 1].toLowerCase()}`;
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
        case '3':
          if (this.dimensions === 3) {
            this.setView(this.view3D ? 'slices' : 'cube');
          }
          break;
        case 'Escape':
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
    const board = this.createBoard([this.sizes[0], this.sizes[1]], [], false, 'large');
    container.appendChild(board);
  }

  render3DSlices(container) {
    for (let z = 0; z < this.sizes[2]; z++) {
      const sliceWrapper = this.createSliceWrapper(`Layer ${z}`, [z]);
      const board = this.createBoard([this.sizes[0], this.sizes[1]], [z], false, 'medium');
      sliceWrapper.appendChild(board);
      container.appendChild(sliceWrapper);
    }
  }

  render3DCube() {
    const container = document.getElementById('cube-container');
    container.innerHTML = '';
    
    const cubeWrapper = document.createElement('div');
    cubeWrapper.className = 'cube-wrapper';
    
    // Create 3D cube visualization
    const cube = document.createElement('div');
    cube.className = 'cube';
    
    // Create 6 faces of the cube
    const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    const faceBoards = [];
    
    for (let i = 0; i < faces.length; i++) {
      const face = document.createElement('div');
      face.className = `cube-face cube-face-${faces[i]}`;
      
      // Determine which slice to show on each face
      let coords = [];
      switch(faces[i]) {
        case 'front': coords = [0]; break;
        case 'back': coords = [this.sizes[2] - 1]; break;
        case 'right': coords = [Math.floor(this.sizes[2] / 2)]; break;
        case 'left': coords = [Math.floor(this.sizes[2] / 2) - 1]; break;
        case 'top': coords = [Math.floor(this.sizes[2] / 3)]; break;
        case 'bottom': coords = [Math.floor(this.sizes[2] * 2 / 3)]; break;
      }
      
      const board = this.createBoard([this.sizes[0], this.sizes[1]], coords, false, 'small');
      face.appendChild(board);
      cube.appendChild(face);
    }
    
    // Add controls for rotating the cube
    const controls = document.createElement('div');
    controls.className = 'cube-controls';
    controls.innerHTML = `
      <div class="cube-control-group">
        <label>Rotate:</label>
        <button class="cube-control-btn" data-axis="x" data-dir="1">↑</button>
        <button class="cube-control-btn" data-axis="x" data-dir="-1">↓</button>
        <button class="cube-control-btn" data-axis="y" data-dir="1">←</button>
        <button class="cube-control-btn" data-axis="y" data-dir="-1">→</button>
      </div>
      <div class="cube-info">
        <p>3D visualization showing different layers on each face</p>
        <p>Press '3' to toggle between 2D slices and 3D cube</p>
      </div>
    `;
    
    cubeWrapper.appendChild(cube);
    cubeWrapper.appendChild(controls);
    container.appendChild(cubeWrapper);
    
    // Add cube rotation controls
    let rotationX = -15;
    let rotationY = 15;
    
    const updateRotation = () => {
      cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    };
    
    controls.querySelectorAll('.cube-control-btn').forEach(btn => {
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
    
    updateRotation();
  }

  render4D(container) {
    for (let w = 0; w < this.sizes[3]; w++) {
      const hypersliceWrapper = document.createElement('div');
      hypersliceWrapper.className = 'hyperslice-wrapper';
      
      const header = document.createElement('div');
      header.className = 'hyperslice-header';
      header.innerHTML = `<h3>Ana Slice ${w}</h3>`;
      
      const slicesGrid = document.createElement('div');
      slicesGrid.className = 'slices-grid';
      
      for (let z = 0; z < this.sizes[2]; z++) {
        const sliceWrapper = this.createSliceWrapper(`Layer ${z}`, [z, w]);
        const board = this.createBoard([this.sizes[0], this.sizes[1]], [z, w], false, 'small');
        sliceWrapper.appendChild(board);
        slicesGrid.appendChild(sliceWrapper);
      }
      
      hypersliceWrapper.appendChild(header);
      hypersliceWrapper.appendChild(slicesGrid);
      container.appendChild(hypersliceWrapper);
    }
  }

  render5D(container) {
    for (let v = 0; v < this.sizes[4]; v++) {
      const pentasliceWrapper = document.createElement('div');
      pentasliceWrapper.className = 'pentaslice-wrapper';
      
      const header = document.createElement('div');
      header.className = 'pentaslice-header';
      header.innerHTML = `<h3>Kata Slice ${v}</h3>`;
      
      const hyperslicesGrid = document.createElement('div');
      hyperslicesGrid.className = 'hyperslices-grid';
      
      for (let w = 0; w < this.sizes[3]; w++) {
        const hypersliceDiv = document.createElement('div');
        hypersliceDiv.className = 'nested-hyperslice';
        
        const subHeader = document.createElement('h4');
        subHeader.textContent = `Ana ${w}`;
        subHeader.className = 'nested-header';
        
        const slicesGrid = document.createElement('div');
        slicesGrid.className = 'nested-slices-grid';
        
        for (let z = 0; z < this.sizes[2]; z++) {
          const miniBoard = this.createBoard([this.sizes[0], this.sizes[1]], [z, w, v], false, 'tiny');
          slicesGrid.appendChild(miniBoard);
        }
        
        hypersliceDiv.appendChild(subHeader);
        hypersliceDiv.appendChild(slicesGrid);
        hyperslicesGrid.appendChild(hypersliceDiv);
      }
      
      pentasliceWrapper.appendChild(header);
      pentasliceWrapper.appendChild(hyperslicesGrid);
      container.appendChild(pentasliceWrapper);
    }
  }

  createSliceWrapper(title, coords) {
    const wrapper = document.createElement('div');
    wrapper.className = 'slice-wrapper';
    
    const header = document.createElement('div');
    header.className = 'slice-header';
    header.innerHTML = `<h3 class="slice-title">${title}</h3>`;
    
    wrapper.appendChild(header);
    return wrapper;
  }

  createBoard(gridSize, extraCoords, showIndicators = false, size = 'medium') {
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
      // Google-style mine generation with guaranteed safe area
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
      ready: 'Ready to play',
      playing: 'Playing...',
      won: '🎉 Victory!',
      lost: '💥 Game Over'
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
    
    // Create safe area around first click (like Google minesweeper)
    const safeArea = new Set();
    safeArea.add(this.coordsToKey(safeCoords));
    
    // Add all neighbors to safe area
    for (const neighborCoords of this.getNeighbors(safeCoords)) {
      safeArea.add(this.coordsToKey(neighborCoords));
    }
    
    // Available coordinates for mine placement
    const availableCoords = allCoords.filter(coords => 
      !safeArea.has(this.coordsToKey(coords))
    );
    
    // Place mines randomly in available area
    for (let i = 0; i < this.mineCount && availableCoords.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableCoords.length);
      const mineCoords = availableCoords.splice(randomIndex, 1)[0];
      const cell = this.getCell(mineCoords);
      cell.isMine = true;
    }
    
    // Calculate neighbor counts
    this.calculateNeighborCounts();
    this.minesGenerated = true;
    
    // Auto-reveal the safe area to give player a good start
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
    
    // Auto-reveal empty neighbors (flood fill)
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