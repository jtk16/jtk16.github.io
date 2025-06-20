// visualization/bloch-sphere.js
// 3D Bloch sphere visualization for single qubit states

export class BlochSphere {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = { x: 0, y: 0, z: 1 }; // Initial |0⟩ state
    this.rotation = { x: 0, y: 0 };
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };
    
    // Visual configuration
    this.config = {
      radius: 80,
      colors: {
        sphere: '#1e293b',
        sphereOutline: '#475569',
        axes: '#64748b',
        axisLabels: '#94a3b8',
        stateVector: '#6366f1',
        statePoint: '#ec4899',
        grid: '#334155',
        background: '#0f172a'
      },
      lineWidth: 2,
      pointRadius: 6,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace'
    };
    
    this.setupCanvas();
    this.bindEvents();
    this.render();
  }

  setupCanvas() {
    this.resize();
    this.canvas.style.cursor = 'grab';
  }

  bindEvents() {
    // Mouse events for rotation
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', () => this.handleMouseUp());
    
    // Wheel for zoom (future enhancement)
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    
    // Resize observer
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  handleMouseDown(e) {
    this.isDragging = true;
    this.canvas.style.cursor = 'grabbing';
    this.lastMouse = this.getMousePos(e);
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const mouse = this.getMousePos(e);
    const deltaX = mouse.x - this.lastMouse.x;
    const deltaY = mouse.y - this.lastMouse.y;
    
    this.rotation.y += deltaX * 0.01;
    this.rotation.x += deltaY * 0.01;
    
    // Clamp rotation
    this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));
    
    this.lastMouse = mouse;
    this.render();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseDown({clientX: touch.clientX, clientY: touch.clientY});
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseMove({clientX: touch.clientX, clientY: touch.clientY});
    }
  }

  handleWheel(e) {
    e.preventDefault();
    // Future: implement zoom functionality
  }

  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  resize() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height, 300);
    
    // Set actual canvas size
    this.canvas.width = size;
    this.canvas.height = size;
    
    // Set display size
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    
    this.centerX = size / 2;
    this.centerY = size / 2;
    
    // Adjust radius based on canvas size
    this.config.radius = Math.min(size * 0.3, 100);
    
    this.render();
  }

  updateState(blochVector) {
    if (!blochVector) return;
    
    // Animate state change
    this.animateToState(blochVector);
  }

  animateToState(targetState, duration = 500) {
    const startState = {...this.state};
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate between states
      this.state.x = startState.x + (targetState.x - startState.x) * eased;
      this.state.y = startState.y + (targetState.y - startState.y) * eased;
      this.state.z = startState.z + (targetState.z - startState.z) * eased;
      
      this.render();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  render() {
    this.clearCanvas();
    this.drawSphere();
    this.drawAxes();
    this.drawGrid();
    this.drawStateVector();
    this.drawLabels();
  }

  clearCanvas() {
    this.ctx.fillStyle = this.config.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawSphere() {
    const { radius } = this.config;
    
    // Draw sphere outline
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = this.config.colors.sphere;
    this.ctx.fill();
    this.ctx.strokeStyle = this.config.colors.sphereOutline;
    this.ctx.lineWidth = this.config.lineWidth;
    this.ctx.stroke();
  }

  drawGrid() {
    const { radius } = this.config;
    
    this.ctx.strokeStyle = this.config.colors.grid;
    this.ctx.lineWidth = 1;
    
    // Draw latitude lines
    for (let i = 1; i < 4; i++) {
      const lat = (i * Math.PI) / 4;
      this.drawLatitudeLine(lat, radius);
    }
    
    // Draw longitude lines
    for (let i = 0; i < 8; i++) {
      const lon = (i * Math.PI) / 4;
      this.drawLongitudeLine(lon, radius);
    }
  }

  drawLatitudeLine(latitude, radius) {
    const points = [];
    const numPoints = 32;
    
    for (let i = 0; i <= numPoints; i++) {
      const longitude = (i * 2 * Math.PI) / numPoints;
      const point = this.sphericalToCartesian(radius * Math.sin(latitude), longitude, latitude);
      points.push(this.project3D(point));
    }
    
    this.drawCurve(points);
  }

  drawLongitudeLine(longitude, radius) {
    const points = [];
    const numPoints = 32;
    
    for (let i = 0; i <= numPoints; i++) {
      const latitude = (i * Math.PI) / numPoints;
      const point = this.sphericalToCartesian(radius * Math.sin(latitude), longitude, latitude);
      points.push(this.project3D(point));
    }
    
    this.drawCurve(points);
  }

  drawCurve(points) {
    if (points.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.stroke();
  }

  sphericalToCartesian(r, longitude, latitude) {
    return {
      x: r * Math.cos(latitude) * Math.cos(longitude),
      y: r * Math.cos(latitude) * Math.sin(longitude),
      z: r * Math.sin(latitude)
    };
  }

  drawAxes() {
    const { radius } = this.config;
    
    this.ctx.strokeStyle = this.config.colors.axes;
    this.ctx.lineWidth = this.config.lineWidth;
    
    // X axis
    const xStart = this.project3D({x: -radius * 1.2, y: 0, z: 0});
    const xEnd = this.project3D({x: radius * 1.2, y: 0, z: 0});
    this.drawLine(xStart, xEnd);
    
    // Y axis
    const yStart = this.project3D({x: 0, y: -radius * 1.2, z: 0});
    const yEnd = this.project3D({x: 0, y: radius * 1.2, z: 0});
    this.drawLine(yStart, yEnd);
    
    // Z axis
    const zStart = this.project3D({x: 0, y: 0, z: -radius * 1.2});
    const zEnd = this.project3D({x: 0, y: 0, z: radius * 1.2});
    this.drawLine(zStart, zEnd);
  }

  drawLine(start, end) {
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }

  drawStateVector() {
    const { radius } = this.config;
    
    // Convert Bloch coordinates to 3D position
    const statePos = {
      x: this.state.x * radius,
      y: this.state.y * radius,
      z: this.state.z * radius
    };
    
    // Project to 2D
    const center = this.project3D({x: 0, y: 0, z: 0});
    const statePoint = this.project3D(statePos);
    
    // Draw vector from center to state
    this.ctx.strokeStyle = this.config.colors.stateVector;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(center.x, center.y);
    this.ctx.lineTo(statePoint.x, statePoint.y);
    this.ctx.stroke();
    
    // Draw state point
    this.ctx.fillStyle = this.config.colors.statePoint;
    this.ctx.beginPath();
    this.ctx.arc(statePoint.x, statePoint.y, this.config.pointRadius, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Add glow effect
    this.ctx.shadowColor = this.config.colors.statePoint;
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(statePoint.x, statePoint.y, this.config.pointRadius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
    
    // Draw projection lines (optional, for educational purposes)
    this.drawProjections(statePos, statePoint);
  }

  drawProjections(statePos, statePoint) {
    // Draw projection onto XY plane (for phase visualization)
    const xyProjection = this.project3D({x: statePos.x, y: statePos.y, z: 0});
    
    this.ctx.strokeStyle = this.config.colors.stateVector;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    
    // Vertical line from XY plane to state point
    this.ctx.beginPath();
    this.ctx.moveTo(xyProjection.x, xyProjection.y);
    this.ctx.lineTo(statePoint.x, statePoint.y);
    this.ctx.stroke();
    
    // Reset line dash
    this.ctx.setLineDash([]);
  }

  drawLabels() {
    const { radius } = this.config;
    
    this.ctx.fillStyle = this.config.colors.axisLabels;
    this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // X axis labels
    const xPos = this.project3D({x: radius * 1.3, y: 0, z: 0});
    const xNeg = this.project3D({x: -radius * 1.3, y: 0, z: 0});
    this.ctx.fillText('+X', xPos.x, xPos.y);
    this.ctx.fillText('-X', xNeg.x, xNeg.y);
    
    // Y axis labels
    const yPos = this.project3D({x: 0, y: radius * 1.3, z: 0});
    const yNeg = this.project3D({x: 0, y: -radius * 1.3, z: 0});
    this.ctx.fillText('+Y', yPos.x, yPos.y);
    this.ctx.fillText('-Y', yNeg.x, yNeg.y);
    
    // Z axis labels (|0⟩ and |1⟩)
    const zPos = this.project3D({x: 0, y: 0, z: radius * 1.3});
    const zNeg = this.project3D({x: 0, y: 0, z: -radius * 1.3});
    this.ctx.fillText('|0⟩', zPos.x, zPos.y - 15);
    this.ctx.fillText('|1⟩', zNeg.x, zNeg.y + 15);
    
    // State coordinates display
    this.drawCoordinateDisplay();
  }

  drawCoordinateDisplay() {
    const padding = 10;
    const lineHeight = 16;
    
    this.ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    this.ctx.fillRect(padding, padding, 120, 80);
    
    this.ctx.strokeStyle = this.config.colors.sphereOutline;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(padding, padding, 120, 80);
    
    this.ctx.fillStyle = this.config.colors.axisLabels;
    this.ctx.font = `${this.config.fontSize - 2}px ${this.config.fontFamily}`;
    this.ctx.textAlign = 'left';
    
    this.ctx.fillText(`x: ${this.state.x.toFixed(3)}`, padding + 5, padding + lineHeight);
    this.ctx.fillText(`y: ${this.state.y.toFixed(3)}`, padding + 5, padding + lineHeight * 2);
    this.ctx.fillText(`z: ${this.state.z.toFixed(3)}`, padding + 5, padding + lineHeight * 3);
    
    // Show corresponding quantum state
    const stateInfo = this.getQuantumStateInfo();
    this.ctx.fillText(stateInfo, padding + 5, padding + lineHeight * 4.5);
  }

  getQuantumStateInfo() {
    // Convert Bloch coordinates back to quantum state (simplified)
    const theta = Math.acos(this.state.z);
    const phi = Math.atan2(this.state.y, this.state.x);
    
    const alpha = Math.cos(theta / 2);
    const beta = Math.sin(theta / 2);
    
    if (Math.abs(alpha - 1) < 0.001) return '|0⟩';
    if (Math.abs(beta - 1) < 0.001) return '|1⟩';
    if (Math.abs(alpha - beta) < 0.001) return '|+⟩';
    if (Math.abs(alpha + beta) < 0.001) return '|-⟩';
    
    return `|ψ⟩`;
  }

  project3D(point) {
    // Apply rotation transformations
    const rotated = this.rotatePoint(point);
    
    // Simple orthographic projection
    return {
      x: this.centerX + rotated.x,
      y: this.centerY - rotated.z // Flip Y axis for screen coordinates
    };
  }

  rotatePoint(point) {
    // Rotate around X axis
    let x = point.x;
    let y = point.y * Math.cos(this.rotation.x) - point.z * Math.sin(this.rotation.x);
    let z = point.y * Math.sin(this.rotation.x) + point.z * Math.cos(this.rotation.x);
    
    // Rotate around Y axis
    const newX = x * Math.cos(this.rotation.y) + z * Math.sin(this.rotation.y);
    const newZ = -x * Math.sin(this.rotation.y) + z * Math.cos(this.rotation.y);
    
    return {x: newX, y: y, z: newZ};
  }

  // Animation helpers
  pulseStatePoint() {
    const originalRadius = this.config.pointRadius;
    const pulseRadius = originalRadius * 1.5;
    
    const startTime = performance.now();
    const duration = 1000;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      
      // Sine wave for smooth pulsing
      const scale = 1 + 0.5 * Math.sin(progress * 2 * Math.PI);
      this.config.pointRadius = originalRadius * scale;
      
      this.render();
      
      if (elapsed < duration * 3) { // Pulse 3 times
        requestAnimationFrame(animate);
      } else {
        this.config.pointRadius = originalRadius;
        this.render();
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Educational overlays
  showBasisStates() {
    const { radius } = this.config;
    
    // Mark important states
    const basisStates = [
      {pos: {x: 0, y: 0, z: radius}, label: '|0⟩', color: '#10b981'},
      {pos: {x: 0, y: 0, z: -radius}, label: '|1⟩', color: '#ef4444'},
      {pos: {x: radius, y: 0, z: 0}, label: '|+⟩', color: '#8b5cf6'},
      {pos: {x: -radius, y: 0, z: 0}, label: '|-⟩', color: '#f59e0b'},
      {pos: {x: 0, y: radius, z: 0}, label: '|+i⟩', color: '#06b6d4'},
      {pos: {x: 0, y: -radius, z: 0}, label: '|-i⟩', color: '#ec4899'}
    ];
    
    basisStates.forEach(state => {
      const projected = this.project3D(state.pos);
      
      // Draw small circle
      this.ctx.fillStyle = state.color;
      this.ctx.beginPath();
      this.ctx.arc(projected.x, projected.y, 4, 0, 2 * Math.PI);
      this.ctx.fill();
      
      // Draw label
      this.ctx.fillStyle = state.color;
      this.ctx.font = `${this.config.fontSize - 2}px ${this.config.fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(state.label, projected.x, projected.y - 10);
    });
  }

  // Measurement visualization
  showMeasurementBases() {
    const { radius } = this.config;
    
    // Z-basis (computational basis)
    this.drawMeasurementAxis({x: 0, y: 0, z: -radius}, {x: 0, y: 0, z: radius}, '#10b981');
    
    // X-basis
    this.drawMeasurementAxis({x: -radius, y: 0, z: 0}, {x: radius, y: 0, z: 0}, '#8b5cf6');
    
    // Y-basis
    this.drawMeasurementAxis({x: 0, y: -radius, z: 0}, {x: 0, y: radius, z: 0}, '#06b6d4');
  }

  drawMeasurementAxis(start, end, color) {
    const startProj = this.project3D(start);
    const endProj = this.project3D(end);
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([10, 5]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(startProj.x, startProj.y);
    this.ctx.lineTo(endProj.x, endProj.y);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }

  // Interactive features
  getStateFromClick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left - this.centerX;
    const y = -(clientY - rect.top - this.centerY); // Flip Y
    
    // Convert to 3D coordinates (simplified)
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = this.config.radius;
    
    if (distance > maxDistance) {
      // Normalize to sphere surface
      const scale = maxDistance / distance;
      return {
        x: (x * scale) / maxDistance,
        y: 0, // Simplified: assume y = 0 for click interaction
        z: (y * scale) / maxDistance
      };
    }
    
    // Point is inside sphere
    const z = Math.sqrt(maxDistance * maxDistance - distance * distance);
    return {
      x: x / maxDistance,
      y: 0,
      z: y / maxDistance
    };
  }

  // Preset states for educational purposes
  setPresetState(stateName) {
    const presets = {
      '|0⟩': {x: 0, y: 0, z: 1},
      '|1⟩': {x: 0, y: 0, z: -1},
      '|+⟩': {x: 1, y: 0, z: 0},
      '|-⟩': {x: -1, y: 0, z: 0},
      '|+i⟩': {x: 0, y: 1, z: 0},
      '|-i⟩': {x: 0, y: -1, z: 0}
    };
    
    if (presets[stateName]) {
      this.animateToState(presets[stateName]);
    }
  }

  // Utility methods
  getBlochAngles() {
    const theta = Math.acos(this.state.z);
    const phi = Math.atan2(this.state.y, this.state.x);
    
    return {
      theta: theta,
      phi: phi,
      thetaDegrees: theta * 180 / Math.PI,
      phiDegrees: phi * 180 / Math.PI
    };
  }

  getQuantumAmplitudes() {
    const angles = this.getBlochAngles();
    const alpha = Math.cos(angles.theta / 2);
    
    return {
      alpha: {real: alpha, imag: 0},
      beta: {
        real: Math.sin(angles.theta / 2) * Math.cos(angles.phi),
        imag: Math.sin(angles.theta / 2) * Math.sin(angles.phi)
      }
    };
  }

  // Export functionality
  exportFrame() {
    return this.canvas.toDataURL('image/png');
  }

  // Performance optimization
  enableLowQuality() {
    this.config.gridLines = 4; // Reduce grid density
    this.config.curvePoints = 16; // Reduce curve resolution
  }

  enableHighQuality() {
    this.config.gridLines = 8;
    this.config.curvePoints = 32;
  }

  // Cleanup
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleMouseUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
  }
}