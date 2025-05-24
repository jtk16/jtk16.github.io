// assets/js/graph-laplacian-engine.js
class GraphLaplacianEngine {
  constructor() {
    this.tolerance = 1e-10;
    this.maxIterations = 1000;
  }

  // Generate eigenvalues for common graph types
  getPresetEigenvalues(type, n) {
    switch(type) {
      case 'path':
        return this.pathGraphEigenvalues(n);
      case 'cycle':
        return this.cycleGraphEigenvalues(n);
      case 'complete':
        return this.completeGraphEigenvalues(n);
      case 'star':
        return this.starGraphEigenvalues(n);
      case 'wheel':
        return this.wheelGraphEigenvalues(n);
      case 'random':
        return this.randomValidEigenvalues(n);
      default:
        return new Array(n).fill(0).map((_, i) => i);
    }
  }

  pathGraphEigenvalues(n) {
    const eigenvals = [];
    for (let k = 1; k <= n; k++) {
      eigenvals.push(2 - 2 * Math.cos((k * Math.PI) / (n + 1)));
    }
    return eigenvals.sort((a, b) => a - b);
  }

  cycleGraphEigenvalues(n) {
    const eigenvals = [];
    for (let k = 0; k < n; k++) {
      eigenvals.push(2 - 2 * Math.cos((2 * Math.PI * k) / n));
    }
    return eigenvals.sort((a, b) => a - b);
  }

  completeGraphEigenvalues(n) {
    const eigenvals = [0];
    for (let i = 1; i < n; i++) {
      eigenvals.push(n);
    }
    return eigenvals;
  }

  starGraphEigenvalues(n) {
    const eigenvals = [0, 1];
    for (let i = 2; i < n; i++) {
      eigenvals.push(1);
    }
    eigenvals[n - 1] = n;
    return eigenvals.sort((a, b) => a - b);
  }

  wheelGraphEigenvalues(n) {
    const cycleEigenvals = this.cycleGraphEigenvalues(n - 1);
    return [0, ...cycleEigenvals.slice(1).map(x => x + 1), n];
  }

  randomValidEigenvalues(n) {
    const eigenvals = [0];
    for (let i = 1; i < n; i++) {
      eigenvals.push(Math.random() * 4 + 0.1);
    }
    return eigenvals.sort((a, b) => a - b);
  }

  validateEigenvalues(eigenvals) {
    const n = eigenvals.length;
    
    if (Math.abs(eigenvals[0]) > this.tolerance) {
      return { valid: false, reason: "First eigenvalue must be 0" };
    }

    for (let i = 0; i < n - 1; i++) {
      if (eigenvals[i] > eigenvals[i + 1] + this.tolerance) {
        return { valid: false, reason: "Eigenvalues must be non-decreasing" };
      }
    }

    if (eigenvals[1] < this.tolerance && n > 2) {
      return { valid: false, reason: "Graph would be disconnected" };
    }

    return { valid: true, confidence: this.computeConfidence(eigenvals) };
  }

  computeConfidence(eigenvals) {
    const n = eigenvals.length;
    let score = 1.0;

    for (let i = 1; i < n - 1; i++) {
      const gap = eigenvals[i + 1] - eigenvals[i];
      if (gap > 3) score *= 0.8;
    }

    const maxEigenval = eigenvals[n - 1];
    if (maxEigenval > 2 * n) score *= 0.7;

    return Math.max(0.1, Math.min(1.0, score));
  }

  projectToValidEigenvalues(eigenvals) {
    const projected = [...eigenvals].sort((a, b) => a - b);
    projected[0] = 0;
    
    for (let i = 0; i < projected.length; i++) {
      projected[i] = Math.max(0, projected[i]);
    }

    if (projected.length > 1 && projected[1] < 0.01) {
      projected[1] = 0.1;
    }

    return projected;
  }

  generateGraphFromEigenvalues(eigenvals) {
    const n = eigenvals.length;
    const positions = this.generateSpectralPositions(eigenvals);
    const adjacency = this.constructAdjacencyMatrix(eigenvals, positions);
    
    return {
      positions,
      adjacency,
      eigenvalues: eigenvals,
      properties: this.computeGraphProperties(eigenvals)
    };
  }

  generateSpectralPositions(eigenvals) {
    const n = eigenvals.length;
    const positions = [];
    
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n;
      const radius = 150 + 50 * Math.sin(eigenvals[Math.min(i, eigenvals.length - 1)]);
      
      positions.push({
        x: 300 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle)
      });
    }
    
    return positions;
  }

  constructAdjacencyMatrix(eigenvals, positions) {
    const n = eigenvals.length;
    const adjacency = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const spectralDistance = this.computeSpectralDistance(i, j, eigenvals);
        const probability = Math.exp(-spectralDistance);
        
        if (probability > 0.3) {
          adjacency[i][j] = adjacency[j][i] = 1;
        }
      }
    }
    
    return adjacency;
  }

  computeSpectralDistance(i, j, eigenvals) {
    const n = eigenvals.length;
    let distance = 0;
    
    for (let k = 1; k < Math.min(4, n); k++) {
      const eigenval = eigenvals[k];
      if (eigenval > 1e-6) {
        distance += Math.abs(Math.cos(2 * Math.PI * k * i / n) - 
                           Math.cos(2 * Math.PI * k * j / n)) / eigenval;
      }
    }
    
    return distance;
  }

  computeGraphProperties(eigenvals) {
    const n = eigenvals.length;
    return {
      spectralGap: eigenvals[1] - eigenvals[0],
      algebraicConnectivity: eigenvals[1],
      maxEigenvalue: eigenvals[n - 1],
      eigenvalueSum: eigenvals.reduce((a, b) => a + b, 0)
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GraphLaplacianEngine;
} else if (typeof window !== 'undefined') {
  window.GraphLaplacianEngine = GraphLaplacianEngine;
}