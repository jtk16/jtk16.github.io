// utils/quantum-math.js - Consolidated quantum and general math utilities
// Removes duplication between quantum-math.js and math-utils.js

export class QuantumMath {
  // ===== COMPLEX NUMBER OPERATIONS =====
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

  static complexExp(a) {
    // e^(a + bi) = e^a * (cos(b) + i*sin(b))
    const expReal = Math.exp(a.real);
    return {
      real: expReal * Math.cos(a.imag),
      imag: expReal * Math.sin(a.imag)
    };
  }

  static complexLog(a) {
    // ln(a + bi) = ln(|a + bi|) + i*arg(a + bi)
    const magnitude = this.complexMagnitude(a);
    const phase = this.complexPhase(a);
    return {
      real: Math.log(magnitude),
      imag: phase
    };
  }

  static complexPow(base, exponent) {
    // (a + bi)^(c + di) = exp((c + di) * ln(a + bi))
    const logBase = this.complexLog(base);
    const product = this.complexMul(exponent, logBase);
    return this.complexExp(product);
  }

  // ===== FORMATTING FUNCTIONS =====
  static formatComplex(amplitude, precision = 3) {
    const real = parseFloat(amplitude.real.toFixed(precision));
    const imag = parseFloat(amplitude.imag.toFixed(precision));
    
    if (Math.abs(imag) < Math.pow(10, -precision)) {
      return real.toString();
    } else if (Math.abs(real) < Math.pow(10, -precision)) {
      return `${imag}i`;
    } else if (imag >= 0) {
      return `${real} + ${imag}i`;
    } else {
      return `${real} - ${Math.abs(imag)}i`;
    }
  }

  static formatState(state) {
    const numQubits = Math.log2(state.length);
    let result = '';
    
    state.forEach((amplitude, index) => {
      const magnitude = this.complexMagnitude(amplitude);
      if (magnitude > 0.001) {
        const binaryIndex = index.toString(2).padStart(numQubits, '0');
        if (result) result += ' + ';
        result += `${this.formatComplex(amplitude)}|${binaryIndex}⟩`;
      }
    });
    
    return result || '0';
  }

  static formatNumber(num, precision = 2) {
    if (Math.abs(num) < 1e-10) return '0';
    if (Math.abs(num) >= 1e6 || Math.abs(num) < 1e-3) {
      return num.toExponential(precision);
    }
    return num.toFixed(precision);
  }

  static formatPercentage(value, precision = 1) {
    return `${(value * 100).toFixed(precision)}%`;
  }

  // ===== MATRIX OPERATIONS =====
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

  static matrixTrace(matrix) {
    let trace = {real: 0, imag: 0};
    const size = Math.min(matrix.length, matrix[0].length);
    
    for (let i = 0; i < size; i++) {
      trace = this.complexAdd(trace, matrix[i][i]);
    }
    
    return trace;
  }

  static matrixDeterminant(matrix) {
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    
    if (n === 2) {
      const term1 = this.complexMul(matrix[0][0], matrix[1][1]);
      const term2 = this.complexMul(matrix[0][1], matrix[1][0]);
      return this.complexSub(term1, term2);
    }
    
    let det = {real: 0, imag: 0};
    
    for (let i = 0; i < n; i++) {
      const subMatrix = matrix.slice(1).map(row => 
        row.filter((_, colIndex) => colIndex !== i)
      );
      
      const cofactor = this.complexMul(
        matrix[0][i],
        this.matrixDeterminant(subMatrix)
      );
      
      if (i % 2 === 0) {
        det = this.complexAdd(det, cofactor);
      } else {
        det = this.complexSub(det, cofactor);
      }
    }
    
    return det;
  }

  // ===== QUANTUM STATE OPERATIONS =====
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

