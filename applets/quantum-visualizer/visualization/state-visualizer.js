// visualization/state-visualizer.js
// Quantum state amplitude and probability visualization

import { QuantumMath } from '../utils/quantum-math.js';

export class StateVisualizer {
  constructor(container) {
    this.container = container;
    this.currentState = null;
    this.animationDuration = 300;
    this.maxBars = 16; // Limit for performance
    
    this.config = {
      colors: {
        positiveReal: '#3b82f6',
        negativeReal: '#ef4444', 
        positiveImag: '#8b5cf6',
        negativeImag: '#f59e0b',
        probability: '#10b981',
        phase: '#ec4899'
      },
      barHeight: 30,
      spacing: 8,
      labelWidth: 60,
      valueWidth: 80
    };
    
    this.setupContainer();
  }

  setupContainer() {
    this.container.className = 'state-visualizer';
    this.container.innerHTML = '';
    
    // Create header with controls
    this.createHeader();
    
    // Create main content area
    this.content = document.createElement('div');
    this.content.className = 'state-content';
    this.container.appendChild(this.content);
    
    // Create tooltip
    this.createTooltip();
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'state-header';
    
    // View mode selector
    const modeSelector = document.createElement('div');
    modeSelector.className = 'mode-selector';
    
    const modes = [
      { id: 'amplitude', label: 'Amplitudes', icon: '📊' },
      { id: 'probability', label: 'Probabilities', icon: '🎯' },
      { id: 'phase', label: 'Phases', icon: '🌊' }
    ];
    
    modes.forEach(mode => {
      const button = document.createElement('button');
      button.className = `mode-btn ${mode.id === 'amplitude' ? 'active' : ''}`;
      button.dataset.mode = mode.id;
      button.innerHTML = `${mode.icon} ${mode.label}`;
      button.addEventListener('click', () => this.setMode(mode.id));
      modeSelector.appendChild(button);
    });
    
    header.appendChild(modeSelector);
    
    // Sort options
    const sortSelector = document.createElement('div');
    sortSelector.className = 'sort-selector';
    
    const sortLabel = document.createElement('span');
    sortLabel.textContent = 'Sort:';
    sortSelector.appendChild(sortLabel);
    
    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';
    
    const sortOptions = [
      { value: 'index', label: 'By Index' },
      { value: 'magnitude', label: 'By Magnitude' },
      { value: 'probability', label: 'By Probability' },
      { value: 'phase', label: 'By Phase' }
    ];
    
    sortOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      sortSelect.appendChild(optionElement);
    });
    
    sortSelect.addEventListener('change', () => this.setSortMode(sortSelect.value));
    sortSelector.appendChild(sortSelect);
    header.appendChild(sortSelector);
    
    this.container.appendChild(header);
    
    // Store references
    this.modeButtons = modeSelector.querySelectorAll('.mode-btn');
    this.sortSelect = sortSelect;
    this.currentMode = 'amplitude';
    this.currentSort = 'index';
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'state-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  setMode(mode) {
    this.currentMode = mode;
    
    // Update button states
    this.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Re-render with new mode
    if (this.currentState) {
      this.updateState(this.currentState);
    }
  }

  setSortMode(sortMode) {
    this.currentSort = sortMode;
    
    // Re-render with new sort
    if (this.currentState) {
      this.updateState(this.currentState);
    }
  }

  updateState(state) {
    this.currentState = state;
    
    if (!state || state.length === 0) {
      this.showEmptyState();
      return;
    }
    
    // Limit number of bars for performance
    const displayState = state.length > this.maxBars ? 
      this.getTopStates(state, this.maxBars) : state;
    
    this.renderBars(displayState);
  }

  getTopStates(state, count) {
    // Get indices sorted by probability
    const indices = Array.from({length: state.length}, (_, i) => i);
    indices.sort((a, b) => {
      const probA = state[a].real * state[a].real + state[a].imag * state[a].imag;
      const probB = state[b].real * state[b].real + state[b].imag * state[b].imag;
      return probB - probA;
    });
    
    // Return top states with their original indices
    return indices.slice(0, count).map(i => ({
      ...state[i],
      originalIndex: i
    }));
  }

  showEmptyState() {
    this.content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌌</div>
        <h3>No Quantum State</h3>
        <p>Run an algorithm to see quantum state visualization</p>
      </div>
    `;
  }

  renderBars(state) {
    // Clear previous content
    this.content.innerHTML = '';
    
    // Create container for bars
    const barsContainer = document.createElement('div');
    barsContainer.className = 'bars-container';
    
    // Process and sort state data
    const processedState = this.processStateData(state);
    const sortedState = this.sortStateData(processedState);
    
    // Create bars
    sortedState.forEach((stateData, index) => {
      const bar = this.createBar(stateData, index);
      barsContainer.appendChild(bar);
    });
    
    this.content.appendChild(barsContainer);
    
    // Animate bars in
    this.animateBarsIn(barsContainer);
  }

  processStateData(state) {
    const numQubits = Math.log2(state.length);
    
    return state.map((amplitude, index) => {
      const originalIndex = amplitude.originalIndex !== undefined ? amplitude.originalIndex : index;
      const magnitude = QuantumMath.complexMagnitude(amplitude);
      const probability = magnitude * magnitude;
      const phase = QuantumMath.complexPhase(amplitude);
      const binaryLabel = originalIndex.toString(2).padStart(numQubits, '0');
      
      return {
        index: originalIndex,
        binaryLabel,
        amplitude,
        magnitude,
        probability,
        phase: phase * 180 / Math.PI, // Convert to degrees
        real: amplitude.real,
        imag: amplitude.imag
      };
    });
  }

  sortStateData(processedState) {
    switch (this.currentSort) {
      case 'magnitude':
        return [...processedState].sort((a, b) => b.magnitude - a.magnitude);
      case 'probability':
        return [...processedState].sort((a, b) => b.probability - a.probability);
      case 'phase':
        return [...processedState].sort((a, b) => b.phase - a.phase);
      case 'index':
      default:
        return [...processedState].sort((a, b) => a.index - b.index);
    }
  }

  createBar(stateData, index) {
    const barElement = document.createElement('div');
    barElement.className = 'state-bar';
    barElement.dataset.index = stateData.index;
    
    // Create bar structure
    barElement.innerHTML = `
      <div class="bar-label">
        <span class="binary-label">|${stateData.binaryLabel}⟩</span>
        <span class="decimal-label">${stateData.index}</span>
      </div>
      <div class="bar-visual">
        ${this.createBarVisualization(stateData)}
      </div>
      <div class="bar-values">
        ${this.createBarValues(stateData)}
      </div>
    `;
    
    // Add event listeners
    this.addBarEventListeners(barElement, stateData);
    
    return barElement;
  }

  createBarVisualization(stateData) {
    switch (this.currentMode) {
      case 'amplitude':
        return this.createAmplitudeVisualization(stateData);
      case 'probability':
        return this.createProbabilityVisualization(stateData);
      case 'phase':
        return this.createPhaseVisualization(stateData);
      default:
        return this.createAmplitudeVisualization(stateData);
    }
  }

  createAmplitudeVisualization(stateData) {
    const maxAmplitude = 1; // Maximum possible amplitude
    const realWidth = Math.abs(stateData.real / maxAmplitude) * 100;
    const imagWidth = Math.abs(stateData.imag / maxAmplitude) * 100;
    
    return `
      <div class="amplitude-bars">
        <div class="amplitude-component real">
          <div class="component-label">Re:</div>
          <div class="component-bar">
            <div class="component-fill ${stateData.real >= 0 ? 'positive' : 'negative'}" 
                 style="width: ${realWidth}%"></div>
          </div>
          <div class="component-value">${stateData.real.toFixed(3)}</div>
        </div>
        <div class="amplitude-component imaginary">
          <div class="component-label">Im:</div>
          <div class="component-bar">
            <div class="component-fill ${stateData.imag >= 0 ? 'positive' : 'negative'}" 
                 style="width: ${imagWidth}%"></div>
          </div>
          <div class="component-value">${stateData.imag.toFixed(3)}</div>
        </div>
      </div>
    `;
  }

  createProbabilityVisualization(stateData) {
    const width = stateData.probability * 100;
    
    return `
      <div class="probability-bar">
        <div class="probability-fill" style="width: ${width}%"></div>
        <div class="probability-text">${(stateData.probability * 100).toFixed(1)}%</div>
      </div>
    `;
  }

  createPhaseVisualization(stateData) {
    const normalizedPhase = ((stateData.phase % 360) + 360) % 360;
    const hue = normalizedPhase;
    const saturation = stateData.magnitude * 100;
    const lightness = 50;
    
    return `
      <div class="phase-bar">
        <div class="phase-circle" 
             style="background: hsl(${hue}, ${saturation}%, ${lightness}%)">
          <div class="phase-arrow" 
               style="transform: rotate(${normalizedPhase}deg)"></div>
        </div>
        <div class="phase-value">${normalizedPhase.toFixed(1)}°</div>
      </div>
    `;
  }

  createBarValues(stateData) {
    switch (this.currentMode) {
      case 'amplitude':
        return `
          <div class="value-item">
            <span class="value-label">|ψ|:</span>
            <span class="value-number">${stateData.magnitude.toFixed(3)}</span>
          </div>
        `;
      case 'probability':
        return `
          <div class="value-item">
            <span class="value-label">P:</span>
            <span class="value-number">${(stateData.probability * 100).toFixed(1)}%</span>
          </div>
        `;
      case 'phase':
        return `
          <div class="value-item">
            <span class="value-label">φ:</span>
            <span class="value-number">${stateData.phase.toFixed(1)}°</span>
          </div>
        `;
      default:
        return '';
    }
  }

  addBarEventListeners(barElement, stateData) {
    // Hover effects
    barElement.addEventListener('mouseenter', (e) => {
      this.showTooltip(e, stateData);
      barElement.classList.add('hovered');
    });

    barElement.addEventListener('mouseleave', () => {
      this.hideTooltip();
      barElement.classList.remove('hovered');
    });

    barElement.addEventListener('mousemove', (e) => {
      this.updateTooltipPosition(e);
    });

    // Click for detailed view
    barElement.addEventListener('click', () => {
      this.showDetailedView(stateData);
    });
  }

  showTooltip(event, stateData) {
    const tooltipContent = `
      <div class="tooltip-header">State |${stateData.binaryLabel}⟩</div>
      <div class="tooltip-content">
        <div class="tooltip-row">
          <span>Complex Amplitude:</span>
          <span>${QuantumMath.formatComplex(stateData.amplitude, 4)}</span>
        </div>
        <div class="tooltip-row">
          <span>Magnitude:</span>
          <span>${stateData.magnitude.toFixed(4)}</span>
        </div>
        <div class="tooltip-row">
          <span>Probability:</span>
          <span>${(stateData.probability * 100).toFixed(2)}%</span>
        </div>
        <div class="tooltip-row">
          <span>Phase:</span>
          <span>${stateData.phase.toFixed(1)}°</span>
        </div>
      </div>
    `;
    
    this.tooltip.innerHTML = tooltipContent;
    this.tooltip.style.display = 'block';
    this.updateTooltipPosition(event);
  }

  updateTooltipPosition(event) {
    const rect = this.container.getBoundingClientRect();
    const x = event.clientX - rect.left + 10;
    const y = event.clientY - rect.top - 10;
    
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  showDetailedView(stateData) {
    // Create modal with detailed information
    const modal = document.createElement('div');
    modal.className = 'state-detail-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Detailed View: |${stateData.binaryLabel}⟩</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Complex Representation</h4>
            <div class="complex-display">
              ${QuantumMath.formatComplex(stateData.amplitude, 6)}
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Polar Form</h4>
            <div class="polar-display">
              ${stateData.magnitude.toFixed(6)} × e^(i × ${(stateData.phase * Math.PI / 180).toFixed(4)})
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Properties</h4>
            <table class="properties-table">
              <tr><td>Real Part:</td><td>${stateData.real.toFixed(6)}</td></tr>
              <tr><td>Imaginary Part:</td><td>${stateData.imag.toFixed(6)}</td></tr>
              <tr><td>Magnitude:</td><td>${stateData.magnitude.toFixed(6)}</td></tr>
              <tr><td>Phase (degrees):</td><td>${stateData.phase.toFixed(2)}°</td></tr>
              <tr><td>Phase (radians):</td><td>${(stateData.phase * Math.PI / 180).toFixed(4)}</td></tr>
              <tr><td>Probability:</td><td>${(stateData.probability * 100).toFixed(4)}%</td></tr>
            </table>
          </div>
          
          <div class="detail-section">
            <h4>Bloch Sphere (Single Qubit)</h4>
            <div class="bloch-coordinates">
              ${this.getBlochCoordinates(stateData)}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  getBlochCoordinates(stateData) {
    // This is a simplified calculation for educational purposes
    // In practice, single qubit Bloch coordinates require the full 2D state
    if (this.currentState.length !== 2) {
      return '<p>Bloch sphere representation only available for single-qubit systems</p>';
    }
    
    const alpha = this.currentState[0];
    const beta = this.currentState[1];
    
    const x = 2 * (alpha.real * beta.real + alpha.imag * beta.imag);
    const y = 2 * (alpha.imag * beta.real - alpha.real * beta.imag);
    const z = alpha.real * alpha.real + alpha.imag * alpha.imag - 
             beta.real * beta.real - beta.imag * beta.imag;
    
    return `
      <table class="bloch-table">
        <tr><td>X coordinate:</td><td>${x.toFixed(4)}</td></tr>
        <tr><td>Y coordinate:</td><td>${y.toFixed(4)}</td></tr>
        <tr><td>Z coordinate:</td><td>${z.toFixed(4)}</td></tr>
      </table>
    `;
  }

  animateBarsIn(container) {
    const bars = container.querySelectorAll('.state-bar');
    
    bars.forEach((bar, index) => {
      bar.style.opacity = '0';
      bar.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        bar.style.transition = `opacity ${this.animationDuration}ms ease, transform ${this.animationDuration}ms ease`;
        bar.style.opacity = '1';
        bar.style.transform = 'translateX(0)';
      }, index * 50);
    });
  }

  // Animation for state changes
  animateStateChange(oldState, newState) {
    if (!oldState || !newState) {
      this.updateState(newState);
      return;
    }
    
    // Animate changes in amplitude
    const bars = this.content.querySelectorAll('.state-bar');
    
    bars.forEach((bar, index) => {
      const stateIndex = parseInt(bar.dataset.index);
      
      if (stateIndex < newState.length) {
        const oldAmplitude = oldState[stateIndex] || {real: 0, imag: 0};
        const newAmplitude = newState[stateIndex];
        
        this.animateBarChange(bar, oldAmplitude, newAmplitude);
      }
    });
  }

  animateBarChange(barElement, oldAmplitude, newAmplitude) {
    const fills = barElement.querySelectorAll('.component-fill, .probability-fill');
    
    fills.forEach(fill => {
      // Add glow effect during change
      fill.style.boxShadow = '0 0 10px currentColor';
      
      setTimeout(() => {
        fill.style.boxShadow = '';
      }, this.animationDuration);
    });
  }

  // Statistics display
  showStatistics(state) {
    const stats = this.calculateStatistics(state);
    
    const statsElement = document.createElement('div');
    statsElement.className = 'state-statistics';
    statsElement.innerHTML = `
      <h4>State Statistics</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Total Probability:</span>
          <span class="stat-value">${(stats.totalProbability * 100).toFixed(2)}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Entropy:</span>
          <span class="stat-value">${stats.entropy.toFixed(4)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Dominant State:</span>
          <span class="stat-value">|${stats.dominantState}⟩</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Non-zero States:</span>
          <span class="stat-value">${stats.nonZeroStates}</span>
        </div>
      </div>
    `;
    
    return statsElement;
  }

  calculateStatistics(state) {
    let totalProbability = 0;
    let entropy = 0;
    let maxProbability = 0;
    let dominantStateIndex = 0;
    let nonZeroStates = 0;
    
    const numQubits = Math.log2(state.length);
    
    state.forEach((amplitude, index) => {
      const probability = amplitude.real * amplitude.real + amplitude.imag * amplitude.imag;
      totalProbability += probability;
      
      if (probability > 0.001) {
        nonZeroStates++;
        entropy -= probability * Math.log2(probability);
      }
      
      if (probability > maxProbability) {
        maxProbability = probability;
        dominantStateIndex = index;
      }
    });
    
    const dominantState = dominantStateIndex.toString(2).padStart(numQubits, '0');
    
    return {
      totalProbability,
      entropy,
      dominantState,
      nonZeroStates
    };
  }

  // Export functionality
  exportData() {
    if (!this.currentState) return null;
    
    const processedState = this.processStateData(this.currentState);
    const stats = this.calculateStatistics(this.currentState);
    
    return {
      timestamp: new Date().toISOString(),
      mode: this.currentMode,
      sort: this.currentSort,
      state: processedState,
      statistics: stats,
      formatted: QuantumMath.formatState(this.currentState)
    };
  }

  // Cleanup
  destroy() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    
    // Remove any remaining modals
    const modals = document.querySelectorAll('.state-detail-modal');
    modals.forEach(modal => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });
  }
}