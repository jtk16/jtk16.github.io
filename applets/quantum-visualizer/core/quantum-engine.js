// core/quantum-engine.js - Fixed version with proper history management and oracle implementations
import { QuantumMath } from '../utils/quantum-math.js';
import { MathUtils } from '../utils/math-utils.js';

export class QuantumEngine {
  constructor(numQubits = 3) {
    this.numQubits = numQubits;
    this.maxQubits = 5; // Performance limit
    this.state = null;
    this.history = [];
    this.currentStep = 0;
    this.classicalBits = []; // For measurement outcomes
    
    this.reset();
  }

  reset(numQubits = this.numQubits) {
    this.numQubits = Math.min(numQubits, this.maxQubits);
    const numStates = Math.pow(2, this.numQubits);
    
    // Initialize to |00...0⟩ state
    this.state = new Array(numStates).fill(0).map((_, i) => ({
      real: i === 0 ? 1.0 : 0.0,
      imag: 0.0
    }));
    
    this.history = [this.cloneState()];
    this.currentStep = 0;
    this.classicalBits = new Array(this.numQubits).fill(0);
    
    console.log(`Quantum engine reset with ${this.numQubits} qubits`);
  }

  cloneState() {
    return this.state.map(amplitude => ({
      real: amplitude.real,
      imag: amplitude.imag
    }));
  }

  saveState() {
    // Only save if we're at the end of history (no branching)
    if (this.currentStep === this.history.length - 1) {
      this.history.push(this.cloneState());
      this.currentStep++;
    } else {
      // If we're in the middle, truncate future states and add new one
      this.history = this.history.slice(0, this.currentStep + 1);
      this.history.push(this.cloneState());
      this.currentStep++;
    }
  }

