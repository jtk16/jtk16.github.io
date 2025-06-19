// quantum-visualizer.js
class QuantumVisualizer {
  constructor() {
    this.currentAlgorithm = null;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.animationId = null;
    
    // Core components
    this.quantumEngine = null;
    this.circuitRenderer = null;
    this.stateVisualizer = null;
    this.blochSphere = null;
    
    // UI elements
    this.elements = {};
    
    this.init();
  }

  async init() {
    console.log('Initializing Quantum Algorithm Visualizer...');
    
    try {
      // Show loading
      this.showLoading();
      
      // Get DOM elements
      this.bindElements();
      
      // Initialize core components
      await this.initializeComponents();
      
      // Set up event listeners
      this.bindEvents();
      
      // Load default algorithm
      await this.loadAlgorithm('grovers');
      
      // Initialize visualizations
      this.updateVisualization();
      
      // Hide loading
      this.hideLoading();
      
      console.log('Quantum Algorithm Visualizer initialized successfully!');
      
    } catch (error) {
      console.error('Failed to initialize visualizer:', error);
      this.showError('Failed to initialize quantum visualizer');
    }
  }

  bindElements() {
    // Algorithm controls
    this.elements.algorithmSelect = document.getElementById('algorithm-select');
    this.elements.stepBack = document.getElementById('step-back');
    this.elements.playPause = document.getElementById('play-pause');
    this.elements.stepForward = document.getElementById('step-forward');
    this.elements.reset = document.getElementById('reset');
    this.elements.speedSlider = document.getElementById('speed-slider');
    this.elements.speedDisplay = document.getElementById('speed-display');
    this.elements.guidedTour = document.getElementById('guided-tour');
    this.elements.help = document.getElementById('help');
    
    // Progress elements
    this.elements.progressFill = document.getElementById('progress-fill');
    this.elements.currentStep = document.getElementById('current-step');
    this.elements.totalSteps = document.getElementById('total-steps');
    
    // Panel elements
    this.elements.circuitContainer = document.getElementById('circuit-container');
    this.elements.circuitSvg = document.getElementById('circuit-svg');
    this.elements.amplitudesContainer = document.getElementById('amplitudes-container');
    this.elements.blochCanvas = document.getElementById('bloch-canvas');
    
    // Information elements
    this.elements.algorithmTitle = document.getElementById('algorithm-title');
    this.elements.algorithmOverview = document.getElementById('algorithm-overview');
    this.elements.stepTitle = document.getElementById('step-title');
    this.elements.stepDescription = document.getElementById('step-description');
    this.elements.successProbability = document.getElementById('success-probability');
    this.elements.currentState = document.getElementById('current-state');
    this.elements.targetState = document.getElementById('target-state');
    
    // Math elements
    this.elements.currentMath = document.getElementById('current-math');
    this.elements.stateMath = document.getElementById('state-math');
    this.elements.probabilityMath = document.getElementById('probability-math');
    
    // Modal elements
    this.elements.measurementModal = document.getElementById('measurement-modal');
    this.elements.modalClose = document.getElementById('modal-close');
    this.elements.measureAgain = document.getElementById('measure-again');
    this.elements.continueAlgorithm = document.getElementById('continue-algorithm');
    
    // Loading overlay
    this.elements.loadingOverlay = document.getElementById('loading-overlay');
  }

  async initializeComponents() {
    // Initialize quantum engine with 3 qubits (expandable)
    this.quantumEngine = new QuantumEngine(3);
    
    // Initialize circuit renderer
    this.circuitRenderer = new CircuitRenderer(this.elements.circuitSvg);
    
    // Initialize state visualizer
    this.stateVisualizer = new StateVisualizer(this.elements.amplitudesContainer);
    
    // Initialize Bloch sphere
    this.blochSphere = new BlochSphere(this.elements.blochCanvas);
    
    // Load algorithm definitions
    await this.loadAlgorithmDefinitions();
  }

