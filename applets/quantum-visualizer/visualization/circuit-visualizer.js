// visualization/circuit-renderer.js
// SVG-based quantum circuit diagram renderer

export class CircuitRenderer {
  constructor(svgElement) {
    this.svg = svgElement;
    this.currentAlgorithm = null;
    this.currentStep = -1;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    
    // Visual constants
    this.config = {
      qubitSpacing: 80,
      gateWidth: 40,
      gateHeight: 30,
      wireLength: 60,
      fontSize: 14,
      smallFontSize: 10,
      strokeWidth: 2,
      colors: {
        wire: '#94a3b8',
        gateBox: '#6366f1',
        gateText: '#ffffff',
        controlDot: '#6366f1',
        controlLine: '#6366f1',
        measurement: '#10b981',
        oracle: '#ec4899',
        active: '#f59e0b',
        completed: '#10b981'
      }
    };
    
    this.setupSVG();
    this.bindEvents();
  }

  setupSVG() {
    this.svg.setAttribute('viewBox', '0 0 800 400');
    this.svg.style.background = '#0f172a';
    this.svg.style.border = '1px solid #334155';
    this.svg.style.borderRadius = '0.5rem';
    
    // Create main group for transformations
    this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.mainGroup.setAttribute('class', 'main-circuit-group');
    this.svg.appendChild(this.mainGroup);
    
    // Create grid background
    this.createGrid();
  }

