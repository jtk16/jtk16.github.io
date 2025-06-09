// assets/js/eigenvalue-controls.js
class EigenvalueControls {
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    this.nodeCount = 5;
    this.eigenvalues = [0, 0.5, 1.0, 1.5, 2.0];
    this.isUpdating = false;
    this.updateTimeout = null;
    
    // Bind methods to preserve context
    this.handleSliderInput = this.handleSliderInput.bind(this);
    this.handlePresetClick = this.handlePresetClick.bind(this);
    this.handleNodeCountChange = this.handleNodeCountChange.bind(this);
    
    this.setupControls();
  }

  setupControls() {
    this.renderSliders();
    this.setupPresets();
    this.setupNodeCountControl();
    this.setupKeyboardControls();
  }

  renderSliders() {
    this.container.innerHTML = '';
    
    this.eigenvalues.forEach((value, index) => {
      const controlDiv = this.createSliderControl(value, index);
      this.container.appendChild(controlDiv);
    });
  }

  createSliderControl(value, index) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'eigenvalue-control';
    
    const isFixed = index === 0; // First eigenvalue is always 0
    const maxValue = index === 0 ? 0 : 5;
    
    controlDiv.innerHTML = `
      <div class="eigenvalue-label">
        <span class="eigenvalue-name">λ<sub>${index + 1}</sub></span>
        <span class="eigenvalue-value" data-index="${index}">${value.toFixed(3)}</span>
      </div>
      <div class="slider-container">
        <input type="range" 
               class="eigenvalue-slider" 
               id="eigenvalue-${index}"
               data-index="${index}"
               min="0" 
               max="${maxValue}" 
               step="0.01" 
               value="${value}"
               ${isFixed ? 'disabled' : ''}
               aria-label="Eigenvalue ${index + 1}">
        ${!isFixed ? `<div class="slider-track-fill" data-index="${index}"></div>` : ''}
      </div>
      ${!isFixed ? `
        <div class="eigenvalue-buttons">
          <button class="eigenvalue-btn" data-action="decrease" data-index="${index}" title="Decrease by 0.1">
            <i class="fas fa-minus"></i>
          </button>
          <button class="eigenvalue-btn" data-action="increase" data-index="${index}" title="Increase by 0.1">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      ` : ''}
    `;
    
    this.setupSliderEvents(controlDiv, index);
    this.updateSliderFill(index, value, maxValue);
    
    return controlDiv;
  }

  setupSliderEvents(controlDiv, index) {
    const slider = controlDiv.querySelector('.eigenvalue-slider');
    const valueSpan = controlDiv.querySelector('.eigenvalue-value');
    const decreaseBtn = controlDiv.querySelector('[data-action="decrease"]');
    const increaseBtn = controlDiv.querySelector('[data-action="increase"]');
    
    // Slider input event with debouncing
    slider.addEventListener('input', this.handleSliderInput);
    
    // Button events
    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        this.adjustEigenvalue(index, -0.1);
      });
    }
    
    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        this.adjustEigenvalue(index, 0.1);
      });
    }
    
    // Keyboard events for fine control
    slider.addEventListener('keydown', (e) => {
      let step = 0;
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          step = -0.01;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          step = 0.01;
          break;
        case 'PageDown':
          step = -0.1;
          break;
        case 'PageUp':
          step = 0.1;
          break;
        default:
          return;
      }
      
      e.preventDefault();
      this.adjustEigenvalue(index, step);
    });
    
    // Focus and blur events for better UX
    slider.addEventListener('focus', () => {
      controlDiv.classList.add('focused');
    });
    
    slider.addEventListener('blur', () => {
      controlDiv.classList.remove('focused');
    });
  }

  handleSliderInput(e) {
    const index = parseInt(e.target.dataset.index);
    const newValue = parseFloat(e.target.value);
    
    this.updateEigenvalue(index, newValue, false); // Don't trigger onChange yet
    
    // Debounce the onChange call
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => {
      this.triggerChange();
    }, 150);
  }

  adjustEigenvalue(index, step) {
    const currentValue = this.eigenvalues[index];
    const newValue = Math.max(0, Math.min(5, currentValue + step));
    
    this.updateEigenvalue(index, newValue, true);
  }

  updateEigenvalue(index, newValue, triggerChange = true) {
    if (index === 0) return; // Cannot modify first eigenvalue
    
    this.eigenvalues[index] = newValue;
    
    // Update UI
    const slider = document.getElementById(`eigenvalue-${index}`);
    const valueSpan = document.querySelector(`.eigenvalue-value[data-index="${index}"]`);
    
    if (slider) slider.value = newValue;
    if (valueSpan) valueSpan.textContent = newValue.toFixed(3);
    
    this.updateSliderFill(index, newValue, 5);
    
    // Ensure eigenvalues remain in non-decreasing order
    this.enforceOrdering(index);
    
    if (triggerChange) {
      this.triggerChange();
    }
  }

  enforceOrdering(changedIndex) {
    let needsReorder = false;
    
    // Check if we need to reorder
    for (let i = 1; i < this.eigenvalues.length - 1; i++) {
      if (this.eigenvalues[i] > this.eigenvalues[i + 1]) {
        needsReorder = true;
        break;
      }
    }
    
    if (needsReorder) {
      // Sort eigenvalues while keeping first one at 0
      const sortedEigenvalues = [0, ...this.eigenvalues.slice(1).sort((a, b) => a - b)];
      this.eigenvalues = sortedEigenvalues;
      this.updateAllSliders();
    }
  }

  updateAllSliders() {
    this.eigenvalues.forEach((value, index) => {
      if (index === 0) return;
      
      const slider = document.getElementById(`eigenvalue-${index}`);
      const valueSpan = document.querySelector(`.eigenvalue-value[data-index="${index}"]`);
      
      if (slider) slider.value = value;
      if (valueSpan) valueSpan.textContent = value.toFixed(3);
      
      this.updateSliderFill(index, value, 5);
    });
  }

  updateSliderFill(index, value, maxValue) {
    const fillElement = document.querySelector(`.slider-track-fill[data-index="${index}"]`);
    if (fillElement) {
      const percentage = (value / maxValue) * 100;
      fillElement.style.width = `${percentage}%`;
    }
  }

  triggerChange() {
    if (this.onChange && !this.isUpdating) {
      this.onChange([...this.eigenvalues]);
    }
  }

  setupPresets() {
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', this.handlePresetClick);
    });
  }

  handlePresetClick(e) {
    const preset = e.target.dataset.preset;
    if (!preset) return;
    
    // Add visual feedback
    const allButtons = document.querySelectorAll('.preset-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    setTimeout(() => {
      e.target.classList.remove('active');
    }, 200);
    
    // Load preset eigenvalues
    this.loadPreset(preset);
  }

  loadPreset(presetType) {
    if (typeof GraphLaplacianEngine === 'undefined') {
      console.error('GraphLaplacianEngine not available');
      return;
    }
    
    const engine = new GraphLaplacianEngine();
    const newEigenvalues = engine.getPresetEigenvalues(presetType, this.nodeCount);
    
    this.setEigenvalues(newEigenvalues);
  }

  setupNodeCountControl() {
    const nodeCountSelect = document.getElementById('node-count');
    if (nodeCountSelect) {
      nodeCountSelect.addEventListener('change', this.handleNodeCountChange);
    }
  }

  handleNodeCountChange(e) {
    const newNodeCount = parseInt(e.target.value);
    if (newNodeCount === this.nodeCount) return;
    
    this.nodeCount = newNodeCount;
    
    // Resize eigenvalues array
    if (newNodeCount > this.eigenvalues.length) {
      // Add new eigenvalues
      while (this.eigenvalues.length < newNodeCount) {
        this.eigenvalues.push(this.eigenvalues.length * 0.5);
      }
    } else if (newNodeCount < this.eigenvalues.length) {
      // Remove eigenvalues
      this.eigenvalues = this.eigenvalues.slice(0, newNodeCount);
    }
    
    // Re-render sliders
    this.renderSliders();
    this.triggerChange();
  }

  setupKeyboardControls() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('eigenvalue-slider')) return;
      
      // Only handle if focus is in the controls panel
      const controlsPanel = this.container.closest('.controls-panel');
      if (!controlsPanel || !controlsPanel.contains(document.activeElement)) return;
      
      switch(e.key) {
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.loadPreset('random');
          }
          break;
        case '1':
          e.preventDefault();
          this.loadPreset('path');
          break;
        case '2':
          e.preventDefault();
          this.loadPreset('cycle');
          break;
        case '3':
          e.preventDefault();
          this.loadPreset('complete');
          break;
        case '4':
          e.preventDefault();
          this.loadPreset('star');
          break;
      }
    });
  }

  // Public API methods
  setEigenvalues(eigenvalues) {
    this.isUpdating = true;
    this.eigenvalues = [...eigenvalues];
    
    // Update node count if needed
    if (eigenvalues.length !== this.nodeCount) {
      this.nodeCount = eigenvalues.length;
      const nodeCountSelect = document.getElementById('node-count');
      if (nodeCountSelect) {
        nodeCountSelect.value = this.nodeCount;
      }
      this.renderSliders();
    } else {
      this.updateAllSliders();
    }
    
    this.isUpdating = false;
    this.triggerChange();
  }

  getEigenvalues() {
    return [...this.eigenvalues];
  }

  reset() {
    const defaultEigenvalues = new Array(this.nodeCount).fill(0).map((_, i) => i * 0.5);
    this.setEigenvalues(defaultEigenvalues);
  }

  // Validation helper
  validateCurrentEigenvalues() {
    if (typeof GraphLaplacianEngine === 'undefined') return { valid: true };
    
    const engine = new GraphLaplacianEngine();
    return engine.validateEigenvalues(this.eigenvalues);
  }

  // Animation helper for smooth transitions
  animateToEigenvalues(targetEigenvalues, duration = 1000) {
    const startEigenvalues = [...this.eigenvalues];
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate eigenvalues
      const currentEigenvalues = startEigenvalues.map((start, i) => {
        const target = targetEigenvalues[i] || start;
        return start + (target - start) * easedProgress;
      });
      
      this.setEigenvalues(currentEigenvalues);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  // Cleanup
  destroy() {
    // Remove event listeners
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
      btn.removeEventListener('click', this.handlePresetClick);
    });
    
    const nodeCountSelect = document.getElementById('node-count');
    if (nodeCountSelect) {
      nodeCountSelect.removeEventListener('change', this.handleNodeCountChange);
    }
    
    // Clear timeouts
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EigenvalueControls;
} else if (typeof window !== 'undefined') {
  window.EigenvalueControls = EigenvalueControls;
}