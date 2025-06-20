// core/quantum-engine.js
// Core quantum state management and gate operations

import { QuantumMath } from '../utils/quantum-math.js';
import { MathUtils } from '../utils/math-utils.js';

export class QuantumEngine {
  constructor(numQubits = 3) {
    this.numQubits = numQubits;
    this.maxQubits = 5; // Performance limit
    this.state = null;
    this.history = [];
    this.currentStep = 0;
    
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
    
    console.log(`Quantum engine reset with ${this.numQubits} qubits`);
  }

  cloneState() {
    return this.state.map(amplitude => ({
      real: amplitude.real,
      imag: amplitude.imag
    }));
  }

  saveState() {
    this.history = this.history.slice(0, this.currentStep + 1);
    this.history.push(this.cloneState());
    this.currentStep++;
  }

  // Core gate application method
  applyGate(gateName, qubits, parameters = {}) {
    console.log(`Applying ${gateName} gate to qubits:`, qubits);
    
    try {
      const matrix = this.getGateMatrix(gateName, parameters);
      
      if (qubits.length === 1) {
        this.applySingleQubitGate(matrix, qubits[0]);
      } else if (qubits.length === 2) {
        this.applyTwoQubitGate(matrix, qubits[0], qubits[1]);
      } else if (qubits.length >= 3) {
        this.applyMultiQubitGate(matrix, qubits);
      }
      
      this.saveState();
      this.normalizeState();
      
    } catch (error) {
      console.error(`Error applying ${gateName} gate:`, error);
    }
  }