  createGrid() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', '20');
    pattern.setAttribute('height', '20');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 20 0 L 0 0 0 20');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#1e293b');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('opacity', '0.5');
    
    pattern.appendChild(path);
    defs.appendChild(pattern);
    this.svg.insertBefore(defs, this.mainGroup);
    
    const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    gridRect.setAttribute('x', '0');
    gridRect.setAttribute('y', '0');
    gridRect.setAttribute('width', '100%');
    gridRect.setAttribute('height', '100%');
    gridRect.setAttribute('fill', 'url(#grid)');
    this.mainGroup.appendChild(gridRect);
  }

  bindEvents() {
    let isPanning = false;
    let lastX, lastY;

    this.svg.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        this.svg.style.cursor = 'grabbing';
      }
    });

    this.svg.addEventListener('mousemove', (e) => {
      if (isPanning) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        this.panX += deltaX / this.zoom;
        this.panY += deltaY / this.zoom;
        
        this.updateTransform();
        
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    this.svg.addEventListener('mouseup', () => {
      isPanning = false;
      this.svg.style.cursor = 'grab';
    });

    this.svg.addEventListener('mouseleave', () => {
      isPanning = false;
      this.svg.style.cursor = 'default';
    });

    this.svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const rect = this.svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, this.zoom * scaleFactor));
      
      // Zoom towards mouse position
      this.panX -= (mouseX / this.zoom - mouseX / newZoom);
      this.panY -= (mouseY / this.zoom - mouseY / newZoom);
      this.zoom = newZoom;
      
      this.updateTransform();
    });
  }

  updateTransform() {
    this.mainGroup.setAttribute('transform', 
      `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`);
  }

  renderCircuit(algorithm) {
    this.currentAlgorithm = algorithm;
    this.currentStep = -1;
    this.clearCircuit();
    
    if (!algorithm || !algorithm.steps) return;
    
    const numQubits = algorithm.qubits;
    const numSteps = algorithm.steps.length;
    
    // Calculate circuit dimensions
    const circuitWidth = (numSteps + 2) * this.config.wireLength;
    const circuitHeight = numQubits * this.config.qubitSpacing;
    
    // Update SVG viewBox
    this.svg.setAttribute('viewBox', `0 0 ${circuitWidth + 100} ${circuitHeight + 100}`);
    
    // Draw qubit lines
    this.drawQubitLines(numQubits, circuitWidth);
    
    // Draw qubit labels
    this.drawQubitLabels(numQubits);
    
    // Draw gates and operations
    this.drawGates(algorithm.steps, numQubits);
    
    // Draw measurement indicators
    this.drawMeasurements(algorithm.steps, numQubits);
    
    console.log(`Rendered circuit for ${algorithm.name} with ${numQubits} qubits and ${numSteps} steps`);
  }

  clearCircuit() {
    // Remove all elements except grid and defs
    const children = Array.from(this.mainGroup.children);
    children.forEach(child => {
      if (!child.getAttribute('id')?.includes('grid') && child.tagName !== 'defs') {
        this.mainGroup.removeChild(child);
      }
    });
  }

  drawQubitLines(numQubits, circuitWidth) {
    for (let i = 0; i < numQubits; i++) {
      const y = 50 + i * this.config.qubitSpacing;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '40');
      line.setAttribute('y1', y);
      line.setAttribute('x2', circuitWidth);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', this.config.colors.wire);
      line.setAttribute('stroke-width', this.config.strokeWidth);
      line.setAttribute('class', 'qubit-line');
      
      this.mainGroup.appendChild(line);
    }
  }

  drawQubitLabels(numQubits) {
    for (let i = 0; i < numQubits; i++) {
      const y = 50 + i * this.config.qubitSpacing;
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '20');
      label.setAttribute('y', y + 5);
      label.setAttribute('fill', this.config.colors.wire);
      label.setAttribute('font-family', 'JetBrains Mono, monospace');
      label.setAttribute('font-size', this.config.fontSize);
      label.setAttribute('text-anchor', 'middle');
      label.textContent = `q${i}`;
      
      this.mainGroup.appendChild(label);
    }
  }

  drawGates(steps, numQubits) {
    let stepPosition = 0;
    
    steps.forEach((step, stepIndex) => {
      const x = 80 + stepPosition * this.config.wireLength;
      
      switch (step.type) {
        case 'gate':
          this.drawGate(step, x, stepIndex);
          break;
        case 'oracle':
          this.drawOracle(step, x, stepIndex);
          break;
        case 'measure':
          this.drawMeasurement(step, x, stepIndex);
          break;
      }
      
      stepPosition++;
    });
  }

  drawGate(step, x, stepIndex) {
    const qubits = step.qubits;
    
    if (qubits.length === 1) {
      this.drawSingleQubitGate(step.gate, x, qubits[0], stepIndex);
    } else if (qubits.length === 2) {
      this.drawTwoQubitGate(step.gate, x, qubits[0], qubits[1], stepIndex);
    } else {
      this.drawMultiQubitGate(step.gate, x, qubits, stepIndex);
    }
  }

  drawSingleQubitGate(gateName, x, qubit, stepIndex) {
    const y = 50 + qubit * this.config.qubitSpacing;
    
    const gateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gateGroup.setAttribute('class', `gate gate-${stepIndex}`);
    gateGroup.setAttribute('data-step', stepIndex);
    
    // Gate box
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - this.config.gateWidth / 2);
    rect.setAttribute('y', y - this.config.gateHeight / 2);
    rect.setAttribute('width', this.config.gateWidth);
    rect.setAttribute('height', this.config.gateHeight);
    rect.setAttribute('fill', this.config.colors.gateBox);
    rect.setAttribute('stroke', '#475569');
    rect.setAttribute('stroke-width', this.config.strokeWidth);
    rect.setAttribute('rx', '4');
    rect.setAttribute('class', 'gate-box');
    
    // Gate label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 4);
    text.setAttribute('fill', this.config.colors.gateText);
    text.setAttribute('font-family', 'JetBrains Mono, monospace');
    text.setAttribute('font-size', this.config.fontSize);
    text.setAttribute('font-weight', '600');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'gate-text');
    text.textContent = gateName;
    
    gateGroup.appendChild(rect);
    gateGroup.appendChild(text);
    this.mainGroup.appendChild(gateGroup);
  }

  drawTwoQubitGate(gateName, x, controlQubit, targetQubit, stepIndex) {
    if (gateName === 'CNOT') {
      this.drawCNOT(x, controlQubit, targetQubit, stepIndex);
    } else if (gateName === 'CZ') {
      this.drawCZ(x, controlQubit, targetQubit, stepIndex);
    } else {
      // Generic two-qubit gate
      this.drawGenericTwoQubitGate(gateName, x, controlQubit, targetQubit, stepIndex);
    }
  }

  drawCNOT(x, controlQubit, targetQubit, stepIndex) {
    const controlY = 50 + controlQubit * this.config.qubitSpacing;
    const targetY = 50 + targetQubit * this.config.qubitSpacing;
    
    const gateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gateGroup.setAttribute('class', `gate gate-${stepIndex}`);
    gateGroup.setAttribute('data-step', stepIndex);
    
    // Control line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', Math.min(controlY, targetY));
    line.setAttribute('x2', x);
    line.setAttribute('y2', Math.max(controlY, targetY));
    line.setAttribute('stroke', this.config.colors.controlLine);
    line.setAttribute('stroke-width', this.config.strokeWidth);
    line.setAttribute('class', 'control-line');
    
    // Control dot
    const controlDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    controlDot.setAttribute('cx', x);
    controlDot.setAttribute('cy', controlY);
    controlDot.setAttribute('r', '6');
    controlDot.setAttribute('fill', this.config.colors.controlDot);
    controlDot.setAttribute('stroke', '#475569');
    controlDot.setAttribute('stroke-width', '2');
    controlDot.setAttribute('class', 'control-dot');
    
    // Target (X) gate
    const targetCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    targetCircle.setAttribute('cx', x);
    targetCircle.setAttribute('cy', targetY);
    targetCircle.setAttribute('r', '15');
    targetCircle.setAttribute('fill', 'transparent');
    targetCircle.setAttribute('stroke', this.config.colors.controlDot);
    targetCircle.setAttribute('stroke-width', this.config.strokeWidth);
    targetCircle.setAttribute('class', 'target-circle');
    
    // X symbol
    const xLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xLine1.setAttribute('x1', x - 8);
    xLine1.setAttribute('y1', targetY - 8);
    xLine1.setAttribute('x2', x + 8);
    xLine1.setAttribute('y2', targetY + 8);
    xLine1.setAttribute('stroke', this.config.colors.controlDot);
    xLine1.setAttribute('stroke-width', this.config.strokeWidth);
    
    const xLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xLine2.setAttribute('x1', x - 8);
    xLine2.setAttribute('y1', targetY + 8);
    xLine2.setAttribute('x2', x + 8);
    xLine2.setAttribute('y2', targetY - 8);
    xLine2.setAttribute('stroke', this.config.colors.controlDot);
    xLine2.setAttribute('stroke-width', this.config.strokeWidth);
    
    gateGroup.appendChild(line);
    gateGroup.appendChild(controlDot);
    gateGroup.appendChild(targetCircle);
    gateGroup.appendChild(xLine1);
    gateGroup.appendChild(xLine2);
    this.mainGroup.appendChild(gateGroup);
  }

  drawCZ(x, controlQubit, targetQubit, stepIndex) {
    const controlY = 50 + controlQubit * this.config.qubitSpacing;
    const targetY = 50 + targetQubit * this.config.qubitSpacing;
    
    const gateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gateGroup.setAttribute('class', `gate gate-${stepIndex}`);
    gateGroup.setAttribute('data-step', stepIndex);
    
    // Control line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', Math.min(controlY, targetY));
    line.setAttribute('x2', x);
    line.setAttribute('y2', Math.max(controlY, targetY));
    line.setAttribute('stroke', this.config.colors.controlLine);
    line.setAttribute('stroke-width', this.config.strokeWidth);
    
    // Both dots (CZ is symmetric)
    const controlDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    controlDot.setAttribute('cx', x);
    controlDot.setAttribute('cy', controlY);
    controlDot.setAttribute('r', '6');
    controlDot.setAttribute('fill', this.config.colors.controlDot);
    controlDot.setAttribute('stroke', '#475569');
    controlDot.setAttribute('stroke-width', '2');
    
    const targetDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    targetDot.setAttribute('cx', x);
    targetDot.setAttribute('cy', targetY);
    targetDot.setAttribute('r', '6');
    targetDot.setAttribute('fill', this.config.colors.controlDot);
    targetDot.setAttribute('stroke', '#475569');
    targetDot.setAttribute('stroke-width', '2');
    
    gateGroup.appendChild(line);
    gateGroup.appendChild(controlDot);
    gateGroup.appendChild(targetDot);
    this.mainGroup.appendChild(gateGroup);
  }

  drawGenericTwoQubitGate(gateName, x, qubit1, qubit2, stepIndex) {
    const y1 = 50 + qubit1 * this.config.qubitSpacing;
    const y2 = 50 + qubit2 * this.config.qubitSpacing;
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const centerY = (y1 + y2) / 2;
    
    const gateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gateGroup.setAttribute('class', `gate gate-${stepIndex}`);
    gateGroup.setAttribute('data-step', stepIndex);
    
    // Gate box spanning both qubits
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - this.config.gateWidth / 2);
    rect.setAttribute('y', minY - this.config.gateHeight / 2);
    rect.setAttribute('width', this.config.gateWidth);
    rect.setAttribute('height', maxY - minY + this.config.gateHeight);
    rect.setAttribute('fill', this.config.colors.gateBox);
    rect.setAttribute('stroke', '#475569');
    rect.setAttribute('stroke-width', this.config.strokeWidth);
    rect.setAttribute('rx', '4');
    
    // Gate label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', centerY + 4);
    text.setAttribute('fill', this.config.colors.gateText);
    text.setAttribute('font-family', 'JetBrains Mono, monospace');
    text.setAttribute('font-size', this.config.fontSize);
    text.setAttribute('font-weight', '600');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = gateName;
    
    gateGroup.appendChild(rect);
    gateGroup.appendChild(text);
    this.mainGroup.appendChild(gateGroup);
  }

  drawMultiQubitGate(gateName, x, qubits, stepIndex) {
    const ys = qubits.map(q => 50 + q * this.config.qubitSpacing);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerY = (minY + maxY) / 2;
    
    const gateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gateGroup.setAttribute('class', `gate gate-${stepIndex}`);
    gateGroup.setAttribute('data-step', stepIndex);
    
    if (gateName === 'CCX' || gateName === 'CCZ') {
      this.drawControlledGate(gateName, x, qubits, stepIndex, gateGroup);
    } else {
      // Generic multi-qubit gate
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x - this.config.gateWidth / 2);
      rect.setAttribute('y', minY - this.config.gateHeight / 2);
      rect.setAttribute('width', this.config.gateWidth);
      rect.setAttribute('height', maxY - minY + this.config.gateHeight);
      rect.setAttribute('fill', this.config.colors.gateBox);
      rect.setAttribute('stroke', '#475569');
      rect.setAttribute('stroke-width', this.config.strokeWidth);
      rect.setAttribute('rx', '4');
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', centerY + 4);
      text.setAttribute('fill', this.config.colors.gateText);
      text.setAttribute('font-family', 'JetBrains Mono, monospace');
      text.setAttribute('font-size', this.config.smallFontSize);
      text.setAttribute('font-weight', '600');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = gateName;
      
      gateGroup.appendChild(rect);
      gateGroup.appendChild(text);
    }
    
    this.mainGroup.appendChild(gateGroup);
  }

  drawControlledGate(gateName, x, qubits, stepIndex, gateGroup) {
    const ys = qubits.map(q => 50 + q * this.config.qubitSpacing);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    // Draw control line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', minY);
    line.setAttribute('x2', x);
    line.setAttribute('y2', maxY);
    line.setAttribute('stroke', this.config.colors.controlLine);
    line.setAttribute('stroke-width', this.config.strokeWidth);
    gateGroup.appendChild(line);
    
    // Draw control dots for all but last qubit
    for (let i = 0; i < qubits.length - 1; i++) {
      const y = 50 + qubits[i] * this.config.qubitSpacing;
      const controlDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      controlDot.setAttribute('cx', x);
      controlDot.setAttribute('cy', y);
      controlDot.setAttribute('r', '6');
      controlDot.setAttribute('fill', this.config.colors.controlDot);
      controlDot.setAttribute('stroke', '#475569');
      controlDot.setAttribute('stroke-width', '2');
      gateGroup.appendChild(controlDot);
    }
    
    // Draw target
    const targetQubit = qubits[qubits.length - 1];
    const targetY = 50 + targetQubit * this.config.qubitSpacing;
    
    if (gateName === 'CCX') {
      // X target
      const targetCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      targetCircle.setAttribute('cx', x);
      targetCircle.setAttribute('cy', targetY);
      targetCircle.setAttribute('r', '15');
      targetCircle.setAttribute('fill', 'transparent');
      targetCircle.setAttribute('stroke', this.config.colors.controlDot);
      targetCircle.setAttribute('stroke-width', this.config.strokeWidth);
      gateGroup.appendChild(targetCircle);
      
      const xLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      xLine1.setAttribute('x1', x - 8);
      xLine1.setAttribute('y1', targetY - 8);
      xLine1.setAttribute('x2', x + 8);
      xLine1.setAttribute('y2', targetY + 8);
      xLine1.setAttribute('stroke', this.config.colors.controlDot);
      xLine1.setAttribute('stroke-width', this.config.strokeWidth);
      
      const xLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      xLine2.setAttribute('x1', x - 8);
      xLine2.setAttribute('y1', targetY + 8);
      xLine2.setAttribute('x2', x + 8);
      xLine2.setAttribute('y2', targetY - 8);
      xLine2.setAttribute('stroke', this.config.colors.controlDot);
      xLine2.setAttribute('stroke-width', this.config.strokeWidth);
      
      gateGroup.appendChild(xLine1);
      gateGroup.appendChild(xLine2);
    } else {
      // Z target (just a control dot)
      const targetDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      targetDot.setAttribute('cx', x);
      targetDot.setAttribute('cy', targetY);
      targetDot.setAttribute('r', '6');
      targetDot.setAttribute('fill', this.config.colors.controlDot);
      targetDot.setAttribute('stroke', '#475569');
      targetDot.setAttribute('stroke-width', '2');
      gateGroup.appendChild(targetDot);
    }
  }

  drawOracle(step, x, stepIndex) {
    const qubits = step.qubits;
    const ys = qubits.map(q => 50 + q * this.config.qubitSpacing);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerY = (minY + maxY) / 2;
    
    const gateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gateGroup.setAttribute('class', `gate gate-${stepIndex} oracle`);
    gateGroup.setAttribute('data-step', stepIndex);
    
    // Oracle box (special styling)
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x - this.config.gateWidth / 2);
    rect.setAttribute('y', minY - this.config.gateHeight / 2);
    rect.setAttribute('width', this.config.gateWidth);
    rect.setAttribute('height', maxY - minY + this.config.gateHeight);
    rect.setAttribute('fill', this.config.colors.oracle);
    rect.setAttribute('stroke', '#be185d');
    rect.setAttribute('stroke-width', this.config.strokeWidth);
    rect.setAttribute('rx', '4');
    
    // Oracle label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', centerY + 4);
    text.setAttribute('fill', 'white');
    text.setAttribute('font-family', 'JetBrains Mono, monospace');
    text.setAttribute('font-size', this.config.smallFontSize);
    text.setAttribute('font-weight', '600');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = 'Oracle';
    
    gateGroup.appendChild(rect);
    gateGroup.appendChild(text);
    this.mainGroup.appendChild(gateGroup);
  }

  drawMeasurement(step, x, stepIndex) {
    const qubits = step.qubits;
    
    qubits.forEach(qubit => {
      const y = 50 + qubit * this.config.qubitSpacing;
      
      const gateGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      gateGroup.setAttribute('class', `gate gate-${stepIndex} measurement`);
      gateGroup.setAttribute('data-step', stepIndex);
      
      // Measurement box
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x - this.config.gateWidth / 2);
      rect.setAttribute('y', y - this.config.gateHeight / 2);
      rect.setAttribute('width', this.config.gateWidth);
      rect.setAttribute('height', this.config.gateHeight);
      rect.setAttribute('fill', 'transparent');
      rect.setAttribute('stroke', this.config.colors.measurement);
      rect.setAttribute('stroke-width', this.config.strokeWidth);
      rect.setAttribute('rx', '4');
      
      // Measurement symbol (arc)
      const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const arcPath = `M ${x - 12} ${y + 8} Q ${x} ${y - 8} ${x + 12} ${y + 8}`;
      arc.setAttribute('d', arcPath);
      arc.setAttribute('fill', 'none');
      arc.setAttribute('stroke', this.config.colors.measurement);
      arc.setAttribute('stroke-width', '2');
      
      // Arrow
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      arrow.setAttribute('x1', x + 8);
      arrow.setAttribute('y1', y + 2);
      arrow.setAttribute('x2', x + 12);
      arrow.setAttribute('y2', y - 6);
      arrow.setAttribute('stroke', this.config.colors.measurement);
      arrow.setAttribute('stroke-width', '2');
      
      gateGroup.appendChild(rect);
      gateGroup.appendChild(arc);
      gateGroup.appendChild(arrow);
      this.mainGroup.appendChild(gateGroup);
    });
  }

  drawMeasurements(steps, numQubits) {
    // Add classical bit lines if there are measurements
    const hasMeasurements = steps.some(step => step.type === 'measure');
    
    if (hasMeasurements) {
      const circuitWidth = (steps.length + 2) * this.config.wireLength;
      
      for (let i = 0; i < numQubits; i++) {
        const y = 50 + i * this.config.qubitSpacing + 25;
        
        // Classical bit line (double line)
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '40');
        line1.setAttribute('y1', y);
        line1.setAttribute('x2', circuitWidth);
        line1.setAttribute('y2', y);
        line1.setAttribute('stroke', this.config.colors.measurement);
        line1.setAttribute('stroke-width', '1');
        
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '40');
        line2.setAttribute('y1', y + 3);
        line2.setAttribute('x2', circuitWidth);
        line2.setAttribute('y2', y + 3);
        line2.setAttribute('stroke', this.config.colors.measurement);
        line2.setAttribute('stroke-width', '1');
        
        // Classical bit label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '20');
        label.setAttribute('y', y + 8);
        label.setAttribute('fill', this.config.colors.measurement);
        label.setAttribute('font-family', 'JetBrains Mono, monospace');
        label.setAttribute('font-size', this.config.smallFontSize);
        label.setAttribute('text-anchor', 'middle');
        label.textContent = `c${i}`;
        
        this.mainGroup.appendChild(line1);
        this.mainGroup.appendChild(line2);
        this.mainGroup.appendChild(label);
      }
    }
  }

  highlightStep(stepIndex) {
    // Remove previous highlights
    this.resetHighlight();
    
    if (stepIndex < 0) return;
    
    this.currentStep = stepIndex;
    
    // Highlight current step
    const currentGate = this.mainGroup.querySelector(`.gate[data-step="${stepIndex}"]`);
    if (currentGate) {
      currentGate.classList.add('active');
      
      // Change colors
      const gateBox = currentGate.querySelector('.gate-box, rect');
      if (gateBox) {
        gateBox.setAttribute('fill', this.config.colors.active);
        gateBox.setAttribute('stroke', '#f59e0b');
      }
    }
    
    // Mark completed steps
    for (let i = 0; i < stepIndex; i++) {
      const completedGate = this.mainGroup.querySelector(`.gate[data-step="${i}"]`);
      if (completedGate) {
        completedGate.classList.add('completed');
        
        const gateBox = completedGate.querySelector('.gate-box, rect');
        if (gateBox) {
          gateBox.setAttribute('fill', this.config.colors.completed);
          gateBox.setAttribute('stroke', '#10b981');
        }
      }
    }
  }

  resetHighlight() {
    // Remove all highlight classes
    const gates = this.mainGroup.querySelectorAll('.gate');
    gates.forEach(gate => {
      gate.classList.remove('active', 'completed');
      
      // Reset colors
      const gateBox = gate.querySelector('.gate-box, rect');
      if (gateBox && !gate.classList.contains('oracle') && !gate.classList.contains('measurement')) {
        gateBox.setAttribute('fill', this.config.colors.gateBox);
        gateBox.setAttribute('stroke', '#475569');
      }
    });
    
    this.currentStep = -1;
  }

  // Zoom and pan controls
  zoomIn() {
    this.zoom = Math.min(3, this.zoom * 1.2);
    this.updateTransform();
  }

  zoomOut() {
    this.zoom = Math.max(0.1, this.zoom / 1.2);
    this.updateTransform();
  }

  resetZoom() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.updateTransform();
  }

  // Responsive design
  resize() {
    // Adjust SVG size based on container
    const container = this.svg.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      this.svg.style.width = `${rect.width}px`;
      this.svg.style.height = `${Math.min(rect.height, 400)}px`;
    }
  }

  // Animation helpers
  animateGateActivation(stepIndex, duration = 500) {
    const gate = this.mainGroup.querySelector(`.gate[data-step="${stepIndex}"]`);
    if (!gate) return;
    
    // Create pulsing effect
    const gateBox = gate.querySelector('.gate-box, rect');
    if (gateBox) {
      const originalFill = gateBox.getAttribute('fill');
      
      // Animate to highlight color
      gateBox.style.transition = `fill ${duration/2}ms ease`;
      gateBox.setAttribute('fill', this.config.colors.active);
      
      setTimeout(() => {
        gateBox.setAttribute('fill', originalFill);
      }, duration/2);
    }
    
    // Add ripple effect
    this.addRippleEffect(gate, duration);
  }

  addRippleEffect(element, duration) {
    const bbox = element.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    
    const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ripple.setAttribute('cx', centerX);
    ripple.setAttribute('cy', centerY);
    ripple.setAttribute('r', '0');
    ripple.setAttribute('fill', 'none');
    ripple.setAttribute('stroke', this.config.colors.active);
    ripple.setAttribute('stroke-width', '2');
    ripple.setAttribute('opacity', '0.8');
    
    this.mainGroup.appendChild(ripple);
    
    // Animate ripple
    ripple.style.transition = `r ${duration}ms ease-out, opacity ${duration}ms ease-out`;
    ripple.setAttribute('r', '30');
    ripple.setAttribute('opacity', '0');
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  }

  // Export functionality
  exportSVG() {
    const svgClone = this.svg.cloneNode(true);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgClone);
  }

  exportPNG(width = 800, height = 400) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      const svgString = this.exportSVG();
      const img = new Image();
      
      img.onload = () => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      
      const blob = new Blob([svgString], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      img.src = url;
    });
  }

  // Cleanup
  destroy() {
    // Remove event listeners
    this.svg.removeEventListener('mousedown', this.handleMouseDown);
    this.svg.removeEventListener('mousemove', this.handleMouseMove);
    this.svg.removeEventListener('mouseup', this.handleMouseUp);
    this.svg.removeEventListener('wheel', this.handleWheel);
    
    // Clear SVG content
    this.svg.innerHTML = '';
  }
}