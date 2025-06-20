// visualization/state-visualizer.js
// Enhanced quantum state visualization with better performance and clear limits

import { QuantumMath } from '../utils/quantum-math.js';

export class StateVisualizer {
  constructor(container) {
    this.container = container;
    this.currentState = null;
    this.animationDuration = 300;
    this.maxBars = 32; // Increased limit with clear communication
    this.showTruncationWarning = false;
    
    this.config = {
      colors: {
        positiveReal: '#3b82f6',
        negativeReal: '#ef4444', 
        positiveImag: '#8b5cf6',
        negativeImag: '#f59e0b',
        probability: '#10b981',
        phase: '#ec4899',
        truncated: '#64748b'
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
    
    // Sort and display options
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
    
    // Display limit selector
    const limitSelector = document.createElement('div');
    limitSelector.className = 'limit-selector';
    
    const limitLabel = document.createElement('span');
    limitLabel.textContent = 'Show:';
    limitSelector.appendChild(limitLabel);
    
    const limitSelect = document.createElement('select');
    limitSelect.className = 'limit-select';
    
    const limitOptions = [
      { value: '8', label: 'Top 8' },
      { value: '16', label: 'Top 16' },
      { value: '32', label: 'Top 32' },
      { value: 'all', label: 'All States' }
    ];
    
    limitOptions.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      if (option.value === '16') optionElement.selected = true;
      limitSelect.appendChild(optionElement);
    });
    
    limitSelect.addEventListener('change', () => {
      this.maxBars = limitSelect.value === 'all' ? Infinity : parseInt(limitSelect.value);
      if (this.currentState) {
        this.updateState(this.currentState);
      }
    });
    
    limitSelector.appendChild(limitSelect);
    header.appendChild(limitSelector);
    
    this.container.appendChild(header);
    
    // Store references
    this.modeButtons = modeSelector.querySelectorAll('.mode-btn');
    this.sortSelect = sortSelect;
    this.limitSelect = limitSelect;
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
    
    // Check if we need to truncate and warn user
    this.showTruncationWarning = state.length > this.maxBars && this.maxBars !== Infinity;
    
    // Get states to display (either all or top N by probability)
    const displayStates = this.getStatesToDisplay(state);
    
    this.renderBars(displayStates);
    
    // Show truncation warning if needed
    if (this.showTruncationWarning) {
      this.showTruncationInfo(state.length, displayStates.length);
    }
  }

  getStatesToDisplay(state) {
    if (this.maxBars === Infinity || state.length <= this.maxBars) {
      return state.map((amplitude, index) => ({...amplitude, originalIndex: index}));
    }
    
    // Calculate probabilities and get top N states
    const statesWithProb = state.map((amplitude, index) => ({
      amplitude,
      originalIndex: index,
      probability: QuantumMath.complexMagnitude(amplitude) ** 2
    }));
    
    // Sort by probability (descending) and take top maxBars
    statesWithProb.sort((a, b) => b.probability - a.probability);
    
    return statesWithProb.slice(0, this.maxBars).map(item => ({
      ...item.amplitude,
      originalIndex: item.originalIndex
    }));
  }

  showTruncationInfo(totalStates, shownStates) {
    let infoElement = this.content.querySelector('.truncation-info');
    
    if (!infoElement) {
      infoElement = document.createElement('div');
      infoElement.className = 'truncation-info';
      this.content.insertBefore(infoElement, this.content.firstChild);
    }
    
    const hiddenStates = totalStates - shownStates;
    const maxQubits = Math.log2(this.maxBars);
    
    infoElement.innerHTML = `
      <div class="info-banner">
        <i class="fas fa-info-circle"></i>
        <span>
          Showing top ${shownStates} of ${totalStates} states (${hiddenStates} hidden). 
          For better performance with ${Math.log2(totalStates)}-qubit systems, 
          increase the limit or focus on states with higher probability.
        </span>
        <button class="btn-show-all" onclick="this.parentElement.parentElement.parentElement.querySelector('.limit-select').value='all'; this.parentElement.parentElement.parentElement.querySelector('.limit-select').dispatchEvent(new Event('change'))">
          Show All
        </button>
      </div>
    `;
  }

