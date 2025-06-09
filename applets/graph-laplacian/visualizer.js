// assets/js/graph-visualizer.js
class GraphVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupCanvas();
    this.animationFrame = null;
    
    // Visual settings - using CSS variables for consistency
    this.nodeRadius = 12;
    this.nodeColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    this.nodeStroke = '#ffffff';
    this.edgeColor = getComputedStyle(document.documentElement).getPropertyValue('--border-light').trim();
    this.edgeWidth = 2;
    this.selectedColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
    
    // Interaction state
    this.isDragging = false;
    this.dragNode = null;
    this.mousePos = { x: 0, y: 0 };
    this.hoveredNode = -1;
    
    // Animation state
    this.animationState = {
      nodePositions: [],
      targetPositions: [],
      animating: false,
      startTime: 0,
      duration: 500
    };
    
    this.setupInteraction();
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // Set canvas background to match CSS
    this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
    this.ctx.fillRect(0, 0, rect.width, rect.height);
  }

  setupInteraction() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', () => this.handleMouseUp());
    
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleMouseDown(e) {
    const pos = this.getMousePosition(e);
    this.mousePos = pos;

    if (this.graph) {
      const clickedNode = this.getNodeAtPosition(pos);
      if (clickedNode !== -1) {
        this.isDragging = true;
        this.dragNode = clickedNode;
        this.canvas.style.cursor = 'grabbing';
      }
    }
  }

  handleMouseMove(e) {
    const pos = this.getMousePosition(e);
    this.mousePos = pos;

    if (this.isDragging && this.dragNode !== null && this.graph) {
      // Update node position
      this.graph.positions[this.dragNode] = { ...pos };
      this.render();
    } else if (this.graph) {
      // Update hover state
      const hoveredNode = this.getNodeAtPosition(pos);
      if (hoveredNode !== this.hoveredNode) {
        this.hoveredNode = hoveredNode;
        this.canvas.style.cursor = hoveredNode !== -1 ? 'grab' : 'default';
        this.render();
      }
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.dragNode = null;
    this.canvas.style.cursor = this.hoveredNode !== -1 ? 'grab' : 'default';
  }

  handleMouseLeave() {
    this.handleMouseUp();
    this.hoveredNode = -1;
    this.canvas.style.cursor = 'default';
    if (this.graph) this.render();
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseDown(touch);
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseMove(touch);
  }

  getMousePosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  getNodeAtPosition(pos) {
    if (!this.graph) return -1;
    
    for (let i = 0; i < this.graph.positions.length; i++) {
      const node = this.graph.positions[i];
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= this.nodeRadius + 5) {
        return i;
      }
    }
    
    return -1;
  }

  setGraph(graph, animate = true) {
    if (animate && this.graph) {
      this.animateToNewGraph(graph);
    } else {
      this.graph = graph;
      this.render();
    }
  }

  animateToNewGraph(newGraph) {
    if (!this.graph || this.graph.positions.length !== newGraph.positions.length) {
      this.graph = newGraph;
      this.render();
      return;
    }

    // Setup animation
    this.animationState.nodePositions = this.graph.positions.map(pos => ({ ...pos }));
    this.animationState.targetPositions = newGraph.positions.map(pos => ({ ...pos }));
    this.animationState.animating = true;
    this.animationState.startTime = Date.now();
    
    // Update graph but keep old positions for animation
    this.graph = { ...newGraph };
    
    this.animate();
  }

  animate() {
    if (!this.animationState.animating) return;

    const elapsed = Date.now() - this.animationState.startTime;
    const progress = Math.min(elapsed / this.animationState.duration, 1);
    
    // Easing function (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolate positions
    for (let i = 0; i < this.graph.positions.length; i++) {
      const start = this.animationState.nodePositions[i];
      const target = this.animationState.targetPositions[i];
      
      this.graph.positions[i] = {
        x: start.x + (target.x - start.x) * easedProgress,
        y: start.y + (target.y - start.y) * easedProgress
      };
    }

    this.render();

    if (progress < 1) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    } else {
      this.animationState.animating = false;
      this.graph.positions = this.animationState.targetPositions.map(pos => ({ ...pos }));
      this.render();
    }
  }

  render() {
    if (!this.graph) {
      this.renderEmptyState();
      return;
    }

    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    
    // Clear canvas with background color
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw subtle grid pattern
    this.drawGrid(ctx, rect);
    
    // Draw edges first (behind nodes)
    this.drawEdges(ctx);
    
    // Draw nodes
    this.drawNodes(ctx);
    
    // Draw labels
    this.drawLabels(ctx);
    
    // Draw information overlay if needed
    this.drawInfoOverlay(ctx, rect);
  }

  drawGrid(ctx, rect) {
    const gridSize = 40;
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    
    ctx.beginPath();
    for (let x = 0; x <= rect.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
    }
    for (let y = 0; y <= rect.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
    }
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }

  drawEdges(ctx) {
    const { positions, adjacency } = this.graph;
    
    ctx.strokeStyle = this.edgeColor;
    ctx.lineWidth = this.edgeWidth;
    ctx.lineCap = 'round';
    
    // Add subtle shadow to edges
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (adjacency[i][j]) {
          // Calculate edge opacity based on connection strength
          const opacity = 0.6 + 0.4 * adjacency[i][j];
          ctx.globalAlpha = opacity;
          
          ctx.beginPath();
          ctx.moveTo(positions[i].x, positions[i].y);
          ctx.lineTo(positions[j].x, positions[j].y);
          ctx.stroke();
        }
      }
    }
    
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1;
  }

  drawNodes(ctx) {
    const { positions } = this.graph;
    
    positions.forEach((pos, i) => {
      const isHovered = this.hoveredNode === i;
      const isDragged = this.dragNode === i;
      const scale = (isHovered || isDragged) ? 1.2 : 1;
      const radius = this.nodeRadius * scale;
      
      // Node shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Node body with gradient
      const gradient = ctx.createRadialGradient(
        pos.x - radius * 0.3, pos.y - radius * 0.3, 0,
        pos.x, pos.y, radius
      );
      
      if (isHovered || isDragged) {
        gradient.addColorStop(0, this.selectedColor);
        gradient.addColorStop(1, this.selectedColor + 'CC');
      } else {
        gradient.addColorStop(0, this.nodeColor);
        gradient.addColorStop(1, this.nodeColor + 'CC');
      }
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Node border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = this.nodeStroke;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner highlight
      ctx.beginPath();
      ctx.arc(pos.x - radius * 0.3, pos.y - radius * 0.3, radius * 0.3, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    });
    
    ctx.shadowColor = 'transparent';
  }

  drawLabels(ctx) {
    const { positions } = this.graph;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    
    positions.forEach((pos, i) => {
      ctx.fillText(i.toString(), pos.x, pos.y);
    });
    
    ctx.shadowColor = 'transparent';
  }

  drawInfoOverlay(ctx, rect) {
    if (!this.graph || !this.graph.properties) return;
    
    const padding = 15;
    const lineHeight = 20;
    const { properties } = this.graph;
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    ctx.lineWidth = 1;
    
    const boxWidth = 200;
    const boxHeight = 80;
    const x = rect.width - boxWidth - padding;
    const y = padding;
    
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();
    
    // Text
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const textX = x + 10;
    let textY = y + 10;
    
    ctx.fillText(`Spectral Gap: ${properties.spectralGap.toFixed(3)}`, textX, textY);
    textY += lineHeight;
    ctx.fillText(`Alg. Connectivity: ${properties.algebraicConnectivity.toFixed(3)}`, textX, textY);
    textY += lineHeight;
    ctx.fillText(`Max Eigenvalue: ${properties.maxEigenvalue.toFixed(3)}`, textX, textY);
  }

  renderEmptyState() {
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    
    // Clear canvas
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim();
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw loading message
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim();
    ctx.font = '16px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('Initializing graph visualization...', rect.width / 2, rect.height / 2);
  }

  updateProperties(properties) {
    // Update the external property display
    const spectralGapEl = document.getElementById('spectral-gap');
    const algConnectivityEl = document.getElementById('algebraic-connectivity');
    
    if (spectralGapEl) {
      spectralGapEl.textContent = properties.spectralGap.toFixed(3);
    }
    if (algConnectivityEl) {
      algConnectivityEl.textContent = properties.algebraicConnectivity.toFixed(3);
    }
  }

  // Utility method for canvas rounded rectangles (polyfill for older browsers)
  setupCanvasRoundRect() {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }
  }

  // Public API
  resize() {
    this.setupCanvas();
    this.render();
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Remove event listeners
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GraphVisualizer;
} else if (typeof window !== 'undefined') {
  window.GraphVisualizer = GraphVisualizer;
}