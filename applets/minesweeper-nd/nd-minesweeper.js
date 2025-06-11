// applets/minesweeper-nd/nd-minesweeper.js
import { createButton } from '../shared/js/ui-components.js';
import { clamp } from '../shared/js/math-utils.js';

class NDMinesweeper {
  constructor(root) {
    this.root = root;
    this.dimensions = 2;
    this.sizes = [12, 12];
    this.mineCount = 20;
    this.customMineCount = null;
    this.game = null;
    this.gameState = 'ready';
    this.firstClick = true;
    this.view3D = false;
    this.selectedSlice = 0;
    this.cubeRotation = { x: -15, y: 25 };
    this.autoRotate = false;
    this.autoRotateSpeed = 0.5;
    
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
        <!-- Streamlined Controls -->
        <div class="controls-panel">
          <div class="primary-controls">
            <div class="control-group">
              <label>Dimensions</label>
              <select id="dimensions" class="control-select">
                <option value="2" selected>2D Classic</option>
                <option value="3">3D Cube</option>
                <option value="4">4D Tesseract</option>
                <option value="5">5D Hyperspace</option>
              </select>
            </div>

            <div class="control-group">
              <label>Difficulty</label>
              <select id="difficulty" class="control-select">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div class="action-controls">
              <button id="new-game" class="btn btn-primary">
                <i class="fas fa-play"></i> New Game
              </button>
              <button id="hint" class="btn btn-secondary">
                <i class="fas fa-lightbulb"></i> Hint
              </button>
            </div>
          </div>

          <div class="advanced-controls" id="advanced-controls">
            <div class="size-controls" id="size-controls"></div>
            
            <div class="control-group">
              <label>Mines</label>
              <input type="number" id="mine-count" value="20" min="1" max="999" class="control-input">
            </div>

            <div class="view-controls" id="view-controls" style="display: none;">
              <label>3D View</label>
              <div class="toggle-group">
                <button id="view-slices" class="toggle-btn active">
                  <i class="fas fa-th"></i> Grid
                </button>
                <button id="view-cube" class="toggle-btn">
                  <i class="fas fa-cube"></i> Cube
                </button>
              </div>
            </div>
          </div>

          <div class="game-status">
            <div class="status-item">
              <span class="status-icon" id="status-icon">🎮</span>
              <span class="status-text" id="game-status">Ready to Play</span>
            </div>
            <div class="stats-row">
              <div class="stat">
                <span class="stat-value" id="mines-left">20</span>
                <span class="stat-label">Mines</span>
              </div>
              <div class="stat">
                <span class="stat-value" id="cells-left">0</span>
                <span class="stat-label">Safe Cells</span>
              </div>
              <div class="stat">
                <span class="stat-value" id="timer">00:00</span>
                <span class="stat-label">Time</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Title with Dynamic Info -->
        <div class="game-header">
          <h1 id="title">2D Minesweeper</h1>
          <p id="subtitle">12×12 grid • Click to start</p>
        </div>

        <!-- Improved 3D Controls -->
        <div class="slice-controls" id="slice-controls" style="display: none;">
          <div class="slice-nav">
            <button id="slice-prev" class="slice-btn">
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="slice-info">
              <span id="slice-display">Layer 0</span>
              <input type="range" id="slice-slider" min="0" max="5" value="0" class="slice-slider">
            </div>
            <button id="slice-next" class="slice-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="view-options">
            <button id="auto-rotate" class="option-btn">
              <i class="fas fa-sync-alt"></i>
              <span>Auto Rotate</span>
            </button>
            <button id="reset-view" class="option-btn">
              <i class="fas fa-home"></i>
              <span>Reset View</span>
            </button>
          </div>
        </div>

        <!-- Game Container -->
        <div class="game-container">
          <!-- Grid View -->
          <div class="grid-view" id="grid-view">
            <div class="game-grid" id="game-grid"></div>
          </div>

          <!-- Enhanced 3D Cube View -->
          <div class="cube-view" id="cube-view" style="display: none;">
            <div class="cube-viewport">
              <div class="cube-scene">
                <div class="cube-container" id="cube-container">
                  <div class="cube" id="cube"></div>
                </div>
              </div>
              
              <div class="cube-overlay">
                <div class="layer-indicator">
                  <span id="current-layer">Layer 0</span>
                  <span id="layer-help">Use scroll wheel or slider to navigate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateControls();
    this.startTimer();
  }