  removeTruncationInfo() {
    const infoElement = this.content.querySelector('.truncation-info');
    if (infoElement) {
      infoElement.remove();
    }
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
    
    // Remove truncation info if not needed
    if (!this.showTruncationWarning) {
      this.removeTruncationInfo();
    }
    
    // Show truncation info if needed
    if (this.showTruncationWarning) {
      this.showTruncationInfo(this.currentState.length, state.length);
    }
    
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
    const numQubits = Math.log2(this.currentState.length);
    
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
    
    // Add truncated indicator if this state was in the truncated set
    if (this.showTruncationWarning && stateData.probability < 0.001) {
      barElement.classList.add('truncated-state');
    }
    
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
          <div class="component-value">${QuantumMath.formatNumber(stateData.real, 3)}</div>
        </div>
        <div class="amplitude-component imaginary">
          <div class="component-label">Im:</div>
          <div class="component-bar">
            <div class="component-fill ${stateData.imag >= 0 ? 'positive' : 'negative'}" 
                 style="width: ${imagWidth}%"></div>
          </div>
          <div class="component-value">${QuantumMath.formatNumber(stateData.imag, 3)}</div>
        </div>
      </div>
    `;
  }

  createProbabilityVisualization(stateData) {
    const width = stateData.probability * 100;
    const isSignificant = stateData.probability > 0.001;
    
    return `
      <div class="probability-bar ${!isSignificant ? 'low-probability' : ''}">
        <div class="probability-fill" style="width: ${width}%"></div>
        <div class="probability-text">${QuantumMath.formatPercentage(stateData.probability, 2)}</div>
      </div>
    `;
  }

  createPhaseVisualization(stateData) {
    const normalizedPhase = ((stateData.phase % 360) + 360) % 360;
    const hue = normalizedPhase;
    const saturation = Math.min(stateData.magnitude * 100, 100);
    const lightness = 50;
    
    return `
      <div class="phase-bar">
        <div class="phase-circle" 
             style="background: hsl(${hue}, ${saturation}%, ${lightness}%); opacity: ${Math.max(stateData.magnitude, 0.1)}">
          <div class="phase-arrow" 
               style="transform: translate(-50%, -100%) rotate(${normalizedPhase}deg)"></div>
        </div>
        <div class="phase-value">${QuantumMath.formatNumber(normalizedPhase, 1)}°</div>
      </div>
    `;
  }

  createBarValues(stateData) {
    const magnitude = QuantumMath.formatNumber(stateData.magnitude, 4);
    const probability = QuantumMath.formatPercentage(stateData.probability, 2);
    const phase = QuantumMath.formatNumber(stateData.phase, 1);
    
    switch (this.currentMode) {
      case 'amplitude':
        return `
          <div class="value-item">
            <span class="value-label">|ψ|:</span>
            <span class="value-number">${magnitude}</span>
          </div>
          <div class="value-item">
            <span class="value-label">P:</span>
            <span class="value-number">${probability}</span>
          </div>
        `;
      case 'probability':
        return `
          <div class="value-item">
            <span class="value-label">P:</span>
            <span class="value-number">${probability}</span>
          </div>
          <div class="value-item">
            <span class="value-label">|ψ|:</span>
            <span class="value-number">${magnitude}</span>
          </div>
        `;
      case 'phase':
        return `
          <div class="value-item">
            <span class="value-label">φ:</span>
            <span class="value-number">${phase}°</span>
          </div>
          <div class="value-item">
            <span class="value-label">|ψ|:</span>
            <span class="value-number">${magnitude}</span>
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
      <div class="tooltip-header">State |${stateData.binaryLabel}⟩ (Index ${stateData.index})</div>
      <div class="tooltip-content">
        <div class="tooltip-row">
          <span>Complex Amplitude:</span>
          <span>${QuantumMath.formatComplex(stateData.amplitude, 4)}</span>
        </div>
        <div class="tooltip-row">
          <span>Magnitude:</span>
          <span>${QuantumMath.formatNumber(stateData.magnitude, 4)}</span>
        </div>
        <div class="tooltip-row">
          <span>Probability:</span>
          <span>${QuantumMath.formatPercentage(stateData.probability, 3)}</span>
        </div>
        <div class="tooltip-row">
          <span>Phase:</span>
          <span>${QuantumMath.formatNumber(stateData.phase, 2)}°</span>
        </div>
        <div class="tooltip-row">
          <span>Polar Form:</span>
          <span>${QuantumMath.formatNumber(stateData.magnitude, 3)}∠${QuantumMath.formatNumber(stateData.phase, 1)}°</span>
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
    
    // Keep tooltip within container bounds
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    let finalX = x;
    let finalY = y;
    
    if (x + tooltipRect.width > containerRect.width) {
      finalX = x - tooltipRect.width - 20;
    }
    
    if (y + tooltipRect.height > containerRect.height) {
      finalY = y - tooltipRect.height - 20;
    }
    
    this.tooltip.style.left = `${Math.max(0, finalX)}px`;
    this.tooltip.style.top = `${Math.max(0, finalY)}px`;
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  showDetailedView(stateData) {
    // Create modal with comprehensive state information
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
              <strong>Rectangular:</strong> ${QuantumMath.formatComplex(stateData.amplitude, 6)}<br>
              <strong>Polar:</strong> ${QuantumMath.formatNumber(stateData.magnitude, 6)} × e^(i × ${QuantumMath.formatNumber(stateData.phase * Math.PI / 180, 4)})
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Properties</h4>
            <table class="properties-table">
              <tr><td>State Index:</td><td>${stateData.index}</td></tr>
              <tr><td>Binary Representation:</td><td>|${stateData.binaryLabel}⟩</td></tr>
              <tr><td>Real Part:</td><td>${QuantumMath.formatNumber(stateData.real, 6)}</td></tr>
              <tr><td>Imaginary Part:</td><td>${QuantumMath.formatNumber(stateData.imag, 6)}</td></tr>
              <tr><td>Magnitude:</td><td>${QuantumMath.formatNumber(stateData.magnitude, 6)}</td></tr>
              <tr><td>Phase (degrees):</td><td>${QuantumMath.formatNumber(stateData.phase, 2)}°</td></tr>
              <tr><td>Phase (radians):</td><td>${QuantumMath.formatNumber(stateData.phase * Math.PI / 180, 4)}</td></tr>
              <tr><td>Probability:</td><td>${QuantumMath.formatPercentage(stateData.probability, 4)}</td></tr>
              <tr><td>Probability Amplitude:</td><td>${QuantumMath.formatNumber(Math.sqrt(stateData.probability), 6)}</td></tr>
            </table>
          </div>
          
          <div class="detail-section">
            <h4>Individual Qubit States</h4>
            <div class="qubit-breakdown">
              ${this.getQubitBreakdown(stateData)}
            </div>
          </div>

          <div class="detail-section">
            <h4>Context Information</h4>
            <div class="context-info">
              ${this.getContextInfo(stateData)}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.state-detail-modal').remove()">Close</button>
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

  getQubitBreakdown(stateData) {
    const numQubits = stateData.binaryLabel.length;
    let breakdown = '<table class="qubit-table"><tr><th>Qubit</th><th>Value</th><th>Position</th></tr>';
    
    for (let i = 0; i < numQubits; i++) {
      const bit = stateData.binaryLabel[i];
      breakdown += `<tr><td>q<sub>${i}</sub></td><td>|${bit}⟩</td><td>${i === 0 ? 'MSB' : i === numQubits - 1 ? 'LSB' : 'Bit ' + i}</td></tr>`;
    }
    
    breakdown += '</table>';
    return breakdown;
  }

  getContextInfo(stateData) {
    const totalStates = this.currentState.length;
    const numQubits = Math.log2(totalStates);
    const rank = this.getRankByProbability(stateData.index);
    
    return `
      <p><strong>System:</strong> ${numQubits}-qubit quantum system (${totalStates} total states)</p>
      <p><strong>Probability Rank:</strong> ${rank} of ${totalStates} states</p>
      <p><strong>Significance:</strong> ${stateData.probability > 0.01 ? 'High' : stateData.probability > 0.001 ? 'Medium' : 'Low'} probability state</p>
      ${this.showTruncationWarning ? `<p><strong>Note:</strong> This state is among the top ${this.maxBars} states by probability</p>` : ''}
    `;
  }

  getRankByProbability(targetIndex) {
    const probabilities = this.currentState.map((amp, idx) => ({
      index: idx,
      prob: QuantumMath.complexMagnitude(amp) ** 2
    }));
    
    probabilities.sort((a, b) => b.prob - a.prob);
    
    return probabilities.findIndex(item => item.index === targetIndex) + 1;
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
      }, index * 25); // Stagger animation
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
      fill.style.transition = 'all 0.5s ease';
      
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
      <h4>Quantum State Statistics</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Total Probability:</span>
          <span class="stat-value">${QuantumMath.formatPercentage(stats.totalProbability, 4)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Von Neumann Entropy:</span>
          <span class="stat-value">${QuantumMath.formatNumber(stats.entropy, 4)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Dominant State:</span>
          <span class="stat-value">|${stats.dominantState}⟩ (${QuantumMath.formatPercentage(stats.maxProbability, 2)})</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Significant States:</span>
          <span class="stat-value">${stats.significantStates} (P > 0.1%)</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">System Size:</span>
          <span class="stat-value">${Math.log2(state.length)} qubits (${state.length} states)</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Entanglement:</span>
          <span class="stat-value">${stats.entanglement !== null ? QuantumMath.formatNumber(stats.entanglement, 3) : 'N/A'}</span>
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
    let significantStates = 0;
    
    const numQubits = Math.log2(state.length);
    
    state.forEach((amplitude, index) => {
      const probability = QuantumMath.complexMagnitude(amplitude) ** 2;
      totalProbability += probability;
      
      if (probability > 0.001) {
        significantStates++;
        entropy -= probability * Math.log2(probability + 1e-10); // Add small epsilon to avoid log(0)
      }
      
      if (probability > maxProbability) {
        maxProbability = probability;
        dominantStateIndex = index;
      }
    });
    
    const dominantState = dominantStateIndex.toString(2).padStart(numQubits, '0');
    
    // Calculate entanglement for 2-qubit systems
    let entanglement = null;
    if (numQubits === 2) {
      try {
        entanglement = QuantumMath.computeEntanglement(state);
      } catch (e) {
        entanglement = null;
      }
    }
    
    return {
      totalProbability,
      entropy,
      dominantState,
      maxProbability,
      significantStates,
      entanglement
    };
  }

  // Export functionality
  exportData() {
    if (!this.currentState) return null;
    
    const processedState = this.processStateData(this.currentState.map((amp, idx) => ({...amp, originalIndex: idx})));
    const stats = this.calculateStatistics(this.currentState);
    
    return {
      timestamp: new Date().toISOString(),
      mode: this.currentMode,
      sort: this.currentSort,
      maxBars: this.maxBars,
      showTruncationWarning: this.showTruncationWarning,
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