  async loadAlgorithmDefinitions() {
    // In a real implementation, these would be loaded from separate files
    this.algorithms = {
      'single-qubit': {
        name: 'Single Qubit Gates',
        description: 'Explore basic single qubit operations and their effects on quantum states.',
        qubits: 1,
        steps: [
          { type: 'gate', gate: 'X', qubits: [0], explanation: 'Apply Pauli-X gate (NOT gate)' },
          { type: 'gate', gate: 'H', qubits: [0], explanation: 'Apply Hadamard gate (superposition)' },
          { type: 'gate', gate: 'Z', qubits: [0], explanation: 'Apply Pauli-Z gate (phase flip)' },
          { type: 'measure', qubits: [0], explanation: 'Measure the qubit state' }
        ],
        initialState: '|0⟩',
        targetState: 'Various states',
        successMetric: 'Understanding basic gates'
      },
      'grovers': {
        name: "Grover's Search Algorithm",
        description: 'Quantum search algorithm providing quadratic speedup over classical search.',
        qubits: 3,
        steps: [
          { type: 'gate', gate: 'H', qubits: [0, 1, 2], explanation: 'Initialize equal superposition' },
          { type: 'oracle', gate: 'Oracle', qubits: [0, 1, 2], explanation: 'Mark target state |111⟩' },
          { type: 'gate', gate: 'H', qubits: [0, 1, 2], explanation: 'Hadamard before diffusion' },
          { type: 'gate', gate: 'X', qubits: [0, 1, 2], explanation: 'Flip all qubits' },
          { type: 'gate', gate: 'CCZ', qubits: [0, 1, 2], explanation: 'Conditional phase flip' },
          { type: 'gate', gate: 'X', qubits: [0, 1, 2], explanation: 'Flip all qubits back' },
          { type: 'gate', gate: 'H', qubits: [0, 1, 2], explanation: 'Complete diffusion operator' },
          { type: 'measure', qubits: [0, 1, 2], explanation: 'Measure to find marked state' }
        ],
        initialState: '|000⟩',
        targetState: '|111⟩',
        successMetric: 'High probability of measuring |111⟩'
      },
      'deutsch': {
        name: 'Deutsch Algorithm',
        description: 'Determines if a function is constant or balanced with just one evaluation.',
        qubits: 2,
        steps: [
          { type: 'gate', gate: 'X', qubits: [1], explanation: 'Initialize ancilla qubit to |1⟩' },
          { type: 'gate', gate: 'H', qubits: [0, 1], explanation: 'Create superposition' },
          { type: 'oracle', gate: 'Oracle', qubits: [0, 1], explanation: 'Apply function oracle' },
          { type: 'gate', gate: 'H', qubits: [0], explanation: 'Hadamard on control qubit' },
          { type: 'measure', qubits: [0], explanation: 'Measure control qubit' }
        ],
        initialState: '|01⟩',
        targetState: 'Depends on function',
        successMetric: 'Determine function type in one query'
      }
    };
  }