  bindEvents() {
    // Dimension change
    document.getElementById('dimensions').addEventListener('change', (e) => {
      this.dimensions = parseInt(e.target.value);
      this.updateControls();
      this.customMineCount = null;
      this.newGame();
    });

    // View toggle
    document.getElementById('view-slices')?.addEventListener('click', () => this.setView('slices'));
    document.getElementById('view-cube')?.addEventListener('click', () => this.setView('cube'));

    // Game controls
    document.getElementById('new-game').addEventListener('click', () => this.newGame());
    document.getElementById('hint').addEventListener('click', () => this.showHint());

    // Settings
    document.getElementById('difficulty').addEventListener('change', () => {
      this.customMineCount = null;
      this.updateDifficulty();
      this.newGame();
    });

    document.getElementById('mine-count').addEventListener('change', (e) => {
      this.mineCount = parseInt(e.target.value);
      this.customMineCount = this.mineCount;
    });

    // Enhanced slice controls
    document.getElementById('slice-prev')?.addEventListener('click', () => this.changeSlice(-1));
    document.getElementById('slice-next')?.addEventListener('click', () => this.changeSlice(1));
    document.getElementById('slice-slider')?.addEventListener('input', (e) => {
      this.selectedSlice = parseInt(e.target.value);
      this.updateSliceDisplay();
      this.render3DCube();
    });

    // 3D view options
    document.getElementById('auto-rotate')?.addEventListener('click', () => this.toggleAutoRotate());
    document.getElementById('reset-view')?.addEventListener('click', () => this.resetRotation());

    // Enhanced cube interaction
    this.setupCubeInteraction();
  }