  // Efficient step backward using history
  stepBackward() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.state = this.history[this.currentStep].map(amp => ({...amp}));
      return true;
    }
    return false;
  }

  stepForward() {
    if (this.currentStep < this.history.length - 1) {
      this.currentStep++;
      this.state = this.history[this.currentStep].map(amp => ({...amp}));
      return true;
    }
    return false;
  }

  stepTo(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.history.length) {
      this.currentStep = stepIndex;
      this.state = this.history[stepIndex].map(amp => ({...amp}));
      return true;
    }
    return false;
  }

  // Core gate application method
  applyGate(gateName, qubits, parameters = {}) {
    console.log(`Applying ${gateName} gate to qubits:`, qubits);
    
    try {
      if (qubits.length === 1) {
        const matrix = this.getSingleQubitMatrix(gateName, parameters);
        this.applySingleQubitGate(matrix, qubits[0]);
      } else if (qubits.length === 2) {
        const matrix = this.getTwoQubitMatrix(gateName, parameters);
        this.applyTwoQubitGate(matrix, qubits[0], qubits[1]);
      } else {
        const matrix = this.getMultiQubitMatrix(gateName, qubits, parameters);
        this.applyMultiQubitGate(matrix, qubits);
      }
      
      this.saveState();
      this.normalizeState();
      
    } catch (error) {
      console.error(`Error applying ${gateName} gate:`, error);
    }
  }

  getSingleQubitMatrix(gateName, parameters = {}) {
    const gates = {
      'I': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: 1, imag: 0}]],
      
      'X': [[{real: 0, imag: 0}, {real: 1, imag: 0}], 
            [{real: 1, imag: 0}, {real: 0, imag: 0}]],
      
      'Y': [[{real: 0, imag: 0}, {real: 0, imag: -1}], 
            [{real: 0, imag: 1}, {real: 0, imag: 0}]],
      
      'Z': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: -1, imag: 0}]],
      
      'H': [[{real: 1/Math.sqrt(2), imag: 0}, {real: 1/Math.sqrt(2), imag: 0}], 
            [{real: 1/Math.sqrt(2), imag: 0}, {real: -1/Math.sqrt(2), imag: 0}]],
      
      'S': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: 0, imag: 1}]],
      
      'T': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: Math.cos(Math.PI/4), imag: Math.sin(Math.PI/4)}]],
      
      'RX': this.createRotationX(parameters.angle || 0),
      'RY': this.createRotationY(parameters.angle || 0),
      'RZ': this.createRotationZ(parameters.angle || 0)
    };
    
    if (!gates[gateName]) {
      throw new Error(`Unknown single-qubit gate: ${gateName}`);
    }
    
    return gates[gateName];
  }

  getTwoQubitMatrix(gateName, parameters = {}) {
    const gates = {
      'CNOT': this.createCNOTMatrix(),
      'CZ': this.createCZMatrix(),
      'SWAP': this.createSWAPMatrix()
    };
    
    if (!gates[gateName]) {
      throw new Error(`Unknown two-qubit gate: ${gateName}`);
    }
    
    return gates[gateName];
  }

  getMultiQubitMatrix(gateName, qubits, parameters = {}) {
    if (gateName === 'CCX') {
      return this.createCCXMatrix();
    } else if (gateName === 'CCZ') {
      return this.createCCZMatrix();
    }
    
    throw new Error(`Unknown multi-qubit gate: ${gateName}`);
  }

  // Proper Deutsch algorithm oracle implementation
  applyDeutschOracle(qubits, functionType = 'constant', functionValue = 0) {
    if (qubits.length !== 2) {
      throw new Error('Deutsch oracle requires exactly 2 qubits');
    }
    
    const [controlQubit, ancillaQubit] = qubits;
    
    // Oracle implements |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩
    if (functionType === 'constant') {
      if (functionValue === 1) {
        // f(x) = 1 for all x, so flip ancilla regardless
        this.applyGate('X', [ancillaQubit]);
      }
      // f(x) = 0 for all x means no operation needed
    } else if (functionType === 'balanced') {
      // f(0) ≠ f(1), so use CNOT (f(x) = x) or CNOT + X on ancilla (f(x) = NOT x)
      this.applyGate('CNOT', [controlQubit, ancillaQubit]);
      if (functionValue === 1) {
        // For f(x) = NOT x, add X gate on ancilla
        this.applyGate('X', [ancillaQubit]);
      }
    }
    
    console.log(`Deutsch oracle applied: ${functionType}, value: ${functionValue}`);
  }

  // Grover's oracle for marking specific states
  applyGroverOracle(qubits, markedStates = null) {
    if (!markedStates) {
      // Default: mark the |111...1⟩ state
      markedStates = [Math.pow(2, qubits.length) - 1];
    }
    
    if (!Array.isArray(markedStates)) {
      markedStates = [markedStates];
    }
    
    // Apply phase flip to marked states
    markedStates.forEach(state => {
      if (state >= 0 && state < this.state.length) {
        this.state[state].real *= -1;
        this.state[state].imag *= -1;
      }
    });
    
    this.saveState();
    console.log(`Grover oracle applied, marked states:`, markedStates.map(s => 
      `|${s.toString(2).padStart(qubits.length, '0')}⟩`));
  }

  // Proper QFT implementation with controlled rotations
  applyQFT(qubits) {
    const n = qubits.length;
    
    for (let i = 0; i < n; i++) {
      // Apply Hadamard to current qubit
      this.applyGate('H', [qubits[i]]);
      
      // Apply controlled rotations
      for (let j = i + 1; j < n; j++) {
        const angle = Math.PI / Math.pow(2, j - i);
        this.applyControlledPhase(qubits[j], qubits[i], angle);
      }
    }
    
    // Reverse the order of qubits (bit reversal)
    for (let i = 0; i < Math.floor(n / 2); i++) {
      this.applyGate('SWAP', [qubits[i], qubits[n - 1 - i]]);
    }
    
    console.log('QFT applied to qubits:', qubits);
  }

  applyControlledPhase(controlQubit, targetQubit, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Controlled phase gate matrix
    const matrix = Array(4).fill(null).map(() => Array(4).fill(null).map(() => ({real: 0, imag: 0})));
    matrix[0][0] = {real: 1, imag: 0}; // |00⟩
    matrix[1][1] = {real: 1, imag: 0}; // |01⟩
    matrix[2][2] = {real: 1, imag: 0}; // |10⟩
    matrix[3][3] = {real: cos, imag: sin}; // |11⟩ gets phase
    
    this.applyTwoQubitGate(matrix, controlQubit, targetQubit);
  }

  // Measurement with classical bit storage
  measure(qubits = null, storeClassical = true) {
    const measureQubits = qubits || Array.from({length: this.numQubits}, (_, i) => i);
    const probabilities = this.getProbabilities();
    
    // Random measurement based on probabilities
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        const binaryState = i.toString(2).padStart(this.numQubits, '0');
        
        // Store classical measurement outcomes
        if (storeClassical) {
          measureQubits.forEach((qubit, idx) => {
            const bit = (i >> (this.numQubits - 1 - qubit)) & 1;
            this.classicalBits[qubit] = bit;
          });
        }
        
        // Collapse to measured state
        this.state.fill({real: 0, imag: 0});
        this.state[i] = {real: 1, imag: 0};
        
        this.saveState();
        
        return {
          state: binaryState,
          stateIndex: i,
          probability: probabilities[i],
          qubits: measureQubits,
          classicalBits: [...this.classicalBits]
        };
      }
    }
    
    // Fallback
    return {
      state: '0'.repeat(this.numQubits),
      stateIndex: 0,
      probability: probabilities[0] || 1,
      qubits: measureQubits,
      classicalBits: [...this.classicalBits]
    };
  }

  // Conditional gate application based on classical bits
  applyConditionalGate(gateName, targetQubits, conditionQubits, conditionValues) {
    // Check if classical condition is met
    const conditionMet = conditionQubits.every((qubit, idx) => 
      this.classicalBits[qubit] === conditionValues[idx]
    );
    
    if (conditionMet) {
      this.applyGate(gateName, targetQubits);
      console.log(`Conditional ${gateName} applied based on classical bits`);
    } else {
      console.log(`Conditional ${gateName} skipped - condition not met`);
    }
  }

  // Create rotation matrices
  createRotationX(angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    return [
      [{real: cos, imag: 0}, {real: 0, imag: -sin}],
      [{real: 0, imag: -sin}, {real: cos, imag: 0}]
    ];
  }

  createRotationY(angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    return [
      [{real: cos, imag: 0}, {real: -sin, imag: 0}],
      [{real: sin, imag: 0}, {real: cos, imag: 0}]
    ];
  }

  createRotationZ(angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    return [
      [{real: cos, imag: -sin}, {real: 0, imag: 0}],
      [{real: 0, imag: 0}, {real: cos, imag: sin}]
    ];
  }

  createCNOTMatrix() {
    const matrix = Array(4).fill(null).map(() => Array(4).fill(null).map(() => ({real: 0, imag: 0})));
    matrix[0][0] = {real: 1, imag: 0}; // |00⟩ → |00⟩
    matrix[1][1] = {real: 1, imag: 0}; // |01⟩ → |01⟩
    matrix[2][3] = {real: 1, imag: 0}; // |10⟩ → |11⟩
    matrix[3][2] = {real: 1, imag: 0}; // |11⟩ → |10⟩
    return matrix;
  }

  createCZMatrix() {
    const matrix = Array(4).fill(null).map(() => Array(4).fill(null).map(() => ({real: 0, imag: 0})));
    matrix[0][0] = {real: 1, imag: 0};
    matrix[1][1] = {real: 1, imag: 0};
    matrix[2][2] = {real: 1, imag: 0};
    matrix[3][3] = {real: -1, imag: 0}; // Phase flip on |11⟩
    return matrix;
  }

  createSWAPMatrix() {
    const matrix = Array(4).fill(null).map(() => Array(4).fill(null).map(() => ({real: 0, imag: 0})));
    matrix[0][0] = {real: 1, imag: 0}; // |00⟩ → |00⟩
    matrix[1][2] = {real: 1, imag: 0}; // |01⟩ → |10⟩
    matrix[2][1] = {real: 1, imag: 0}; // |10⟩ → |01⟩
    matrix[3][3] = {real: 1, imag: 0}; // |11⟩ → |11⟩
    return matrix;
  }

  createCCXMatrix() {
    const matrix = Array(8).fill(null).map(() => Array(8).fill(null).map(() => ({real: 0, imag: 0})));
    for (let i = 0; i < 6; i++) {
      matrix[i][i] = {real: 1, imag: 0}; // Identity for first 6 states
    }
    matrix[6][7] = {real: 1, imag: 0}; // |110⟩ → |111⟩
    matrix[7][6] = {real: 1, imag: 0}; // |111⟩ → |110⟩
    return matrix;
  }

  createCCZMatrix() {
    const matrix = Array(8).fill(null).map(() => Array(8).fill(null).map(() => ({real: 0, imag: 0})));
    for (let i = 0; i < 7; i++) {
      matrix[i][i] = {real: 1, imag: 0};
    }
    matrix[7][7] = {real: -1, imag: 0}; // Phase flip on |111⟩
    return matrix;
  }

  // More efficient gate application using tensor products
  applySingleQubitGate(matrix, targetQubit) {
    const newState = new Array(this.state.length);
    
    for (let i = 0; i < this.state.length; i++) {
      newState[i] = {real: 0, imag: 0};
    }
    
    for (let i = 0; i < this.state.length; i++) {
      const bit = (i >> (this.numQubits - 1 - targetQubit)) & 1;
      const flippedIndex = i ^ (1 << (this.numQubits - 1 - targetQubit));
      
      // Apply matrix transformation
      const coeff0 = matrix[bit][0];
      const coeff1 = matrix[bit][1];
      
      const amp0 = this.state[bit === 0 ? i : flippedIndex];
      const amp1 = this.state[bit === 0 ? flippedIndex : i];
      
      const contribution = QuantumMath.complexAdd(
        QuantumMath.complexMul(coeff0, amp0),
        QuantumMath.complexMul(coeff1, amp1)
      );
      
      newState[i] = QuantumMath.complexAdd(newState[i], contribution);
    }
    
    this.state = newState;
  }

  applyTwoQubitGate(matrix, qubit1, qubit2) {
    const newState = new Array(this.state.length);
    for (let i = 0; i < this.state.length; i++) {
      newState[i] = {real: 0, imag: 0};
    }
    
    for (let i = 0; i < this.state.length; i++) {
      const bit1 = (i >> (this.numQubits - 1 - qubit1)) & 1;
      const bit2 = (i >> (this.numQubits - 1 - qubit2)) & 1;
      const inputState = bit1 * 2 + bit2;
      
      for (let outputState = 0; outputState < 4; outputState++) {
        const outputBit1 = (outputState >> 1) & 1;
        const outputBit2 = outputState & 1;
        
        let outputIndex = i;
        outputIndex &= ~(1 << (this.numQubits - 1 - qubit1));
        outputIndex &= ~(1 << (this.numQubits - 1 - qubit2));
        outputIndex |= (outputBit1 << (this.numQubits - 1 - qubit1));
        outputIndex |= (outputBit2 << (this.numQubits - 1 - qubit2));
        
        const contribution = QuantumMath.complexMul(
          matrix[outputState][inputState],
          this.state[i]
        );
        
        newState[outputIndex] = QuantumMath.complexAdd(
          newState[outputIndex],
          contribution
        );
      }
    }
    
    this.state = newState;
  }

  applyMultiQubitGate(matrix, qubits) {
    const numQubits = qubits.length;
    const matrixSize = Math.pow(2, numQubits);
    
    if (matrix.length !== matrixSize || matrix[0].length !== matrixSize) {
      throw new Error(`Matrix size ${matrix.length}x${matrix[0].length} doesn't match ${numQubits} qubits`);
    }
    
    const newState = new Array(this.state.length);
    for (let i = 0; i < this.state.length; i++) {
      newState[i] = {real: 0, imag: 0};
    }
    
    for (let i = 0; i < this.state.length; i++) {
      // Extract bits for the target qubits
      const inputBits = qubits.map(q => (i >> (this.numQubits - 1 - q)) & 1);
      const inputState = inputBits.reduce((acc, bit, idx) => acc + bit * Math.pow(2, numQubits - 1 - idx), 0);
      
      for (let outputState = 0; outputState < matrixSize; outputState++) {
        // Convert output state to bit array
        const outputBits = [];
        for (let j = 0; j < numQubits; j++) {
          outputBits.push((outputState >> (numQubits - 1 - j)) & 1);
        }
        
        // Construct output index
        let outputIndex = i;
        qubits.forEach((qubit, idx) => {
          outputIndex &= ~(1 << (this.numQubits - 1 - qubit));
          outputIndex |= (outputBits[idx] << (this.numQubits - 1 - qubit));
        });
        
        const contribution = QuantumMath.complexMul(
          matrix[outputState][inputState],
          this.state[i]
        );
        
        newState[outputIndex] = QuantumMath.complexAdd(
          newState[outputIndex],
          contribution
        );
      }
    }
    
    this.state = newState;
  }

  normalizeState() {
    const totalProbability = this.state.reduce((sum, amplitude) => 
      sum + amplitude.real * amplitude.real + amplitude.imag * amplitude.imag, 0);
    
    if (totalProbability > 0) {
      const norm = Math.sqrt(totalProbability);
      this.state.forEach(amplitude => {
        amplitude.real /= norm;
        amplitude.imag /= norm;
      });
    }
  }

  // State access methods remain the same...
  getState() {
    return this.state;
  }

  getStateVector() {
    return this.state.map(amplitude => ({
      real: amplitude.real,
      imag: amplitude.imag,
      magnitude: Math.sqrt(amplitude.real * amplitude.real + amplitude.imag * amplitude.imag),
      phase: Math.atan2(amplitude.imag, amplitude.real)
    }));
  }

  getProbabilities() {
    return this.state.map(amplitude => 
      amplitude.real * amplitude.real + amplitude.imag * amplitude.imag
    );
  }

  getCurrentStateName() {
    const probabilities = this.getProbabilities();
    const maxIndex = probabilities.reduce((maxIdx, curr, idx, arr) => 
      curr > arr[maxIdx] ? idx : maxIdx, 0);
    
    return '|' + maxIndex.toString(2).padStart(this.numQubits, '0') + '⟩';
  }

  getBlochVector(qubitIndex = 0) {
    if (this.numQubits === 1) {
      const alpha = this.state[0];
      const beta = this.state[1];
      
      const x = 2 * (alpha.real * beta.real + alpha.imag * beta.imag);
      const y = 2 * (alpha.imag * beta.real - alpha.real * beta.imag);
      const z = alpha.real * alpha.real + alpha.imag * alpha.imag - 
               beta.real * beta.real - beta.imag * beta.imag;
      
      return { x, y, z };
    } else {
      // For multi-qubit, compute reduced density matrix for single qubit
      return this.getReducedQubitBlochVector(qubitIndex);
    }
  }

  getReducedQubitBlochVector(qubitIndex) {
    // Compute reduced density matrix for single qubit
    const reducedDensity = this.getReducedDensityMatrix(qubitIndex);
    
    // Extract Bloch vector from density matrix
    // ρ = (I + r⃗·σ⃗)/2, so r⃗ = Tr(ρσ⃗)
    const x = 2 * reducedDensity[0][1].real; // Tr(ρσₓ)
    const y = 2 * reducedDensity[0][1].imag; // Tr(ρσᵧ)
    const z = reducedDensity[0][0].real - reducedDensity[1][1].real; // Tr(ρσᵤ)
    
    return { x, y, z };
  }

  getReducedDensityMatrix(qubitIndex) {
    // 2x2 reduced density matrix for single qubit
    const rho = [
      [{real: 0, imag: 0}, {real: 0, imag: 0}],
      [{real: 0, imag: 0}, {real: 0, imag: 0}]
    ];
    
    for (let i = 0; i < this.state.length; i++) {
      for (let j = 0; j < this.state.length; j++) {
        const bit_i = (i >> (this.numQubits - 1 - qubitIndex)) & 1;
        const bit_j = (j >> (this.numQubits - 1 - qubitIndex)) & 1;
        
        // Check if other qubits match
        let otherQubitsMatch = true;
        for (let q = 0; q < this.numQubits; q++) {
          if (q !== qubitIndex) {
            const bit_i_q = (i >> (this.numQubits - 1 - q)) & 1;
            const bit_j_q = (j >> (this.numQubits - 1 - q)) & 1;
            if (bit_i_q !== bit_j_q) {
              otherQubitsMatch = false;
              break;
            }
          }
        }
        
        if (otherQubitsMatch) {
          const element = QuantumMath.complexMul(
            this.state[i],
            QuantumMath.complexConj(this.state[j])
          );
          
          rho[bit_i][bit_j] = QuantumMath.complexAdd(rho[bit_i][bit_j], element);
        }
      }
    }
    
    return rho;
  }

  getClassicalBits() {
    return [...this.classicalBits];
  }

  getHistory() {
    return this.history;
  }

  getCurrentStep() {
    return this.currentStep;
  }

  printState() {
    console.log('Quantum State:');
    this.state.forEach((amplitude, index) => {
      const binaryIndex = index.toString(2).padStart(this.numQubits, '0');
      const prob = amplitude.real * amplitude.real + amplitude.imag * amplitude.imag;
      if (prob > 0.001) {
        console.log(`|${binaryIndex}⟩: ${amplitude.real.toFixed(3)} + ${amplitude.imag.toFixed(3)}i (P=${prob.toFixed(3)})`);
      }
    });
  }

  getStateString() {
    let result = '';
    this.state.forEach((amplitude, index) => {
      const binaryIndex = index.toString(2).padStart(this.numQubits, '0');
      const prob = amplitude.real * amplitude.real + amplitude.imag * amplitude.imag;
      if (prob > 0.001) {
        if (result) result += ' + ';
        result += `${amplitude.real.toFixed(3)}|${binaryIndex}⟩`;
      }
    });
    return result || '0';
  }
}