  static computeEntanglement(state) {
    // Von Neumann entropy for 2-qubit states
    if (state.length !== 4) {
      throw new Error('Entanglement calculation currently supports 2-qubit states only');
    }
    
    // Compute reduced density matrix for first qubit
    const rho = [
      [{real: 0, imag: 0}, {real: 0, imag: 0}],
      [{real: 0, imag: 0}, {real: 0, imag: 0}]
    ];
    
    // |00⟩, |01⟩, |10⟩, |11⟩
    rho[0][0] = this.complexAdd(
      this.complexMul(state[0], this.complexConj(state[0])), // |00⟩⟨00|
      this.complexMul(state[1], this.complexConj(state[1]))  // |01⟩⟨01|
    );
    
    rho[0][1] = this.complexAdd(
      this.complexMul(state[0], this.complexConj(state[2])), // |00⟩⟨10|
      this.complexMul(state[1], this.complexConj(state[3]))  // |01⟩⟨11|
    );
    
    rho[1][0] = this.complexConj(rho[0][1]);
    
    rho[1][1] = this.complexAdd(
      this.complexMul(state[2], this.complexConj(state[2])), // |10⟩⟨10|
      this.complexMul(state[3], this.complexConj(state[3]))  // |11⟩⟨11|
    );
    
    // Compute eigenvalues (simplified for 2x2 Hermitian matrix)
    const trace = this.complexAdd(rho[0][0], rho[1][1]).real;
    const det = this.matrixDeterminant(rho).real;
    
    const discriminant = trace * trace - 4 * det;
    const sqrtDisc = Math.sqrt(Math.abs(discriminant));
    
    const eigenval1 = (trace + sqrtDisc) / 2;
    const eigenval2 = (trace - sqrtDisc) / 2;
    
    // Von Neumann entropy
    let entropy = 0;
    if (eigenval1 > 1e-10) entropy -= eigenval1 * Math.log2(eigenval1);
    if (eigenval2 > 1e-10) entropy -= eigenval2 * Math.log2(eigenval2);
    
    return entropy;
  }

  // ===== GENERAL MATH UTILITIES =====
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  static smoothstep(edge0, edge1, x) {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  static degToRad(degrees) {
    return degrees * Math.PI / 180;
  }

  static radToDeg(radians) {
    return radians * 180 / Math.PI;
  }

  // ===== VECTOR OPERATIONS =====
  static vectorDot(a, b) {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }

  static vectorMagnitude(vector) {
    return Math.sqrt(this.vectorDot(vector, vector));
  }

  static vectorNormalize(vector) {
    const magnitude = this.vectorMagnitude(vector);
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  static vectorCross(a, b) {
    if (a.length !== 3 || b.length !== 3) {
      throw new Error('Cross product only defined for 3D vectors');
    }
    
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  static vectorAdd(a, b) {
    return a.map((val, i) => val + b[i]);
  }

  static vectorSubtract(a, b) {
    return a.map((val, i) => val - b[i]);
  }

  static vectorScale(vector, scalar) {
    return vector.map(val => val * scalar);
  }

  // ===== PAULI MATRICES AND COMMON GATES =====
  static pauliI() {
    return [
      [{real: 1, imag: 0}, {real: 0, imag: 0}],
      [{real: 0, imag: 0}, {real: 1, imag: 0}]
    ];
  }

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

  static pauliZ() {
    return [
      [{real: 1, imag: 0}, {real: 0, imag: 0}],
      [{real: 0, imag: 0}, {real: -1, imag: 0}]
    ];
  }

  static hadamard() {
    const factor = 1 / Math.sqrt(2);
    return [
      [{real: factor, imag: 0}, {real: factor, imag: 0}],
      [{real: factor, imag: 0}, {real: -factor, imag: 0}]
    ];
  }

  static phaseGate(angle) {
    return [
      [{real: 1, imag: 0}, {real: 0, imag: 0}],
      [{real: Math.cos(angle), imag: Math.sin(angle)}, {real: 0, imag: 0}]
    ];
  }

  static rotationX(angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    return [
      [{real: cos, imag: 0}, {real: 0, imag: -sin}],
      [{real: 0, imag: -sin}, {real: cos, imag: 0}]
    ];
  }

  static rotationY(angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    return [
      [{real: cos, imag: 0}, {real: -sin, imag: 0}],
      [{real: sin, imag: 0}, {real: cos, imag: 0}]
    ];
  }

  static rotationZ(angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    return [
      [{real: cos, imag: -sin}, {real: 0, imag: 0}],
      [{real: 0, imag: 0}, {real: cos, imag: sin}]
    ];
  }

  // ===== STATISTICAL FUNCTIONS =====
  static mean(array) {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }

  static variance(array) {
    const avg = this.mean(array);
    return this.mean(array.map(x => (x - avg) ** 2));
  }

  static standardDeviation(array) {
    return Math.sqrt(this.variance(array));
  }

  static gaussianProbability(x, mean = 0, stdDev = 1) {
    const variance = stdDev * stdDev;
    const exponent = -0.5 * Math.pow(x - mean, 2) / variance;
    return Math.exp(exponent) / Math.sqrt(2 * Math.PI * variance);
  }

  // ===== RANDOM NUMBER GENERATION =====
  static randomGaussian(mean = 0, stdDev = 1) {
    // Box-Muller transform with closure-based state
    if (!QuantumMath._gaussianState) {
      QuantumMath._gaussianState = { spare: null, hasSpare: false };
    }
    
    const state = QuantumMath._gaussianState;
    
    if (state.hasSpare) {
      state.hasSpare = false;
      return state.spare * stdDev + mean;
    }
    
    state.hasSpare = true;
    
    const u1 = Math.random();
    const u2 = Math.random();
    
    const mag = stdDev * Math.sqrt(-2 * Math.log(u1));
    state.spare = mag * Math.cos(2 * Math.PI * u2);
    
    return mag * Math.sin(2 * Math.PI * u2) + mean;
  }

  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  // ===== EASING FUNCTIONS =====
  static easeInQuad(t) {
    return t * t;
  }

  static easeOutQuad(t) {
    return t * (2 - t);
  }

  static easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeInCubic(t) {
    return t * t * t;
  }

  static easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  static easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ===== COMBINATORICS AND NUMBER THEORY =====
  static factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static binomialCoefficient(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    k = Math.min(k, n - k);
    let result = 1;
    
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }

  static gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    
    return a;
  }

  static isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    
    return true;
  }

  // ===== BIT MANIPULATION =====
  static countSetBits(n) {
    let count = 0;
    while (n) {
      count += n & 1;
      n >>= 1;
    }
    return count;
  }

  static reverseBits(n, numBits) {
    let result = 0;
    for (let i = 0; i < numBits; i++) {
      result = (result << 1) | (n & 1);
      n >>= 1;
    }
    return result;
  }

  static isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
  }