  setupCubeInteraction() {
    const cubeContainer = document.getElementById('cube-container');
    if (!cubeContainer) return;

    let isDragging = false;
    let startX, startY;
    let startRotationX, startRotationY;

    // Mouse controls
    cubeContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startRotationX = this.cubeRotation.x;
      startRotationY = this.cubeRotation.y;
      cubeContainer.style.cursor = 'grabbing';
      this.autoRotate = false;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging || this.autoRotate) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Constrained rotation to prevent invisibility
      this.cubeRotation.y = startRotationY + deltaX * 0.5;
      this.cubeRotation.x = clamp(startRotationX + deltaY * 0.5, -80, 20);
      this.updateCubeRotation();
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      if (cubeContainer) cubeContainer.style.cursor = 'grab';
    });

    // Scroll wheel for layer navigation
    cubeContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;
      this.changeSlice(direction);
    });

    // Touch controls
    let touchStartX, touchStartY;
    cubeContainer.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      startRotationX = this.cubeRotation.x;
      startRotationY = this.cubeRotation.y;
      this.autoRotate = false;
    });

    cubeContainer.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.autoRotate) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      this.cubeRotation.y = startRotationY + deltaX * 0.3;
      this.cubeRotation.x = clamp(startRotationX + deltaY * 0.3, -80, 20);
      this.updateCubeRotation();
    });
  }

  updateControls() {
    this.updateSizeControls();
    this.updateViewControls();
    this.updateTitle();
  }

  updateSizeControls() {
    const container = document.getElementById('size-controls');
    container.innerHTML = '';
    
    const defaultSizes = {
      2: [12, 12],
      3: [8, 8, 6],
      4: [6, 6, 4, 4],
      5: [4, 4, 4, 3, 3]
    };
    
    this.sizes = defaultSizes[this.dimensions] || new Array(this.dimensions).fill(4);
    const labels = ['Width', 'Height', 'Depth', 'W₄', 'W₅'];
    
    for (let i = 0; i < this.dimensions; i++) {
      const sizeGroup = document.createElement('div');
      sizeGroup.className = 'size-group';
      sizeGroup.innerHTML = `
        <label>${labels[i]}</label>
        <input type="number" id="size-${i}" value="${this.sizes[i]}" min="3" max="16" class="size-input">
      `;
      container.appendChild(sizeGroup);
      
      document.getElementById(`size-${i}`).addEventListener('change', (e) => {
        this.sizes[i] = parseInt(e.target.value);
        this.updateTitle();
      });
    }
  }

  updateViewControls() {
    const viewControls = document.getElementById('view-controls');
    if (this.dimensions === 3) {
      viewControls.style.display = 'block';
    } else {
      viewControls.style.display = 'none';
      this.setView('slices');
    }
  }

  updateTitle() {
    const dimensionNames = {
      2: '2D Classic',
      3: this.view3D ? '3D Interactive Cube' : '3D Grid View', 
      4: '4D Tesseract',
      5: '5D Hyperspace'
    };
    
    const sizeStr = this.sizes.slice(0, this.dimensions).join('×');
    const totalCells = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
    
    document.getElementById('title').textContent = dimensionNames[this.dimensions];
    
    let subtitle = `${sizeStr} • ${totalCells.toLocaleString()} cells`;
    if (this.gameState === 'ready') {
      subtitle += ' • Click to start';
    } else if (this.gameState === 'playing') {
      subtitle += ' • Find all mines!';
    }
    
    document.getElementById('subtitle').textContent = subtitle;
  }

  setView(viewType) {
    this.view3D = (viewType === 'cube');
    
    // Update buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`view-${viewType}`).classList.add('active');
    
    // Show/hide views
    document.getElementById('grid-view').style.display = this.view3D ? 'none' : 'block';
    document.getElementById('cube-view').style.display = this.view3D ? 'block' : 'none';
    
    // Show/hide slice controls
    const sliceControls = document.getElementById('slice-controls');
    if (this.view3D && this.dimensions === 3) {
      sliceControls.style.display = 'flex';
      this.updateSliceControls();
    } else {
      sliceControls.style.display = 'none';
    }
    
    this.updateTitle();
    this.renderView();
  }

  updateSliceControls() {
    const slider = document.getElementById('slice-slider');
    slider.max = this.sizes[2] - 1;
    slider.value = Math.min(this.selectedSlice, this.sizes[2] - 1);
    this.selectedSlice = parseInt(slider.value);
    this.updateSliceDisplay();
  }

  updateSliceDisplay() {
    document.getElementById('slice-display').textContent = `Layer ${this.selectedSlice}`;
    document.getElementById('current-layer').textContent = `Layer ${this.selectedSlice}`;
  }

  changeSlice(direction) {
    this.selectedSlice = clamp(this.selectedSlice + direction, 0, this.sizes[2] - 1);
    document.getElementById('slice-slider').value = this.selectedSlice;
    this.updateSliceDisplay();
    this.render3DCube();
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    const btn = document.getElementById('auto-rotate');
    btn.classList.toggle('active', this.autoRotate);
    
    if (this.autoRotate) {
      this.startAutoRotate();
    }
  }

  startAutoRotate() {
    if (!this.autoRotate || !this.view3D) return;
    this.cubeRotation.y += this.autoRotateSpeed;
    this.updateCubeRotation();
    requestAnimationFrame(() => this.startAutoRotate());
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch(e.key.toLowerCase()) {
        case 'n':
          this.newGame();
          break;
        case 'h':
          this.showHint();
          break;
        case '3':
          if (this.dimensions === 3) {
            this.setView(this.view3D ? 'slices' : 'cube');
          }
          break;
        case 'arrowleft':
          if (this.view3D) this.changeSlice(-1);
          break;
        case 'arrowright':
          if (this.view3D) this.changeSlice(1);
          break;
        case 'r':
          if (this.view3D) {
            if (e.shiftKey) {
              this.toggleAutoRotate();
            } else {
              this.resetRotation();
            }
          }
          break;
        case ' ':
          e.preventDefault();
          if (this.gameState === 'ready' || this.gameState === 'won' || this.gameState === 'lost') {
            this.newGame();
          }
          break;
      }
    });
  }

  startTimer() {
    this.startTime = null;
    this.timerInterval = setInterval(() => {
      if (this.gameState === 'playing' && this.startTime) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('timer').textContent = 
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  updateDifficulty() {
    if (this.customMineCount === null) {
      const difficulty = document.getElementById('difficulty').value;
      const totalCells = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
      const ratios = { easy: 0.1, medium: 0.15, hard: 0.2, expert: 0.25 };
      
      this.mineCount = Math.max(1, Math.floor(totalCells * ratios[difficulty]));
      document.getElementById('mine-count').value = this.mineCount;
    }
  }

  newGame() {
    if (this.customMineCount === null) {
      this.updateDifficulty();
    } else {
      this.mineCount = this.customMineCount;
    }
    
    this.game = new NDMinesweeperGame(this.dimensions, this.sizes.slice(0, this.dimensions), this.mineCount);
    this.gameState = 'ready';
    this.firstClick = true;
    this.startTime = null;
    
    if (this.view3D) this.updateSliceControls();
    this.renderView();
    this.updateGameInfo();
    this.updateTitle();
  }

  renderView() {
    if (this.view3D && this.dimensions === 3) {
      this.render3DCube();
    } else {
      this.renderGrid();
    }
  }

  renderGrid() {
    const container = document.getElementById('game-grid');
    const gridView = document.getElementById('grid-view');
    
    container.innerHTML = '';
    container.className = `game-grid dim-${this.dimensions}`;
    
    if (this.dimensions === 2) {
      const board = this.createBoard([this.sizes[0], this.sizes[1]], []);
      container.appendChild(board);
    } else {
      this.renderMultiDimensional(container);
    }
  }

  renderMultiDimensional(container) {
    const coords = this.generateSliceCoords();
    
    if (this.dimensions === 3) {
      coords.forEach((sliceCoords, index) => {
        const board = this.createBoard([this.sizes[0], this.sizes[1]], sliceCoords);
        
        const label = document.createElement('div');
        label.className = 'board-label';
        label.textContent = `Layer ${sliceCoords[0]}`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'board-wrapper';
        wrapper.appendChild(label);
        wrapper.appendChild(board);
        
        wrapper.style.opacity = '0';
        wrapper.style.animation = `fadeIn 0.3s ease ${index * 50}ms forwards`;
        
        container.appendChild(wrapper);
      });
    } else {
      // Handle 4D and 5D as before
      this.renderHigherDimensions(container, coords);
    }
  }

  renderHigherDimensions(container, coords) {
    // Similar to before but with improved labeling
    if (this.dimensions === 4) {
      const grouped = {};
      coords.forEach(coord => {
        const w = coord[1];
        if (!grouped[w]) grouped[w] = [];
        grouped[w].push(coord);
      });
      
      Object.entries(grouped).forEach(([w, coordsGroup]) => {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'dimension-group';
        
        const rowLabel = document.createElement('div');
        rowLabel.className = 'dimension-label';
        rowLabel.textContent = `4th Dimension: ${w}`;
        rowContainer.appendChild(rowLabel);
        
        const row = document.createElement('div');
        row.className = 'board-row';
        
        coordsGroup.forEach((sliceCoords, index) => {
          const board = this.createBoard([this.sizes[0], this.sizes[1]], sliceCoords);
          
          const label = document.createElement('div');
          label.className = 'board-label';
          label.textContent = `Layer ${sliceCoords[0]}`;
          
          const wrapper = document.createElement('div');
          wrapper.className = 'board-wrapper';
          wrapper.appendChild(label);
          wrapper.appendChild(board);
          
          wrapper.style.opacity = '0';
          wrapper.style.animation = `fadeIn 0.3s ease ${index * 30}ms forwards`;
          
          row.appendChild(wrapper);
        });
        
        rowContainer.appendChild(row);
        container.appendChild(rowContainer);
      });
    }
    // Similar improvements for 5D...
  }

  generateSliceCoords() {
    const coords = [];
    
    if (this.dimensions === 3) {
      for (let z = 0; z < this.sizes[2]; z++) {
        coords.push([z]);
      }
    } else if (this.dimensions === 4) {
      for (let w = 0; w < this.sizes[3]; w++) {
        for (let z = 0; z < this.sizes[2]; z++) {
          coords.push([z, w]);
        }
      }
    } else if (this.dimensions === 5) {
      for (let v = 0; v < this.sizes[4]; v++) {
        for (let w = 0; w < this.sizes[3]; w++) {
          for (let z = 0; z < this.sizes[2]; z++) {
            coords.push([z, w, v]);
          }
        }
      }
    }
    
    return coords;
  }

  render3DCube() {
    const cube = document.getElementById('cube');
    cube.innerHTML = '';
    
    // Much tighter spacing for better visibility
    const layerSpacing = 40; // Reduced from calculated spacing
    
    for (let z = 0; z < this.sizes[2]; z++) {
      const face = document.createElement('div');
      face.className = `cube-face face-${z}`;
      
      // Better positioning with tighter spacing
      const zPosition = (z - (this.sizes[2] - 1) / 2) * layerSpacing;
      face.style.transform = `translateZ(${zPosition}px)`;
      
      // Improved visibility based on selection
      const distance = Math.abs(z - this.selectedSlice);
      let opacity, scale;
      
      if (z === this.selectedSlice) {
        opacity = 1;
        scale = 1;
        face.classList.add('selected');
      } else {
        opacity = Math.max(0.2, 0.8 - distance * 0.2);
        scale = Math.max(0.95, 1 - distance * 0.02);
      }
      
      face.style.opacity = opacity;
      face.style.transform += ` scale(${scale})`;
      
      const board = this.createBoard([this.sizes[0], this.sizes[1]], [z]);
      board.className += ' cube-board';
      
      // Cleaner layer indicator
      const layerIndicator = document.createElement('div');
      layerIndicator.className = 'layer-indicator-small';
      layerIndicator.textContent = z;
      
      face.appendChild(layerIndicator);
      face.appendChild(board);
      cube.appendChild(face);
    }
    
    this.updateCubeRotation();
  }

  updateCubeRotation() {
    const cube = document.getElementById('cube');
    if (!cube) return;
    
    // Constrained rotation for better visibility
    const x = clamp(this.cubeRotation.x, -80, 20);
    const y = this.cubeRotation.y;
    
    cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
  }

  resetRotation() {
    this.cubeRotation = { x: -15, y: 25 };
    this.autoRotate = false;
    document.getElementById('auto-rotate')?.classList.remove('active');
    this.updateCubeRotation();
  }

  createBoard(gridSize, extraCoords) {
    const board = document.createElement('div');
    board.className = 'board';
    board.style.gridTemplateColumns = `repeat(${gridSize[0]}, 1fr)`;
    
    for (let y = 0; y < gridSize[1]; y++) {
      for (let x = 0; x < gridSize[0]; x++) {
        const coords = [x, y, ...extraCoords];
        const cell = this.game.getCell(coords);
        const cellElement = this.createCellElement(coords, cell);
        
        if (this.dimensions === 2) {
          if (x === gridSize[0] - 1) cellElement.classList.add('last-col');
          if (y === gridSize[1] - 1) cellElement.classList.add('last-row');
        }
        
        board.appendChild(cellElement);
      }
    }
    
    return board;
  }

  createCellElement(coords, cell) {
    const cellEl = document.createElement('div');
    cellEl.className = 'cell';
    cellEl.dataset.coords = JSON.stringify(coords);
    
    if (cell.revealed) {
      cellEl.classList.add('revealed');
      if (cell.isMine) {
        cellEl.classList.add('mine');
        cellEl.textContent = '💣';
      } else if (cell.neighborMines > 0) {
        cellEl.textContent = cell.neighborMines;
        cellEl.classList.add(`mines-${cell.neighborMines}`);
      }
    } else if (cell.flagged) {
      cellEl.classList.add('flagged');
      cellEl.textContent = '🚩';
    }
    
    cellEl.addEventListener('click', (e) => this.handleCellClick(e, coords));
    cellEl.addEventListener('contextmenu', (e) => this.handleCellRightClick(e, coords));
    
    // Enhanced touch support
    let touchTimer;
    let touchMoved = false;
    
    cellEl.addEventListener('touchstart', (e) => {
      touchMoved = false;
      touchTimer = setTimeout(() => {
        if (!touchMoved) {
          this.handleCellRightClick(e, coords);
        }
      }, 500);
    });
    
    cellEl.addEventListener('touchmove', () => {
      touchMoved = true;
      clearTimeout(touchTimer);
    });
    
    cellEl.addEventListener('touchend', (e) => {
      clearTimeout(touchTimer);
      if (!touchMoved) {
        e.preventDefault();
        this.handleCellClick(e, coords);
      }
    });
    
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
      this.startTime = Date.now();
    }
    
    const result = this.game.revealCell(coords);
    
    if (result.gameOver) {
      this.gameState = 'lost';
      this.revealAllMines();
      this.showGameEndAnimation('lost');
    } else if (result.won) {
      this.gameState = 'won';
      this.showGameEndAnimation('won');
    }
    
    this.renderView();
    this.updateGameInfo();
    this.updateTitle();
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
      if (cell.isMine) cell.revealed = true;
    }
  }

  updateGameInfo() {
    const statusMap = {
      ready: { text: 'Ready to Play', icon: '🎮' },
      playing: { text: 'Playing', icon: '⚡' },
      won: { text: 'Victory!', icon: '🎉' },
      lost: { text: 'Game Over', icon: '💥' }
    };
    
    const status = statusMap[this.gameState];
    document.getElementById('game-status').textContent = status.text;
    document.getElementById('status-icon').textContent = status.icon;
    document.getElementById('mines-left').textContent = this.game.getRemainingFlags();
    document.getElementById('cells-left').textContent = this.game.getRemainingCells();
    
    const statusEl = document.getElementById('game-status');
    statusEl.className = `status-text status-${this.gameState}`;
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
      
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cellEl => {
        const coords = JSON.parse(cellEl.dataset.coords);
        if (JSON.stringify(coords) === JSON.stringify(hintCoords)) {
          cellEl.classList.add('hint');
          cellEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => cellEl.classList.remove('hint'), 3000);
        }
      });
    }
  }

  showGameEndAnimation(result) {
    const overlay = document.createElement('div');
    overlay.className = 'game-end-overlay';
    overlay.innerHTML = `
      <div class="game-end-modal">
        <div class="end-icon">${result === 'won' ? '🏆' : '💥'}</div>
        <h2>${result === 'won' ? 'Victory!' : 'Game Over'}</h2>
        <p>${result === 'won' ? 'All mines cleared successfully!' : 'You hit a mine!'}</p>
        <button class="btn btn-primary" onclick="this.closest('.game-end-overlay').remove()">
          Continue
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
    }, 5000);
  }
}

// Game logic remains the same but with minor improvements
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
        isMine: false, revealed: false, flagged: false, neighborMines: 0
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

  coordsToKey(coords) { return coords.join(','); }
  getCell(coords) { return this.grid.get(this.coordsToKey(coords)); }

  generateMinesWithSafeArea(safeCoords) {
    if (this.minesGenerated) return;
    
    const allCoords = this.getAllCoords();
    const safeArea = new Set();
    safeArea.add(this.coordsToKey(safeCoords));
    
    // Create larger safe area
    for (const neighborCoords of this.getNeighbors(safeCoords)) {
      safeArea.add(this.coordsToKey(neighborCoords));
      for (const secondNeighbor of this.getNeighbors(neighborCoords)) {
        safeArea.add(this.coordsToKey(secondNeighbor));
      }
    }
    
    const availableCoords = allCoords.filter(coords => !safeArea.has(this.coordsToKey(coords)));
    const actualMineCount = Math.min(this.mineCount, availableCoords.length);
    
    for (let i = 0; i < actualMineCount && availableCoords.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableCoords.length);
      const mineCoords = availableCoords.splice(randomIndex, 1)[0];
      this.getCell(mineCoords).isMine = true;
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
    if (cell.revealed || cell.flagged) return { gameOver: false, won: false };
    
    cell.revealed = true;
    if (cell.isMine) return { gameOver: true, won: false };
    
    if (cell.neighborMines === 0) {
      for (const neighborCoords of this.getNeighbors(coords)) {
        const neighbor = this.getCell(neighborCoords);
        if (neighbor && !neighbor.revealed && !neighbor.flagged) {
          this.revealCell(neighborCoords);
        }
      }
    }
    
    return { gameOver: false, won: this.checkWinCondition() };
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
      if (!cell.isMine && !cell.revealed) return false;
    }
    return true;
  }

  getRemainingFlags() { return this.mineCount - this.flagCount; }
  
  getRemainingCells() {
    let unrevealed = 0;
    for (const coords of this.getAllCoords()) {
      const cell = this.getCell(coords);
      if (!cell.revealed && !cell.isMine) unrevealed++;
    }
    return unrevealed;
  }
}

// Initialize
new NDMinesweeper(document.getElementById('game-root'));