  bindEvents() {
    // Algorithm selection
    this.elements.algorithmSelect.addEventListener('change', (e) => {
      this.loadAlgorithm(e.target.value);
    });

    // Playback controls
    this.elements.stepBack.addEventListener('click', () => this.stepBackward());
    this.elements.playPause.addEventListener('click', () => this.togglePlayback());
    this.elements.stepForward.addEventListener('click', () => this.stepForward());
    this.elements.reset.addEventListener('click', () => this.resetAlgorithm());

    // Speed control
    this.elements.speedSlider.addEventListener('input', (e) => {
      this.playbackSpeed = parseFloat(e.target.value);
      this.elements.speedDisplay.textContent = `${this.playbackSpeed}x`;
    });

    // Help and tours
    this.elements.guidedTour.addEventListener('click', () => this.startGuidedTour());
    this.elements.help.addEventListener('click', () => this.showHelp());

    // View tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e));
    });

    // Modal events
    this.elements.modalClose.addEventListener('click', () => this.closeMeasurementModal());
    this.elements.measureAgain.addEventListener('click', () => this.measureAgain());
    this.elements.continueAlgorithm.addEventListener('click', () => this.continueAlgorithm());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Panel controls
    document.getElementById('circuit-zoom-in')?.addEventListener('click', () => this.circuitRenderer.zoomIn());
    document.getElementById('circuit-zoom-out')?.addEventListener('click', () => this.circuitRenderer.zoomOut());
    document.getElementById('circuit-reset-zoom')?.addEventListener('click', () => this.circuitRenderer.resetZoom());

    // Resize observer for responsive design
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => this.handleResize());
      resizeObserver.observe(this.elements.circuitContainer);
      resizeObserver.observe(this.elements.blochCanvas);
    }
  }

  async loadAlgorithm(algorithmName) {
    if (!this.algorithms[algorithmName]) {
      console.error(`Algorithm '${algorithmName}' not found`);
      return;
    }

    console.log(`Loading algorithm: ${algorithmName}`);
    
    this.currentAlgorithm = this.algorithms[algorithmName];
    this.currentStep = 0;
    this.totalSteps = this.currentAlgorithm.steps.length;
    
    // Reset quantum engine with correct number of qubits
    this.quantumEngine.reset(this.currentAlgorithm.qubits);
    
    // Update UI
    this.updateAlgorithmInfo();
    this.updateProgress();
    this.updateStepInfo();
    this.updateVisualization();
    
    // Render circuit
    this.circuitRenderer.renderCircuit(this.currentAlgorithm);
    
    // Update controls
    this.updateControls();
  }

  stepForward() {
    if (this.currentStep >= this.totalSteps) return;
    
    const step = this.currentAlgorithm.steps[this.currentStep];
    console.log(`Executing step ${this.currentStep + 1}:`, step);
    
    // Execute the quantum operation
    this.executeStep(step);
    
    // Update step counter
    this.currentStep++;
    
    // Update UI
    this.updateProgress();
    this.updateStepInfo();
    this.updateVisualization();
    this.updateControls();
    
    // Highlight current gate in circuit
    this.circuitRenderer.highlightStep(this.currentStep - 1);
    
    // If this is a measurement step, show modal
    if (step.type === 'measure') {
      this.showMeasurementModal();
    }
  }

  stepBackward() {
    if (this.currentStep <= 0) return;
    
    console.log(`Stepping back from step ${this.currentStep}`);
    
    // Reset to beginning and replay up to previous step
    this.quantumEngine.reset(this.currentAlgorithm.qubits);
    this.currentStep--;
    
    // Re-execute all steps up to current point
    for (let i = 0; i < this.currentStep; i++) {
      this.executeStep(this.currentAlgorithm.steps[i]);
    }
    
    // Update UI
    this.updateProgress();
    this.updateStepInfo();
    this.updateVisualization();
    this.updateControls();
    
    // Highlight current step in circuit
    this.circuitRenderer.highlightStep(this.currentStep - 1);
  }

  executeStep(step) {
    switch (step.type) {
      case 'gate':
        this.quantumEngine.applyGate(step.gate, step.qubits);
        break;
      case 'oracle':
        this.quantumEngine.applyOracle(step.qubits);
        break;
      case 'measure':
        // Don't actually measure here, just prepare for measurement
        break;
      default:
        console.warn(`Unknown step type: ${step.type}`);
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.pausePlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    if (this.currentStep >= this.totalSteps) return;
    
    this.isPlaying = true;
    this.elements.playPause.innerHTML = '<i class="fas fa-pause"></i>';
    this.elements.playPause.title = 'Pause (Space)';
    
    this.scheduleNextStep();
  }

  pausePlayback() {
    this.isPlaying = false;
    this.elements.playPause.innerHTML = '<i class="fas fa-play"></i>';
    this.elements.playPause.title = 'Play (Space)';
    
    if (this.animationId) {
      clearTimeout(this.animationId);
      this.animationId = null;
    }
  }

  scheduleNextStep() {
    if (!this.isPlaying || this.currentStep >= this.totalSteps) {
      this.pausePlayback();
      return;
    }
    
    const delay = 2000 / this.playbackSpeed; // Base delay of 2 seconds
    
    this.animationId = setTimeout(() => {
      this.stepForward();
      this.scheduleNextStep();
    }, delay);
  }

  resetAlgorithm() {
    console.log('Resetting algorithm');
    
    this.pausePlayback();
    this.currentStep = 0;
    
    // Reset quantum engine
    this.quantumEngine.reset(this.currentAlgorithm.qubits);
    
    // Update UI
    this.updateProgress();
    this.updateStepInfo();
    this.updateVisualization();
    this.updateControls();
    
    // Reset circuit visualization
    this.circuitRenderer.resetHighlight();
  }

  updateProgress() {
    const progress = this.totalSteps > 0 ? (this.currentStep / this.totalSteps) * 100 : 0;
    this.elements.progressFill.style.width = `${progress}%`;
    this.elements.currentStep.textContent = this.currentStep;
    this.elements.totalSteps.textContent = this.totalSteps;
  }

  updateAlgorithmInfo() {
    if (!this.currentAlgorithm) return;
    
    this.elements.algorithmTitle.textContent = this.currentAlgorithm.name;
    this.elements.algorithmOverview.textContent = this.currentAlgorithm.description;
    this.elements.targetState.textContent = this.currentAlgorithm.targetState;
  }

  updateStepInfo() {
    if (!this.currentAlgorithm || this.currentStep >= this.totalSteps) return;
    
    const step = this.currentAlgorithm.steps[this.currentStep];
    this.elements.stepTitle.textContent = `Step ${this.currentStep + 1}: ${step.explanation}`;
    this.elements.stepDescription.textContent = this.getDetailedStepDescription(step);
    
    // Update current state display
    const currentState = this.quantumEngine.getCurrentStateName();
    this.elements.currentState.textContent = currentState;
    
    // Calculate success probability (simplified)
    const successProb = this.calculateSuccessProbability();
    this.elements.successProbability.textContent = `${Math.round(successProb * 100)}%`;
  }

  getDetailedStepDescription(step) {
    const descriptions = {
      'H': 'The Hadamard gate creates superposition, putting the qubit into an equal combination of |0⟩ and |1⟩ states.',
      'X': 'The Pauli-X gate flips the qubit state, acting like a quantum NOT gate.',
      'Z': 'The Pauli-Z gate applies a phase flip to the |1⟩ state while leaving |0⟩ unchanged.',
      'Oracle': 'The oracle marks the target state by applying a phase flip, making it distinguishable.',
      'CCZ': 'The controlled-controlled-Z gate applies a phase flip only when all control qubits are in |1⟩.'
    };
    
    return descriptions[step.gate] || step.explanation;
  }

  calculateSuccessProbability() {
    if (!this.currentAlgorithm) return 0;
    
    // Simplified calculation - in real implementation would be more sophisticated
    if (this.currentAlgorithm.name.includes('Grover')) {
      // For Grover's algorithm, probability increases with iterations
      const iterations = Math.floor(this.currentStep / 7); // Approximate iteration count
      return Math.min(0.9, iterations * 0.3 + 0.1);
    }
    
    return 0.5; // Default
  }

  updateVisualization() {
    if (!this.quantumEngine) return;
    
    // Update state visualizer
    this.stateVisualizer.updateState(this.quantumEngine.getState());
    
    // Update Bloch sphere for single qubit
    if (this.currentAlgorithm.qubits === 1) {
      this.blochSphere.updateState(this.quantumEngine.getBlochVector());
    }
    
    // Update mathematical expressions
    this.updateMathematicalExpressions();
  }

  updateMathematicalExpressions() {
    if (!this.currentAlgorithm || this.currentStep >= this.totalSteps) return;
    
    const step = this.currentAlgorithm.steps[this.currentStep];
    
    // Current operation math
    this.renderMath(this.elements.currentMath, this.getOperationMath(step));
    
    // State evolution math
    this.renderMath(this.elements.stateMath, this.getStateEvolutionMath());
    
    // Probability math
    this.renderMath(this.elements.probabilityMath, this.getProbabilityMath());
  }

  getOperationMath(step) {
    const mathExpressions = {
      'H': 'H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
      'X': 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
      'Z': 'Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
      'Oracle': 'U_f |x\\rangle = (-1)^{f(x)} |x\\rangle'
    };
    
    return mathExpressions[step.gate] || '';
  }

  getStateEvolutionMath() {
    const state = this.quantumEngine.getStateVector();
    let math = '|\\psi\\rangle = ';
    
    state.forEach((amplitude, index) => {
      const binaryIndex = index.toString(2).padStart(this.currentAlgorithm.qubits, '0');
      const real = amplitude.real.toFixed(3);
      const imag = amplitude.imag.toFixed(3);
      
      if (Math.abs(amplitude.real) > 0.001 || Math.abs(amplitude.imag) > 0.001) {
        if (index > 0) math += ' + ';
        math += `(${real} + ${imag}i)|${binaryIndex}\\rangle`;
      }
    });
    
    return math;
  }

  getProbabilityMath() {
    const probabilities = this.quantumEngine.getProbabilities();
    let math = '';
    
    probabilities.forEach((prob, index) => {
      if (prob > 0.001) {
        const binaryIndex = index.toString(2).padStart(this.currentAlgorithm.qubits, '0');
        math += `P(|${binaryIndex}\\rangle) = ${prob.toFixed(3)}\\\\`;
      }
    });
    
    return math;
  }

  renderMath(element, mathString) {
    if (!mathString || !window.katex) {
      element.textContent = mathString || 'Math rendering unavailable';
      return;
    }
    
    try {
      katex.render(mathString, element, {
        displayMode: true,
        throwOnError: false
      });
    } catch (error) {
      console.warn('KaTeX rendering error:', error);
      element.textContent = mathString;
    }
  }

  updateControls() {
    // Enable/disable controls based on current state
    this.elements.stepBack.disabled = this.currentStep <= 0;
    this.elements.stepForward.disabled = this.currentStep >= this.totalSteps;
    this.elements.playPause.disabled = this.currentStep >= this.totalSteps;
  }

  switchTab(event) {
    const tabBtn = event.target;
    const view = tabBtn.dataset.view || tabBtn.dataset.info;
    
    if (!view) return;
    
    // Update tab buttons
    const container = tabBtn.closest('.panel-header');
    container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    tabBtn.classList.add('active');
    
    // Update views
    const panel = tabBtn.closest('.panel');
    panel.querySelectorAll('.state-view, .info-view').forEach(view => view.classList.remove('active'));
    
    const targetView = panel.querySelector(`#${view}-view`);
    if (targetView) {
      targetView.classList.add('active');
      
      // Special handling for Bloch sphere
      if (view === 'bloch') {
        this.blochSphere.resize();
      }
    }
  }

  showMeasurementModal() {
    const result = this.quantumEngine.measure();
    
    document.getElementById('measurement-result').innerHTML = `
      <h4>Measured State: |${result.state}⟩</h4>
      <p>The quantum state has collapsed to |${result.state}⟩ with probability ${(result.probability * 100).toFixed(1)}%</p>
    `;
    
    const breakdown = this.quantumEngine.getProbabilities();
    let breakdownHtml = '<h5>Probability Breakdown:</h5><ul>';
    breakdown.forEach((prob, index) => {
      const binaryIndex = index.toString(2).padStart(this.currentAlgorithm.qubits, '0');
      breakdownHtml += `<li>|${binaryIndex}⟩: ${(prob * 100).toFixed(1)}%</li>`;
    });
    breakdownHtml += '</ul>';
    
    document.getElementById('probability-breakdown').innerHTML = breakdownHtml;
    
    this.elements.measurementModal.style.display = 'flex';
  }

  closeMeasurementModal() {
    this.elements.measurementModal.style.display = 'none';
  }

  measureAgain() {
    this.showMeasurementModal();
  }

  continueAlgorithm() {
    this.closeMeasurementModal();
  }

  handleKeyboard(event) {
    // Ignore if typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') return;
    
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.togglePlayback();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.stepForward();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.stepBackward();
        break;
      case 'r':
      case 'R':
        event.preventDefault();
        this.resetAlgorithm();
        break;
      case 'h':
      case 'H':
        event.preventDefault();
        this.showHelp();
        break;
      case 'Escape':
        if (this.elements.measurementModal.style.display === 'flex') {
          this.closeMeasurementModal();
        }
        break;
    }
  }

  startGuidedTour() {
    // Placeholder for guided tour functionality
    console.log('Starting guided tour...');
    alert('Guided tour feature coming soon! Use the help button for basic controls.');
  }

  showHelp() {
    const helpText = `
Quantum Algorithm Visualizer Help

Controls:
• Space: Play/Pause
• → Arrow: Step Forward  
• ← Arrow: Step Backward
• R: Reset Algorithm
• H: Show this help

Features:
• Select different quantum algorithms from the dropdown
• Watch step-by-step execution with visualizations
• View quantum states in multiple formats
• Explore mathematical foundations
• Interactive Bloch sphere for single qubits

Tips:
• Start with single qubit gates to understand basics
• Try Grover's search to see quantum speedup
• Use the speed slider to control playback
• Switch between amplitude, Bloch, and matrix views
    `;
    
    alert(helpText);
  }

  handleResize() {
    // Trigger resize for components that need it
    if (this.blochSphere) {
      this.blochSphere.resize();
    }
    if (this.circuitRenderer) {
      this.circuitRenderer.resize();
    }
  }

  showLoading() {
    this.elements.loadingOverlay.style.display = 'flex';
  }

  hideLoading() {
    this.elements.loadingOverlay.style.display = 'none';
  }

  showError(message) {
    console.error(message);
    alert(`Error: ${message}`);
    this.hideLoading();
  }

  // Cleanup
  destroy() {
    if (this.animationId) {
      clearTimeout(this.animationId);
    }
    
    if (this.blochSphere) {
      this.blochSphere.destroy();
    }
    
    if (this.circuitRenderer) {
      this.circuitRenderer.destroy();
    }
  }
}

