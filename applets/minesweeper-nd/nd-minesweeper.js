// applets/minesweeper-nd/nd-minesweeper.js
import { createButton } from '../shared/js/ui-components.js';
import { clamp } from '../shared/js/math-utils.js';

class NDMinesweeper {
  constructor(root) {
    this.root = root;
    this.dimensions = 2;
    this.sizes = [12, 12];
    this.mineCount = 20;
    this.customMineCount = null; // Track if user set custom mine count
    this.game = null;
    this.gameState = 'ready';
    this.firstClick = true;
    this.view3D = false;
    this.selectedSlice = 0;
    this.cubeRotation = { x: -15, y: 25 };
    this.autoRotate = false;
    this.particles = [];
    
    this.init();
  }

  init() {
    this.createUI();
    this.createParticles();
    this.newGame();
    this.setupKeyboardControls();
    this.animateParticles();
  }

  createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (20 + Math.random() * 10) + 's';
      particle.style.width = particle.style.height = (2 + Math.random() * 4) + 'px';
      particle.style.background = `rgba(${Math.random() > 0.5 ? '99, 102, 241' : '236, 72, 153'}, ${0.3 + Math.random() * 0.4})`;
      particlesContainer.appendChild(particle);
      this.particles.push(particle);
    }
  }

  animateParticles() {
    this.particles.forEach((particle, i) => {
      if (Math.random() > 0.98) {
        particle.style.background = `rgba(${Math.random() > 0.5 ? '99, 102, 241' : '236, 72, 153'}, ${0.3 + Math.random() * 0.4})`;
      }
    });
    requestAnimationFrame(() => this.animateParticles());
  }

  createUI() {
    this.root.innerHTML = `
      <div class="nd-minesweeper">
        <!-- Enhanced Controls -->
        <div class="controls-header">
          <div class="control-group">
            <label>Dimensions</label>
            <select id="dimensions" class="control-select">
              <option value="2" selected>2D</option>
              <option value="3">3D</option>
              <option value="4">4D</option>
              <option value="5">5D</option>
            </select>
          </div>

          <div class="control-group" id="view-toggle-group" style="display: none;">
            <label>View</label>
            <div class="toggle-group">
              <button id="view-slices" class="toggle-btn active">Grid</button>
              <button id="view-cube" class="toggle-btn">Cube</button>
            </div>
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

          <div class="size-controls" id="size-controls"></div>

          <div class="control-group">
            <label>Mines</label>
            <input type="number" id="mine-count" value="20" min="1" max="999" class="control-input">
          </div>

          <div class="action-group">
            <button id="new-game" class="btn btn-primary">New Game</button>
            <button id="hint" class="btn btn-secondary">Hint</button>
          </div>

          <div class="game-stats">
            <div class="stat">
              <span class="stat-value" id="game-status">Ready</span>
              <span class="stat-label">Status</span>
            </div>
            <div class="stat">
              <span class="stat-value" id="mines-left">20</span>
              <span class="stat-label">Mines</span>
            </div>
            <div class="stat">
              <span class="stat-value" id="cells-left">0</span>
              <span class="stat-label">Safe</span>
            </div>
          </div>
        </div>

        <!-- Game Title -->
        <div class="game-title">
          <h1 id="title">2D Minesweeper</h1>
          <p id="subtitle">12×12 grid</p>
        </div>

        <!-- Enhanced 3D Cube Slice Selector -->
        <div class="slice-controls" id="slice-controls" style="display: none;">
          <label>Layer</label>
          <div class="slice-selector">
            <button id="slice-prev" class="slice-btn">‹</button>
            <input type="range" id="slice-slider" min="0" max="5" value="0" class="slider">
            <button id="slice-next" class="slice-btn">›</button>
            <span id="slice-display">0</span>
          </div>
        </div>

        <!-- Game View -->
        <div class="game-container">
          <!-- Grid View -->
          <div class="grid-view" id="grid-view">
            <div class="game-grid" id="game-grid"></div>
          </div>

          <!-- 3D Cube View -->
          <div class="cube-view" id="cube-view" style="display: none;">
            <div class="cube-scene">
              <div class="cube-container">
                <div class="cube" id="cube"></div>
              </div>
              <div class="cube-controls">
                <div class="rotate-controls">
                  <button class="rotate-btn" data-axis="x" data-dir="-1">↑</button>
                  <div class="rotate-row">
                    <button class="rotate-btn" data-axis="y" data-dir="1">←</button>
                    <button class="rotate-btn" id="reset-rotation">⌂</button>
                    <button class="rotate-btn" data-axis="y" data-dir="-1">→</button>
                  </div>
                  <button class="rotate-btn" data-axis="x" data-dir="1">↓</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateControls();
  }

  bindEvents() {
    // Dimension change - auto new game
    document.getElementById('dimensions').addEventListener('change', (e) => {
      this.dimensions = parseInt(e.target.value);
      this.updateControls();
      this.customMineCount = null; // Reset custom mine count on dimension change
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
      this.customMineCount = null; // Reset custom mine count on difficulty change
      this.updateDifficulty();
      this.newGame();
    });

    document.getElementById('mine-count').addEventListener('change', (e) => {
      this.mineCount = parseInt(e.target.value);
      this.customMineCount = this.mineCount; // Mark as custom set
    });

    // Slice controls
    document.getElementById('slice-prev')?.addEventListener('click', () => this.changeSlice(-1));
    document.getElementById('slice-next')?.addEventListener('click', () => this.changeSlice(1));
    document.getElementById('slice-slider')?.addEventListener('input', (e) => {
      this.selectedSlice = parseInt(e.target.value);
      this.updateSliceDisplay();
      this.updateSliderProgress();
      this.render3DCube();
    });

    // Cube rotation
    document.getElementById('reset-rotation')?.addEventListener('click', () => this.resetRotation());
    document.querySelectorAll('.rotate-btn[data-axis]').forEach(btn => {
      btn.addEventListener('click', () => {
        const axis = btn.dataset.axis;
        const dir = parseInt(btn.dataset.dir);
        this.rotateView(axis, dir);
      });
    });

    // Auto-rotate with mouse
    const cubeContainer = document.querySelector('.cube-container');
    if (cubeContainer) {
      let isDragging = false;
      let startX, startY;
      let startRotationX, startRotationY;

      cubeContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startRotationX = this.cubeRotation.x;
        startRotationY = this.cubeRotation.y;
        cubeContainer.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        this.cubeRotation.y = startRotationY + deltaX * 0.5;
        this.cubeRotation.x = clamp(startRotationX + deltaY * 0.5, -90, 90);
        this.updateCubeRotation();
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        if (cubeContainer) cubeContainer.style.cursor = 'grab';
      });
    }
  }

  updateSliderProgress() {
    const slider = document.getElementById('slice-slider');
    const percent = (this.selectedSlice / (this.sizes[2] - 1)) * 100;
    slider.style.setProperty('--progress', percent + '%');
  }

  updateControls() {
    this.updateSizeControls();
    this.updateViewToggle();
    this.updateTitle();
  }

  updateSizeControls() {
    const container = document.getElementById('size-controls');
    container.innerHTML = '';
    
    const defaultSizes = {
      2: [12, 12],
      3: [6, 6, 6],
      4: [5, 5, 4, 4],
      5: [4, 4, 3, 3, 3]
    };
    
    this.sizes = defaultSizes[this.dimensions] || new Array(this.dimensions).fill(4);
    const labels = ['W', 'H', 'D', 'W₄', 'W₅'];
    
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

  updateViewToggle() {
    const viewToggle = document.getElementById('view-toggle-group');
    if (this.dimensions === 3) {
      viewToggle.style.display = 'block';
    } else {
      viewToggle.style.display = 'none';
      this.setView('slices');
    }
  }

  updateTitle() {
    const dimensionNames = ['2D Minesweeper', '3D Cube', '4D Tesseract', '5D Hyperspace'];
    const sizeStr = this.sizes.slice(0, this.dimensions).join('×');
    const totalCells = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
    
    document.getElementById('title').textContent = 
      this.view3D && this.dimensions === 3 ? '3D Interactive Cube' : dimensionNames[this.dimensions - 2];
    document.getElementById('subtitle').textContent = `${sizeStr} (${totalCells.toLocaleString()} cells)`;
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
    this.updateSliderProgress();
  }

  updateSliceDisplay() {
    document.getElementById('slice-display').textContent = this.selectedSlice;
  }

  changeSlice(direction) {
    this.selectedSlice = clamp(this.selectedSlice + direction, 0, this.sizes[2] - 1);
    document.getElementById('slice-slider').value = this.selectedSlice;
    this.updateSliceDisplay();
    this.updateSliderProgress();
    this.render3DCube();
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
          if (this.view3D && e.shiftKey) {
            this.autoRotate = !this.autoRotate;
            if (this.autoRotate) this.startAutoRotate();
          }
          break;
      }
    });
  }

  startAutoRotate() {
    if (!this.autoRotate) return;
    this.cubeRotation.y += 1;
    this.updateCubeRotation();
    requestAnimationFrame(() => this.startAutoRotate());
  }

  updateDifficulty() {
    // Only update mine count if user hasn't set a custom value
    if (this.customMineCount === null) {
      const difficulty = document.getElementById('difficulty').value;
      const totalCells = this.sizes.slice(0, this.dimensions).reduce((a, b) => a * b, 1);
      const ratios = { easy: 0.1, medium: 0.15, hard: 0.2, expert: 0.25 };
      
      this.mineCount = Math.max(1, Math.floor(totalCells * ratios[difficulty]));
      document.getElementById('mine-count').value = this.mineCount;
    }
  }

  newGame() {
    // Preserve custom mine count if set
    if (this.customMineCount === null) {
      this.updateDifficulty();
    } else {
      this.mineCount = this.customMineCount;
    }
    
    this.game = new NDMinesweeperGame(this.dimensions, this.sizes.slice(0, this.dimensions), this.mineCount);
    this.gameState = 'ready';
    this.firstClick = true;
    
    if (this.view3D) this.updateSliceControls();
    this.renderView();
    this.updateGameInfo();
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
    
    coords.forEach((sliceCoords, index) => {
      const board = this.createBoard([this.sizes[0], this.sizes[1]], sliceCoords);
      board.className += ` board-${this.getBoardSize()}`;
      
      const label = document.createElement('div');
      label.className = 'board-label';
      label.textContent = this.getSliceLabel(sliceCoords);
      
      const wrapper = document.createElement('div');
      wrapper.className = 'board-wrapper';
      wrapper.appendChild(label);
      wrapper.appendChild(board);
      
      // Add entrance animation
      wrapper.style.animationDelay = `${index * 50}ms`;
      wrapper.style.animation = 'fadeInUp 0.5s ease forwards';
      
      container.appendChild(wrapper);
    });
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

  getSliceLabel(coords) {
    if (this.dimensions === 3) return `Z${coords[0]}`;
    if (this.dimensions === 4) return `Z${coords[0]}W${coords[1]}`;
    if (this.dimensions === 5) return `Z${coords[0]}W${coords[1]}V${coords[2]}`;
    return '';
  }

  getBoardSize() {
    if (this.dimensions === 2) return 'large';
    if (this.dimensions === 3) return 'medium';
    if (this.dimensions === 4) return 'small';
    return 'tiny';
  }

  render3DCube() {
    const cube = document.getElementById('cube');
    cube.innerHTML = '';
    
    // Create enhanced 3D cube faces
    for (let z = 0; z < this.sizes[2]; z++) {
      const face = document.createElement('div');
      face.className = `cube-face face-${z}`;
      
      // Enhanced opacity and effects for selected layer
      if (z === this.selectedSlice) {
        face.style.opacity = '1';
        face.style.filter = 'brightness(1)';
        face.classList.add('selected');
      } else {
        const distance = Math.abs(z - this.selectedSlice);
        face.style.opacity = Math.max(0.2, 0.8 - distance * 0.2);
        face.style.filter = `brightness(${0.7 - distance * 0.1})`;
      }
      
      const board = this.createBoard([this.sizes[0], this.sizes[1]], [z]);
      board.className += ' cube-board';
      
      // Add layer indicator
      const layerIndicator = document.createElement('div');
      layerIndicator.className = 'layer-indicator';
      layerIndicator.textContent = `Layer ${z}`;
      layerIndicator.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(99, 102, 241, 0.8);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: ${z === this.selectedSlice ? 1 : 0.5};
      `;
      
      face.appendChild(layerIndicator);
      face.appendChild(board);
      
      cube.appendChild(face);
    }
    
    this.updateCubeRotation();
  }

  updateCubeRotation() {
    const cube = document.getElementById('cube');
    cube.style.transform = `rotateX(${this.cubeRotation.x}deg) rotateY(${this.cubeRotation.y}deg)`;
  }

  rotateView(axis, direction) {
    this.cubeRotation[axis] += direction * 15;
    this.updateCubeRotation();
  }

  resetRotation() {
    this.cubeRotation = { x: -15, y: 25 };
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
    
    // Add touch support
    let touchTimer;
    cellEl.addEventListener('touchstart', (e) => {
      touchTimer = setTimeout(() => {
        this.handleCellRightClick(e, coords);
      }, 500);
    });
    
    cellEl.addEventListener('touchend', () => {
      clearTimeout(touchTimer);
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
      ready: 'Ready',
      playing: 'Playing',
      won: 'Won!',
      lost: 'Lost'
    };
    
    document.getElementById('game-status').textContent = statusMap[this.gameState];
    document.getElementById('mines-left').textContent = this.game.getRemainingFlags();
    document.getElementById('cells-left').textContent = this.game.getRemainingCells();
    
    const statusEl = document.getElementById('game-status');
    statusEl.className = `stat-value status-${this.gameState}`;
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
      
      // Visual hint effect
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
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.5s ease;
    `;
    
    const message = document.createElement('div');
    message.className = 'game-end-message';
    message.style.cssText = `
      background: ${result === 'won' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
      color: white;
      padding: 2rem 4rem;
      border-radius: 1rem;
      font-size: 2rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: bounceIn 0.6s ease;
    `;
    message.textContent = result === 'won' ? 'Victory!' : 'Game Over';
    
    overlay.appendChild(message);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.animation = 'fadeOut 0.5s ease';
      setTimeout(() => overlay.remove(), 500);
    }, 2000);
  }
}

// Same game logic class as before
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
    
    // Create larger safe area for better first click experience
    for (const neighborCoords of this.getNeighbors(safeCoords)) {
      safeArea.add(this.coordsToKey(neighborCoords));
      // Add second layer of safety
      for (const secondNeighbor of this.getNeighbors(neighborCoords)) {
        safeArea.add(this.coordsToKey(secondNeighbor));
      }
    }
    
    const availableCoords = allCoords.filter(coords => !safeArea.has(this.coordsToKey(coords)));
    
    // Ensure we don't try to place more mines than available cells
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

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Initialize
new NDMinesweeper(document.getElementById('game-root'));