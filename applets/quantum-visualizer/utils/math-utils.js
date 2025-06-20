// utils/math-utils.js
// General mathematical utility functions

export class MathUtils {
  // Basic math operations
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

  // Array operations
  static sum(array) {
    return array.reduce((sum, val) => sum + val, 0);
  }

  static mean(array) {
    return this.sum(array) / array.length;
  }

  static variance(array) {
    const avg = this.mean(array);
    return this.mean(array.map(x => (x - avg) ** 2));
  }

  static standardDeviation(array) {
    return Math.sqrt(this.variance(array));
  }

  // Matrix operations (2D arrays)
  static matrixMultiply(A, B) {
    const rows = A.length;
    const cols = B[0].length;
    const inner = B.length;
    
    const result = Array(rows).fill(null).map(() => Array(cols).fill(0));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let k = 0; k < inner; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    
    return result;
  }

  static matrixTranspose(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    
    const result = Array(cols).fill(null).map(() => Array(rows).fill(0));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }
    
    return result;
  }

  static matrixDeterminant(matrix) {
    const n = matrix.length;
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    let det = 0;
    for (let i = 0; i < n; i++) {
      const subMatrix = matrix.slice(1).map(row => 
        row.filter((_, colIndex) => colIndex !== i)
      );
      det += Math.pow(-1, i) * matrix[0][i] * this.matrixDeterminant(subMatrix);
    }
    
    return det;
  }

  // Vector operations
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

  // Trigonometric utilities
  static sinc(x) {
    return x === 0 ? 1 : Math.sin(x) / x;
  }

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
    
    // Use the more efficient formula
    k = Math.min(k, n - k);
    let result = 1;
    
    for (let i = 0; i < k; i++) {
      result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
  }

  // Probability and statistics
  static gaussian(x, mean = 0, stdDev = 1) {
    const variance = stdDev * stdDev;
    const exponent = -0.5 * Math.pow(x - mean, 2) / variance;
    return Math.exp(exponent) / Math.sqrt(2 * Math.PI * variance);
  }

  static poissonProbability(k, lambda) {
    return Math.pow(lambda, k) * Math.exp(-lambda) / this.factorial(k);
  }

  // Numerical methods
  static newtonRaphson(f, df, x0, tolerance = 1e-10, maxIterations = 100) {
    let x = x0;
    
    for (let i = 0; i < maxIterations; i++) {
      const fx = f(x);
      const dfx = df(x);
      
      if (Math.abs(fx) < tolerance) return x;
      if (Math.abs(dfx) < tolerance) throw new Error('Derivative too small');
      
      x = x - fx / dfx;
    }
    
    throw new Error('Newton-Raphson method did not converge');
  }

  static simpsonsRule(f, a, b, n = 1000) {
    if (n % 2 !== 0) n++; // Ensure n is even
    
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      sum += f(x) * (i % 2 === 0 ? 2 : 4);
    }
    
    return sum * h / 3;
  }

  // Fourier transform utilities
  static dft(signal) {
    const N = signal.length;
    const result = [];
    
    for (let k = 0; k < N; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += signal[n] * Math.cos(angle);
        imag += signal[n] * Math.sin(angle);
      }
      
      result.push({ real, imag });
    }
    
    return result;
  }

  static idft(spectrum) {
    const N = spectrum.length;
    const result = [];
    
    for (let n = 0; n < N; n++) {
      let sum = 0;
      
      for (let k = 0; k < N; k++) {
        const angle = 2 * Math.PI * k * n / N;
        sum += spectrum[k].real * Math.cos(angle) - spectrum[k].imag * Math.sin(angle);
      }
      
      result.push(sum / N);
    }
    
    return result;
  }

  // Random number generation
  static randomGaussian(mean = 0, stdDev = 1) {
    // Box-Muller transform
    let hasSpare = false;
    let spare;
    
    if (hasSpare) {
      hasSpare = false;
      return spare * stdDev + mean;
    }
    
    hasSpare = true;
    
    const u1 = Math.random();
    const u2 = Math.random();
    
    const mag = stdDev * Math.sqrt(-2 * Math.log(u1));
    spare = mag * Math.cos(2 * Math.PI * u2);
    
    return mag * Math.sin(2 * Math.PI * u2) + mean;
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  // Interpolation
  static cubicInterpolate(p0, p1, p2, p3, t) {
    const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
    const b = p0 - 2.5 * p1 + 2 * p2 - 0.5 * p3;
    const c = -0.5 * p0 + 0.5 * p2;
    const d = p1;
    
    return a * t * t * t + b * t * t + c * t + d;
  }

  static bezierInterpolate(points, t) {
    if (points.length === 1) return points[0];
    
    const newPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
      newPoints.push(this.lerp(points[i], points[i + 1], t));
    }
    
    return this.bezierInterpolate(newPoints, t);
  }

  // Easing functions for animations
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

  static easeInOutElastic(t) {
    const c5 = (2 * Math.PI) / 4.5;
    
    return t === 0 ? 0 : t === 1 ? 1 :
      t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  }

  // Geometric utilities
  static pointInCircle(point, center, radius) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy <= radius * radius;
  }

  static pointInRectangle(point, rect) {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width &&
           point.y >= rect.y && 
           point.y <= rect.y + rect.height;
  }

  static distancePointToLine(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Number theory
  static gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    
    return a;
  }

  static lcm(a, b) {
    return Math.abs(a * b) / this.gcd(a, b);
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

  static primeFactors(n) {
    const factors = [];
    let d = 2;
    
    while (d * d <= n) {
      while (n % d === 0) {
        factors.push(d);
        n /= d;
      }
      d++;
    }
    
    if (n > 1) factors.push(n);
    return factors;
  }

  // Bit manipulation
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

  static grayCode(n) {
    return n ^ (n >> 1);
  }

  static inverseGrayCode(gray) {
    let result = gray;
    while (gray >>= 1) {
      result ^= gray;
    }
    return result;
  }

  // Combinatorics
  static permutations(n, r = n) {
    if (r > n || r < 0) return 0;
    
    let result = 1;
    for (let i = n; i > n - r; i--) {
      result *= i;
    }
    return result;
  }

  static combinations(n, r) {
    return this.binomialCoefficient(n, r);
  }

  static stirlingSecond(n, k) {
    // Stirling numbers of the second kind
    if (n === 0 && k === 0) return 1;
    if (n === 0 || k === 0) return 0;
    if (k > n) return 0;
    if (k === 1 || k === n) return 1;
    
    return k * this.stirlingSecond(n - 1, k) + this.stirlingSecond(n - 1, k - 1);
  }

  // Utility functions for formatting
  static formatNumber(num, precision = 2) {
    if (Math.abs(num) < 1e-10) return '0';
    if (Math.abs(num) >= 1e6 || Math.abs(num) < 1e-3) {
      return num.toExponential(precision);
    }
    return num.toFixed(precision);
  }

  static formatComplex(real, imag, precision = 3) {
    const r = parseFloat(real.toFixed(precision));
    const i = parseFloat(imag.toFixed(precision));
    
    if (Math.abs(i) < Math.pow(10, -precision)) {
      return r.toString();
    } else if (Math.abs(r) < Math.pow(10, -precision)) {
      return `${i}i`;
    } else if (i >= 0) {
      return `${r} + ${i}i`;
    } else {
      return `${r} - ${Math.abs(i)}i`;
    }
  }

  static formatPercentage(value, precision = 1) {
    return `${(value * 100).toFixed(precision)}%`;
  }

  // Range utilities
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

  static logspace(start, end, num, base = 10) {
    const linearSpace = this.linspace(start, end, num);
    return linearSpace.map(x => Math.pow(base, x));
  }

  // Validation utilities
  static isFiniteNumber(value) {
    return typeof value === 'number' && isFinite(value);
  }

  static isInteger(value) {
    return Number.isInteger(value);
  }

  static isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
  }

  static nextPowerOfTwo(n) {
    if (n <= 1) return 1;
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  // Performance utilities
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

  // Color utilities (for visualizations)
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

  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  static colorLerp(color1, color2, t) {
    const r = Math.round(this.lerp(color1[0], color2[0], t));
    const g = Math.round(this.lerp(color1[1], color2[1], t));
    const b = Math.round(this.lerp(color1[2], color2[2], t));
    return [r, g, b];
  }
}