  getGateMatrix(gateName, parameters = {}) {
    const gates = {
      // Pauli gates
      'I': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: 1, imag: 0}]],
      
      'X': [[{real: 0, imag: 0}, {real: 1, imag: 0}], 
            [{real: 1, imag: 0}, {real: 0, imag: 0}]],
      
      'Y': [[{real: 0, imag: 0}, {real: 0, imag: -1}], 
            [{real: 0, imag: 1}, {real: 0, imag: 0}]],
      
      'Z': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: -1, imag: 0}]],
      
      // Hadamard gate
      'H': [[{real: 1/Math.sqrt(2), imag: 0}, {real: 1/Math.sqrt(2), imag: 0}], 
            [{real: 1/Math.sqrt(2), imag: 0}, {real: -1/Math.sqrt(2), imag: 0}]],
      
      // Phase gates
      'S': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: 0, imag: 1}]],
      
      'T': [[{real: 1, imag: 0}, {real: 0, imag: 0}], 
            [{real: 0, imag: 0}, {real: Math.cos(Math.PI/4), imag: Math.sin(Math.PI/4)}]],
      
      // Rotation gates
      'RX': this.createRotationX(parameters.angle || 0),
      'RY': this.createRotationY(parameters.angle || 0),
      'RZ': this.createRotationZ(parameters.angle || 0),
      
      // Two-qubit gates
      'CNOT': this.createCNOTMatrix(),
      'CZ': this.createCZMatrix(),
      'SWAP': this.createSWAPMatrix(),
      
      // Three-qubit gates
      'CCX': this.createCCXMatrix(),
      'CCZ': this.createCCZMatrix()
    };
    
    if (!gates[gateName]) {
      throw new Error(`Unknown gate: ${gateName}`);
    }
    
    return gates[gateName];
  }

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
    // CNOT gate matrix (4x4)
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
    // Toffoli gate (8x8)
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

  applySingleQubitGate(matrix, targetQubit) {
    const newState = this.cloneState();
    const numStates = Math.pow(2, this.numQubits);
    
    for (let i = 0; i < numStates; i++) {
      const bit = (i >> (this.numQubits - 1 - targetQubit)) & 1;
      const flippedIndex = i ^ (1 << (this.numQubits - 1 - targetQubit));
      
      if (bit === 0) {
        // Apply matrix to |0⟩ and |1⟩ components
        const amp0 = this.state[i];
        const amp1 = this.state[flippedIndex];
        
        newState[i] = QuantumMath.complexAdd(
          QuantumMath.complexMul(matrix[0][0], amp0),
          QuantumMath.complexMul(matrix[0][1], amp1)
        );
        
        newState[flippedIndex] = QuantumMath.complexAdd(
          QuantumMath.complexMul(matrix[1][0], amp0),
          QuantumMath.complexMul(matrix[1][1], amp1)
        );
      }
    }
    
    this.state = newState;
  }

  applyTwoQubitGate(matrix, controlQubit, targetQubit) {
    const newState = this.cloneState();
    const numStates = Math.pow(2, this.numQubits);
    
    for (let i = 0; i < numStates; i++) {
      const controlBit = (i >> (this.numQubits - 1 - controlQubit)) & 1;
      const targetBit = (i >> (this.numQubits - 1 - targetQubit)) & 1;
      const basisState = controlBit * 2 + targetBit; // 0, 1, 2, or 3
      
      // Find all four related states
      const states = [];
      for (let j = 0; j < 4; j++) {
        const newControlBit = (j >> 1) & 1;
        const newTargetBit = j & 1;
        
        let stateIndex = i;
        stateIndex &= ~(1 << (this.numQubits - 1 - controlQubit)); // Clear control bit
        stateIndex &= ~(1 << (this.numQubits - 1 - targetQubit));   // Clear target bit
        stateIndex |= (newControlBit << (this.numQubits - 1 - controlQubit)); // Set new control
        stateIndex |= (newTargetBit << (this.numQubits - 1 - targetQubit));   // Set new target
        
        states[j] = stateIndex;
      }
      
      // Apply transformation
      if (i === states[basisState]) {
        newState[i] = {real: 0, imag: 0};
        for (let j = 0; j < 4; j++) {
          newState[i] = QuantumMath.complexAdd(
            newState[i],
            QuantumMath.complexMul(matrix[basisState][j], this.state[states[j]])
          );
        }
      }
    }
    
    this.state = newState;
  }

  applyMultiQubitGate(matrix, qubits) {
    // Simplified multi-qubit gate application
    console.log('Applying multi-qubit gate to qubits:', qubits);
    
    if (qubits.length === 3 && matrix.length === 8) {
      this.applyThreeQubitGate(matrix, qubits);
    }
  }

  applyThreeQubitGate(matrix, qubits) {
    const newState = this.cloneState();
    const numStates = Math.pow(2, this.numQubits);
    
    for (let i = 0; i < numStates; i++) {
      const bits = qubits.map(q => (i >> (this.numQubits - 1 - q)) & 1);
      const basisState = bits[0] * 4 + bits[1] * 2 + bits[2];
      
      // Find all eight related states
      const states = [];
      for (let j = 0; j < 8; j++) {
        const newBits = [(j >> 2) & 1, (j >> 1) & 1, j & 1];
        
        let stateIndex = i;
        qubits.forEach((qubit, idx) => {
          stateIndex &= ~(1 << (this.numQubits - 1 - qubit));
          stateIndex |= (newBits[idx] << (this.numQubits - 1 - qubit));
        });
        
        states[j] = stateIndex;
      }
      
      // Apply transformation
      if (i === states[basisState]) {
        newState[i] = {real: 0, imag: 0};
        for (let j = 0; j < 8; j++) {
          newState[i] = QuantumMath.complexAdd(
            newState[i],
            QuantumMath.complexMul(matrix[basisState][j], this.state[states[j]])
          );
        }
      }
    }
    
    this.state = newState;
  }

  // Special oracle for Grover's algorithm
  applyOracle(qubits, markedState = null) {
    // Default: mark the |111...1⟩ state
    const targetState = markedState !== null ? markedState : Math.pow(2, qubits.length) - 1;
    
    // Apply phase flip to marked state
    this.state[targetState].real *= -1;
    this.state[targetState].imag *= -1;
    
    this.saveState();
    console.log(`Oracle applied, marked state: |${targetState.toString(2).padStart(qubits.length, '0')}⟩`);
  }

  // Diffusion operator for Grover's algorithm
  applyDiffusion(qubits) {
    // H⊗n - X⊗n - CCZ - X⊗n - H⊗n
    
    // Apply Hadamard to all qubits
    qubits.forEach(q => this.applyGate('H', [q]));
    
    // Apply X to all qubits
    qubits.forEach(q => this.applyGate('X', [q]));
    
    // Apply conditional phase flip (CCZ or multi-controlled Z)
    if (qubits.length === 3) {
      this.applyGate('CCZ', qubits);
    } else {
      // For other sizes, apply phase flip to |111...1⟩ state
      const allOnesState = Math.pow(2, qubits.length) - 1;
      this.state[allOnesState].real *= -1;
      this.state[allOnesState].imag *= -1;
    }
    
    // Apply X to all qubits again
    qubits.forEach(q => this.applyGate('X', [q]));
    
    // Apply Hadamard to all qubits again
    qubits.forEach(q => this.applyGate('H', [q]));
    
    console.log('Diffusion operator applied');
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

  // Measurement
  measure(qubits = null) {
    const measureQubits = qubits || Array.from({length: this.numQubits}, (_, i) => i);
    const probabilities = this.getProbabilities();
    
    // Random measurement based on probabilities
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        const binaryState = i.toString(2).padStart(this.numQubits, '0');
        
        // Collapse to measured state
        this.state.fill({real: 0, imag: 0});
        this.state[i] = {real: 1, imag: 0};
        
        this.saveState();
        
        return {
          state: binaryState,
          stateIndex: i,
          probability: probabilities[i],
          qubits: measureQubits
        };
      }
    }
    
    // Fallback
    return {
      state: '0'.repeat(this.numQubits),
      stateIndex: 0,
      probability: probabilities[0] || 1,
      qubits: measureQubits
    };
  }

  // State access methods
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

  // Bloch sphere coordinates (for single qubit only)
  getBlochVector(qubitIndex = 0) {
    if (this.numQubits !== 1 && qubitIndex >= this.numQubits) {
      return { x: 0, y: 0, z: 1 };
    }
    
    if (this.numQubits === 1) {
      // For single qubit: |ψ⟩ = α|0⟩ + β|1⟩
      const alpha = this.state[0];
      const beta = this.state[1];
      
      const x = 2 * (alpha.real * beta.real + alpha.imag * beta.imag);
      const y = 2 * (alpha.imag * beta.real - alpha.real * beta.imag);
      const z = alpha.real * alpha.real + alpha.imag * alpha.imag - 
               beta.real * beta.real - beta.imag * beta.imag;
      
      return { x, y, z };
    } else {
      // For multi-qubit, trace out other qubits (simplified)
      const prob0 = this.getQubitProbability(qubitIndex, 0);
      const prob1 = this.getQubitProbability(qubitIndex, 1);
      
      return { 
        x: 0, 
        y: 0, 
        z: prob0 - prob1 
      };
    }
  }

  getQubitProbability(qubitIndex, value) {
    let probability = 0;
    const numStates = Math.pow(2, this.numQubits);
    
    for (let i = 0; i < numStates; i++) {
      const bit = (i >> (this.numQubits - 1 - qubitIndex)) & 1;
      if (bit === value) {
        const amplitude = this.state[i];
        probability += amplitude.real * amplitude.real + amplitude.imag * amplitude.imag;
      }
    }
    
    return probability;
  }

  // History navigation
  stepTo(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.history.length) {
      this.currentStep = stepIndex;
      this.state = this.history[stepIndex].map(amp => ({...amp}));
      return true;
    }
    return false;
  }

  getHistory() {
    return this.history;
  }

  // Debug methods
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