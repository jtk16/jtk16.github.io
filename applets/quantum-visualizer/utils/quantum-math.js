// utils/quantum-math.js
// Quantum-specific mathematical operations

export class QuantumMath {
  // Complex number operations
  static complexAdd(a, b) {
    return {
      real: a.real + b.real,
      imag: a.imag + b.imag
    };
  }

  static complexSub(a, b) {
    return {
      real: a.real - b.real,
      imag: a.imag - b.imag
    };
  }

  static complexMul(a, b) {
    return {
      real: a.real * b.real - a.imag * b.imag,
      imag: a.real * b.imag + a.imag * b.real
    };
  }

  static complexDiv(a, b) {
    const denominator = b.real * b.real + b.imag * b.imag;
    if (denominator === 0) {
      throw new Error('Division by zero in complex numbers');
    }
    
    return {
      real: (a.real * b.real + a.imag * b.imag) / denominator,
      imag: (a.imag * b.real - a.real * b.imag) / denominator
    };
  }

  static complexConj(a) {
    return {
      real: a.real,
      imag: -a.imag
    };
  }

  static complexMagnitude(a) {
    return Math.sqrt(a.real * a.real + a.imag * a.imag);
  }

  static complexPhase(a) {
    return Math.atan2(a.imag, a.real);
  }

  static complexFromPolar(magnitude, phase) {
    return {
      real: magnitude * Math.cos(phase),
      imag: magnitude * Math.sin(phase)
    };
  }

  // Matrix operations
  static matrixMultiply(A, B) {
    const rows = A.length;
    const cols = B[0].length;
    const inner = B.length;
    
    const result = Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => ({real: 0, imag: 0}))
    );
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let k = 0; k < inner; k++) {
          result[i][j] = this.complexAdd(
            result[i][j],
            this.complexMul(A[i][k], B[k][j])
          );
        }
      }
    }
    
    return result;
  }

  static matrixVectorMultiply(matrix, vector) {
    const result = Array(matrix.length).fill(null).map(() => ({real: 0, imag: 0}));
    
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < vector.length; j++) {
        result[i] = this.complexAdd(
          result[i],
          this.complexMul(matrix[i][j], vector[j])
        );
      }
    }
    
    return result;
  }

  static tensorProduct(A, B) {
    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;
    
    const result = Array(rowsA * rowsB).fill(null).map(() => 
      Array(colsA * colsB).fill(null).map(() => ({real: 0, imag: 0}))
    );
    
    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsA; j++) {
        for (let k = 0; k < rowsB; k++) {
          for (let l = 0; l < colsB; l++) {
            result[i * rowsB + k][j * colsB + l] = this.complexMul(A[i][j], B[k][l]);
          }
        }
      }
    }
    
    return result;
  }

  static matrixTranspose(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    const result = Array(cols).fill(null).map(() => 
      Array(rows).fill(null).map(() => ({real: 0, imag: 0}))
    );
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }
    
    return result;
  }

  static matrixConjugateTranspose(matrix) {
    const transposed = this.matrixTranspose(matrix);
    
    return transposed.map(row => 
      row.map(element => this.complexConj(element))
    );
  }

  // Quantum state operations
  static normalizeState(state) {
    const totalProbability = state.reduce((sum, amplitude) => 
      sum + this.complexMagnitude(amplitude) ** 2, 0);
    
    if (totalProbability === 0) {
      return state; // Avoid division by zero
    }
    
    const norm = Math.sqrt(totalProbability);
    return state.map(amplitude => ({
      real: amplitude.real / norm,
      imag: amplitude.imag / norm
    }));
  }

  static computeProbabilities(state) {
    return state.map(amplitude => this.complexMagnitude(amplitude) ** 2);
  }

  static computeFidelity(state1, state2) {
    if (state1.length !== state2.length) {
      throw new Error('States must have the same dimension');
    }
    
    let fidelity = {real: 0, imag: 0};
    
    for (let i = 0; i < state1.length; i++) {
      fidelity = this.complexAdd(
        fidelity,
        this.complexMul(this.complexConj(state1[i]), state2[i])
      );
    }
    
    return this.complexMagnitude(fidelity) ** 2;
  }

  // Pauli matrices and common gates
  static pauliX() {
    return [
      [{real: 0, imag: 0}, {real: 1, imag: 0}],
      [{real: 1, imag: 0}, {real: 0, imag: 0}]
    ];
  }

  static pauliY() {
    return [
      [{real: 0, imag: 0}, {real: 0, imag: -1}],
      [{real: 0, imag: 1}, {real: 0, imag: 0}]
    ];
  }
}