  static nextPowerOfTwo(n) {
    if (n <= 1) return 1;
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  // ===== UTILITY FUNCTIONS =====
  static isFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }

  static range(start, end, step = 1) {
    const result = [];
    if (step > 0) {
      for (let i = start; i < end; i += step) {
        result.push(i);
      }
    } else {
      for (let i = start; i > end; i += step) {
        result.push(i);
      }
    }
    return result;
  }

  static linspace(start, end, num) {
    if (num < 2) return [start];
    
    const step = (end - start) / (num - 1);
    return Array.from({length: num}, (_, i) => start + i * step);
  }

  // ===== COLOR UTILITIES =====
  static hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const a = s * Math.min(l, 1 - l);
    const f = (n, k = (n + h / 30) % 12) => 
      l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    
    return [
      Math.round(f(0) * 255),
      Math.round(f(8) * 255),
      Math.round(f(4) * 255)
    ];
  }

  static colorLerp(color1, color2, t) {
    const r = Math.round(this.lerp(color1[0], color2[0], t));
    const g = Math.round(this.lerp(color1[1], color2[1], t));
    const b = Math.round(this.lerp(color1[2], color2[2], t));
    return [r, g, b];
  }

  // ===== PERFORMANCE UTILITIES =====
  static memoize(fn) {
    const cache = new Map();
    return function(...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Export individual functions for backwards compatibility
export const {
  clamp, lerp, smoothstep, degToRad, radToDeg,
  vectorDot, vectorMagnitude, vectorNormalize, vectorCross, vectorAdd, vectorSubtract, vectorScale,
  mean, variance, standardDeviation, gaussianProbability,
  factorial, binomialCoefficient, gcd, isPrime,
  countSetBits, reverseBits, isPowerOfTwo, nextPowerOfTwo,
  isFiniteNumber, range, linspace,
  hslToRgb, colorLerp,
  memoize, debounce, throttle
} = QuantumMath;