// Simple placeholder classes for core components
// In the full implementation, these would be in separate files

class QuantumEngine {
  constructor(numQubits) {
    this.numQubits = numQubits;
    this.reset();
  }

  reset(numQubits = this.numQubits) {
    this.numQubits = numQubits;
    this.state = new Array(Math.pow(2, numQubits)).fill(0).map((_, i) => 
      ({ real: i === 0 ? 1 : 0, imag: 0 })
    );
  }

  applyGate(gateName, qubits) {
    console.log(`Applying ${gateName} gate to qubits:`, qubits);
    // Simplified gate application - real implementation would use proper matrix operations
    // This is just for demonstration
  }

  applyOracle(qubits) {
    console.log('Applying oracle to qubits:', qubits);
    // Simplified oracle - would flip phase of target state
  }

  getState() {
    return this.state;
  }

  getStateVector() {
    return this.state;
  }

  getCurrentStateName() {
    // Find the state with highest probability
    const maxIndex = this.state.reduce((maxIdx, curr, idx, arr) => 
      (curr.real * curr.real + curr.imag * curr.imag) > 
      (arr[maxIdx].real * arr[maxIdx].real + arr[maxIdx].imag * arr[maxIdx].imag) ? idx : maxIdx, 0
    );
    
    return '|' + maxIndex.toString(2).padStart(this.numQubits, '0') + '⟩';
  }

