// quantum-visualizer.js - Main application controller
import { QuantumEngine } from './core/quantum-engine.js';
import { CircuitRenderer } from './visualization/circuit-visualizer.js';
import { StateVisualizer } from './visualization/state-visualizer.js';
import { BlochSphere } from './visualization/bloch-sphere.js';
import { AlgorithmDefinitions, AlgorithmUtils } from './algorithms/algorithm-definitions.js';

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
      this.showError('Failed to initialize quantum visualizer: ' + error.message);
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
    
    console.log('Core components initialized successfully');
  }

  bindEvents() {
    // Algorithm selection
    if (this.elements.algorithmSelect) {
      this.elements.algorithmSelect.addEventListener('change', (e) => {
        this.loadAlgorithm(e.target.value);
      });
    }

    // Playback controls
    if (this.elements.stepBack) {
      this.elements.stepBack.addEventListener('click', () => this.stepBackward());
    }
    if (this.elements.playPause) {
      this.elements.playPause.addEventListener('click', () => this.togglePlayback());
    }
    if (this.elements.stepForward) {
      this.elements.stepForward.addEventListener('click', () => this.stepForward());
    }
    if (this.elements.reset) {
      this.elements.reset.addEventListener('click', () => this.resetAlgorithm());
    }

    // Speed control
    if (this.elements.speedSlider) {
      this.elements.speedSlider.addEventListener('input', (e) => {
        this.playbackSpeed = parseFloat(e.target.value);
        if (this.elements.speedDisplay) {
          this.elements.speedDisplay.textContent = `${this.playbackSpeed}x`;
        }
      });
    }

    // Help and tours
    if (this.elements.guidedTour) {
      this.elements.guidedTour.addEventListener('click', () => this.startGuidedTour());
    }
    if (this.elements.help) {
      this.elements.help.addEventListener('click', () => this.showHelp());
    }

    // View tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e));
    });

    // Modal events
    if (this.elements.modalClose) {
      this.elements.modalClose.addEventListener('click', () => this.closeMeasurementModal());
    }
    if (this.elements.measureAgain) {
      this.elements.measureAgain.addEventListener('click', () => this.measureAgain());
    }
    if (this.elements.continueAlgorithm) {
      this.elements.continueAlgorithm.addEventListener('click', () => this.continueAlgorithm());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Panel controls
    document.getElementById('circuit-zoom-in')?.addEventListener('click', () => this.circuitRenderer.zoomIn());
    document.getElementById('circuit-zoom-out')?.addEventListener('click', () => this.circuitRenderer.zoomOut());
    document.getElementById('circuit-reset-zoom')?.addEventListener('click', () => this.circuitRenderer.resetZoom());

    // Resize observer for responsive design
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => this.handleResize());
      if (this.elements.circuitContainer) {
        resizeObserver.observe(this.elements.circuitContainer);
      }
      if (this.elements.blochCanvas) {
        resizeObserver.observe(this.elements.blochCanvas);
      }
    }
  }

  async loadAlgorithm(algorithmName) {
    const algorithmDef = AlgorithmUtils.getAlgorithm(algorithmName);
    if (!algorithmDef) {
      console.error(`Algorithm '${algorithmName}' not found`);
      // Fallback to a simple algorithm
      this.currentAlgorithm = this.createFallbackAlgorithm();
    } else {
      this.currentAlgorithm = algorithmDef;
    }

    console.log(`Loading algorithm: ${algorithmName}`);
    
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

  createFallbackAlgorithm() {
    return {
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
    };
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
    if (this.circuitRenderer) {
      this.circuitRenderer.highlightStep(this.currentStep - 1);
    }
    
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
    if (this.circuitRenderer) {
      this.circuitRenderer.highlightStep(this.currentStep - 1);
    }
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
    if (this.elements.playPause) {
      this.elements.playPause.innerHTML = '<i class="fas fa-pause"></i>';
      this.elements.playPause.title = 'Pause (Space)';
    }
    
    this.scheduleNextStep();
  }

  pausePlayback() {
    this.isPlaying = false;
    if (this.elements.playPause) {
      this.elements.playPause.innerHTML = '<i class="fas fa-play"></i>';
      this.elements.playPause.title = 'Play (Space)';
    }
    
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
    if (this.circuitRenderer) {
      this.circuitRenderer.resetHighlight();
    }
  }

  updateProgress() {
    const progress = this.totalSteps > 0 ? (this.currentStep / this.totalSteps) * 100 : 0;
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${progress}%`;
    }
    if (this.elements.currentStep) {
      this.elements.currentStep.textContent = this.currentStep;
    }
    if (this.elements.totalSteps) {
      this.elements.totalSteps.textContent = this.totalSteps;
    }
  }

  updateAlgorithmInfo() {
    if (!this.currentAlgorithm) return;
    
    if (this.elements.algorithmTitle) {
      this.elements.algorithmTitle.textContent = this.currentAlgorithm.name;
    }
    if (this.elements.algorithmOverview) {
      this.elements.algorithmOverview.textContent = this.currentAlgorithm.description;
    }
    if (this.elements.targetState) {
      this.elements.targetState.textContent = this.currentAlgorithm.targetState;
    }
  }

  updateStepInfo() {
    if (!this.currentAlgorithm || this.currentStep >= this.totalSteps) {
      // Show completion info
      if (this.currentStep >= this.totalSteps) {
        if (this.elements.stepTitle) {
          this.elements.stepTitle.textContent = `Algorithm Complete!`;
        }
        if (this.elements.stepDescription) {
          this.elements.stepDescription.textContent = `${this.currentAlgorithm.name} has finished execution. You can reset to run again or try a different algorithm.`;
        }
      }
      return;
    }
    
    const step = this.currentAlgorithm.steps[this.currentStep];
    if (this.elements.stepTitle) {
      this.elements.stepTitle.textContent = `Step ${this.currentStep + 1}: ${step.explanation}`;
    }
    if (this.elements.stepDescription) {
      this.elements.stepDescription.textContent = step.description || this.getDetailedStepDescription(step);
    }
    
    // Update current state display
    const currentState = this.quantumEngine.getCurrentStateName();
    if (this.elements.currentState) {
      this.elements.currentState.textContent = currentState;
    }
    
    // Calculate success probability (simplified)
    const successProb = this.calculateSuccessProbability();
    if (this.elements.successProbability) {
      this.elements.successProbability.textContent = `${Math.round(successProb * 100)}%`;
    }
  }

  getDetailedStepDescription(step) {
    const descriptions = {
      'H': 'The Hadamard gate creates superposition, putting the qubit into an equal combination of |0⟩ and |1⟩ states.',
      'X': 'The Pauli-X gate flips the qubit state, acting like a quantum NOT gate.',
      'Y': 'The Pauli-Y gate combines bit flip and phase flip operations.',
      'Z': 'The Pauli-Z gate applies a phase flip to the |1⟩ state while leaving |0⟩ unchanged.',
      'S': 'The S gate applies a 90° phase rotation to the |1⟩ state.',
      'T': 'The T gate applies a 45° phase rotation to the |1⟩ state.',
      'CNOT': 'The CNOT gate flips the target qubit if and only if the control qubit is in the |1⟩ state.',
      'CZ': 'The controlled-Z gate applies a phase flip to the target qubit when the control is |1⟩.',
      'CCX': 'The Toffoli gate flips the target qubit only when both control qubits are |1⟩.',
      'CCZ': 'The controlled-controlled-Z gate applies a phase flip only when all qubits are |1⟩.',
      'Oracle': 'The oracle marks the target state by applying a phase flip, making it distinguishable from other states.',
      'QFT': 'The Quantum Fourier Transform converts between computational and frequency domains.',
      'QFT†': 'The inverse QFT extracts phase information from the frequency domain.'
    };
    
    return descriptions[step.gate] || step.explanation;
  }

  calculateSuccessProbability() {
    if (!this.currentAlgorithm) return 0;
    
    // Algorithm-specific success probability calculations
    if (this.currentAlgorithm.name.includes('Grover')) {
      // For Grover's algorithm, probability increases with iterations
      const targetState = Math.pow(2, this.currentAlgorithm.qubits) - 1; // |111⟩ for 3 qubits
      const probability = this.quantumEngine.getProbabilities()[targetState] || 0;
      return probability;
    }
    
    if (this.currentAlgorithm.name.includes('Deutsch')) {
      // For Deutsch algorithm, success is deterministic
      return this.currentStep >= this.totalSteps - 1 ? 1.0 : 0.5;
    }
    
    if (this.currentAlgorithm.name.includes('Bell') || this.currentAlgorithm.name.includes('Teleportation')) {
      // For Bell states and teleportation, success is about creating/maintaining entanglement
      const probabilities = this.quantumEngine.getProbabilities();
      const maxProb = Math.max(...probabilities);
      return maxProb;
    }
    
    // Default: return maximum probability
    const probabilities = this.quantumEngine.getProbabilities();
    return Math.max(...probabilities);
  }

  updateVisualization() {
    if (!this.quantumEngine) return;
    
    // Update state visualizer
    if (this.stateVisualizer) {
      this.stateVisualizer.updateState(this.quantumEngine.getState());
    }
    
    // Update Bloch sphere for single qubit
    if (this.currentAlgorithm.qubits === 1 && this.blochSphere) {
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
      'Y': 'Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}',
      'Z': 'Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
      'S': 'S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
      'T': 'T = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}',
      'CNOT': 'CNOT = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}',
      'Oracle': 'U_f |x\\rangle = (-1)^{f(x)} |x\\rangle',
      'QFT': 'QFT|j\\rangle = \\frac{1}{\\sqrt{N}}\\sum_{k=0}^{N-1} e^{2\\pi ijk/N}|k\\rangle'
    };
    
    return mathExpressions[step.gate] || step.math || '';
  }

  getStateEvolutionMath() {
    const state = this.quantumEngine.getStateVector();
    let math = '|\\psi\\rangle = ';
    
    const numQubits = this.currentAlgorithm.qubits;
    let hasTerms = false;
    
    state.forEach((amplitude, index) => {
      const binaryIndex = index.toString(2).padStart(numQubits, '0');
      const magnitude = Math.sqrt(amplitude.real * amplitude.real + amplitude.imag * amplitude.imag);
      
      if (magnitude > 0.001) {
        if (hasTerms) math += ' + ';
        
        if (Math.abs(amplitude.imag) < 0.001) {
          // Real only
          math += `${amplitude.real.toFixed(3)}|${binaryIndex}\\rangle`;
        } else if (Math.abs(amplitude.real) < 0.001) {
          // Imaginary only
          math += `${amplitude.imag.toFixed(3)}i|${binaryIndex}\\rangle`;
        } else {
          // Complex
          const real = amplitude.real.toFixed(3);
          const imag = amplitude.imag.toFixed(3);
          math += `(${real} + ${imag}i)|${binaryIndex}\\rangle`;
        }
        hasTerms = true;
      }
    });
    
    return hasTerms ? math : '0';
  }

  getProbabilityMath() {
    const probabilities = this.quantumEngine.getProbabilities();
    const numQubits = this.currentAlgorithm.qubits;
    let math = '';
    
    probabilities.forEach((prob, index) => {
      if (prob > 0.001) {
        const binaryIndex = index.toString(2).padStart(numQubits, '0');
        math += `P(|${binaryIndex}\\rangle) = ${prob.toFixed(3)}\\\\`;
      }
    });
    
    return math;
  }

  renderMath(element, mathString) {
    if (!element || !mathString || !window.katex) {
      if (element) {
        element.textContent = mathString || 'Math rendering unavailable';
      }
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
    if (this.elements.stepBack) {
      this.elements.stepBack.disabled = this.currentStep <= 0;
    }
    if (this.elements.stepForward) {
      this.elements.stepForward.disabled = this.currentStep >= this.totalSteps;
    }
    if (this.elements.playPause) {
      this.elements.playPause.disabled = this.currentStep >= this.totalSteps;
    }
  }

  switchTab(event) {
    const tabBtn = event.target;
    const view = tabBtn.dataset.view || tabBtn.dataset.info;
    
    if (!view) return;
    
    // Update tab buttons
    const container = tabBtn.closest('.panel-header');
    if (container) {
      container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      tabBtn.classList.add('active');
    }
    
    // Update views
    const panel = tabBtn.closest('.panel');
    if (panel) {
      panel.querySelectorAll('.state-view, .info-view').forEach(view => view.classList.remove('active'));
      
      const targetView = panel.querySelector(`#${view}-view`);
      if (targetView) {
        targetView.classList.add('active');
        
        // Special handling for Bloch sphere
        if (view === 'bloch' && this.blochSphere) {
          this.blochSphere.resize();
        }
      }
    }
  }

  showMeasurementModal() {
    const result = this.quantumEngine.measure();
    
    const resultElement = document.getElementById('measurement-result');
    if (resultElement) {
      resultElement.innerHTML = `
        <h4>Measured State: |${result.state}⟩</h4>
        <p>The quantum state has collapsed to |${result.state}⟩ with probability ${(result.probability * 100).toFixed(1)}%</p>
      `;
    }
    
    const breakdown = this.quantumEngine.getProbabilities();
    let breakdownHtml = '<h5>Probability Breakdown:</h5><ul>';
    breakdown.forEach((prob, index) => {
      const binaryIndex = index.toString(2).padStart(this.currentAlgorithm.qubits, '0');
      breakdownHtml += `<li>|${binaryIndex}⟩: ${(prob * 100).toFixed(1)}%</li>`;
    });
    breakdownHtml += '</ul>';
    
    const breakdownElement = document.getElementById('probability-breakdown');
    if (breakdownElement) {
      breakdownElement.innerHTML = breakdownHtml;
    }
    
    if (this.elements.measurementModal) {
      this.elements.measurementModal.style.display = 'flex';
    }
  }

  closeMeasurementModal() {
    if (this.elements.measurementModal) {
      this.elements.measurementModal.style.display = 'none';
    }
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
        if (this.elements.measurementModal && this.elements.measurementModal.style.display === 'flex') {
          this.closeMeasurementModal();
        }
        break;
    }
  }

  startGuidedTour() {
    // Implement guided tour functionality
    console.log('Starting guided tour...');
    this.showTutorialOverlay();
  }

  showTutorialOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
      <div class="tutorial-content">
        <h3>🌌 Welcome to the Quantum Algorithm Visualizer!</h3>
        <p>This interactive tool helps you understand quantum computing through step-by-step algorithm visualization.</p>
        
        <div class="tutorial-section">
          <h4>🎯 Getting Started</h4>
          <ul>
            <li>Choose an algorithm from the dropdown menu</li>
            <li>Use the play controls to step through execution</li>
            <li>Watch quantum states evolve in real-time</li>
            <li>Explore different visualization modes</li>
          </ul>
        </div>
        
        <div class="tutorial-section">
          <h4>🔧 Controls</h4>
          <ul>
            <li><strong>Space:</strong> Play/Pause</li>
            <li><strong>→ Arrow:</strong> Step Forward</li>
            <li><strong>← Arrow:</strong> Step Backward</li>
            <li><strong>R:</strong> Reset Algorithm</li>
          </ul>
        </div>
        
        <div class="tutorial-section">
          <h4>📊 Visualization Panels</h4>
          <ul>
            <li><strong>Circuit:</strong> See quantum gates and operations</li>
            <li><strong>State:</strong> View amplitudes, probabilities, and phases</li>
            <li><strong>Information:</strong> Learn concepts and mathematics</li>
          </ul>
        </div>
        
        <div class="tutorial-actions">
          <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
            Start Exploring!
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  showHelp() {
    const helpText = `
🌌 Quantum Algorithm Visualizer Help

CONTROLS:
• Space: Play/Pause algorithm execution
• → Arrow: Step forward through algorithm
• ← Arrow: Step backward in algorithm
• R: Reset algorithm to beginning
• H: Show this help message

FEATURES:
• Algorithm Selection: Choose from basic gates to advanced algorithms
• Step-by-step Execution: Watch quantum states evolve with each operation
• Multiple Visualizations: View states as amplitudes, probabilities, or on Bloch sphere
• Interactive Circuit: Zoom and pan through quantum circuit diagrams
• Educational Content: Learn concepts, mathematics, and practical applications

TIPS:
• Start with "Single Qubit Gates" if you're new to quantum computing
• Try "Grover's Search" to see quantum speedup in action
• Use the speed slider to control animation pace
• Switch between visualization modes to understand different aspects
• Click on amplitude bars for detailed quantum state information

ALGORITHMS:
• Single/Two Qubit Gates: Learn fundamental quantum operations
• Bell States: Explore quantum entanglement
• Deutsch Algorithm: See the first quantum advantage
• Grover's Search: Experience quadratic speedup
• Quantum Fourier Transform: Understand frequency domain operations
• Quantum Teleportation: Witness quantum information transfer

For more information about quantum computing concepts, visit the Information panel while running algorithms.
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
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'flex';
    }
  }

  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'none';
    }
  }

  showError(message) {
    console.error(message);
    
    // Create error modal
    const errorModal = document.createElement('div');
    errorModal.className = 'error-modal';
    errorModal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content error">
        <div class="modal-header">
          <h3>⚠️ Error</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
          <p>Please refresh the page and try again. If the problem persists, check the browser console for more details.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
          <button class="btn btn-secondary" onclick="this.closest('.error-modal').remove()">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(errorModal);
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
    
    if (this.stateVisualizer) {
      this.stateVisualizer.destroy();
    }
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
  module.exports = { QuantumVisualizer };
}