  getProbabilities() {
    return this.state.map(amplitude => amplitude.real * amplitude.real + amplitude.imag * amplitude.imag);
  }

  getBlochVector() {
    // For single qubit, return Bloch sphere coordinates
    if (this.numQubits !== 1) return { x: 0, y: 0, z: 1 };
    
    const prob0 = this.state[0].real * this.state[0].real + this.state[0].imag * this.state[0].imag;
    return { x: 0, y: 0, z: 2 * prob0 - 1 };
  }

  measure() {
    const probabilities = this.getProbabilities();
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        const binaryState = i.toString(2).padStart(this.numQubits, '0');
        return { state: binaryState, probability: probabilities[i] };
      }
    }
    
    return { state: '0'.repeat(this.numQubits), probability: 1 };
  }
}

class CircuitRenderer {
  constructor(svgElement) {
    this.svg = svgElement;
  }

  renderCircuit(algorithm) {
    console.log('Rendering circuit for:', algorithm.name);
    // Placeholder circuit rendering
    this.svg.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">
        Circuit for ${algorithm.name}
      </text>
    `;
  }

  highlightStep(stepIndex) {
    console.log('Highlighting step:', stepIndex);
  }

  resetHighlight() {
    console.log('Resetting circuit highlight');
  }

  zoomIn() { console.log('Circuit zoom in'); }
  zoomOut() { console.log('Circuit zoom out'); }
  resetZoom() { console.log('Circuit reset zoom'); }
  resize() { console.log('Circuit resize'); }
  destroy() { console.log('Circuit renderer destroyed'); }
}

class StateVisualizer {
  constructor(container) {
    this.container = container;
  }

  updateState(state) {
    const probabilities = state.map(amplitude => 
      amplitude.real * amplitude.real + amplitude.imag * amplitude.imag
    );
    
    this.container.innerHTML = probabilities.map((prob, index) => `
      <div class="amplitude-bar">
        <div class="amplitude-label">|${index.toString(2).padStart(Math.log2(state.length), '0')}⟩</div>
        <div class="amplitude-visual">
          <div class="amplitude-fill positive" style="width: ${prob * 100}%"></div>
        </div>
        <div class="probability-value">${(prob * 100).toFixed(1)}%</div>
      </div>
    `).join('');
  }
}

class BlochSphere {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = { x: 0, y: 0, z: 1 };
    this.resize();
  }

  updateState(blochVector) {
    this.state = blochVector;
    this.render();
  }

  render() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    this.ctx.clearRect(0, 0, width, height);
    
    // Draw sphere outline
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // Draw axes
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 1;
    
    // Z axis (vertical)
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - radius);
    this.ctx.lineTo(centerX, centerY + radius);
    this.ctx.stroke();
    
    // X axis (horizontal)
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - radius, centerY);
    this.ctx.lineTo(centerX + radius, centerY);
    this.ctx.stroke();
    
    // Draw state vector
    const stateX = centerX + this.state.x * radius;
    const stateY = centerY - this.state.z * radius; // Negative because canvas Y is flipped
    
    this.ctx.strokeStyle = '#6366f1';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(stateX, stateY);
    this.ctx.stroke();
    
    // Draw state point
    this.ctx.fillStyle = '#ec4899';
    this.ctx.beginPath();
    this.ctx.arc(stateX, stateY, 6, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Update coordinate display
    document.getElementById('bloch-x').textContent = this.state.x.toFixed(3);
    document.getElementById('bloch-y').textContent = this.state.y.toFixed(3);
    document.getElementById('bloch-z').textContent = this.state.z.toFixed(3);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.render();
  }

  destroy() {
    // Cleanup if needed
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.quantumVisualizer = new QuantumVisualizer();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window.quantumVisualizer) {
    window.quantumVisualizer.destroy();
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QuantumVisualizer, QuantumEngine, CircuitRenderer, StateVisualizer, BlochSphere };
}