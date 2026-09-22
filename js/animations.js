/**
 * animations.js - SVG-based FL Animation Engine
 * REVA University Federated Learning FDP Portal
 *
 * Provides seven self-contained SVG animation scenes for educational use.
 * All animations use requestAnimationFrame for smooth 60 fps rendering.
 * Each animation is injected into a target <svg> or <div> element identified
 * by a data attribute: data-animation="<name>"
 *
 * Exposed as: window.FLAnimations
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ANIMATION REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

const _raf   = window.requestAnimationFrame.bind(window);
const _craf  = window.cancelAnimationFrame.bind(window);

/** Shared colour tokens */
const C = {
  blue:   '#3b82f6',
  green:  '#10b981',
  red:    '#ef4444',
  yellow: '#f59e0b',
  cyan:   '#06b6d4',
  purple: '#8b5cf6',
  slate:  '#94a3b8',
  bg:     '#0f172a',
  card:   'rgba(30,41,59,0.9)',
};

// ─────────────────────────────────────────────────────────────────────────────
// BASE ANIMATION CLASS
// ─────────────────────────────────────────────────────────────────────────────

class BaseAnimation {
  /**
   * @param {string} selector - CSS selector for the container element
   * @param {number} [width=600]
   * @param {number} [height=340]
   */
  constructor(selector, width = 600, height = 340) {
    this.selector  = selector;
    this.W         = width;
    this.H         = height;
    this._rafId    = null;
    this._running  = false;
    this._t        = 0;      // frame counter
    this.svg       = null;

    this._mount();
  }

  /** Inject an SVG into the container and store the reference */
  _mount() {
    const container = document.querySelector(this.selector);
    if (!container) return;

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
    svgEl.setAttribute('xmlns',   'http://www.w3.org/2000/svg');
    svgEl.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(svgEl);
    this.svg = svgEl;

    this.build();   // subclass draws static structure
    this.play();    // auto-start
  }

  /** Called once after mount – subclass draws static SVG elements */
  build() {}

  /** Called every frame – subclass updates dynamic elements */
  tick() {}

  play() {
    if (this._running) return;
    this._running = true;
    const loop = () => {
      if (!this._running) return;
      this._t++;
      this.tick();
      this._rafId = _raf(loop);
    };
    this._rafId = _raf(loop);
  }

  pause() {
    this._running = false;
    if (this._rafId) _craf(this._rafId);
  }

  reset() {
    this._t = 0;
  }

  // ─── SVG helper utilities ───────────────────────────────────────────────────

  /** Create an SVG element with attributes */
  _el(tag, attrs = {}, parent = null) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (parent) parent.appendChild(el);
    return el;
  }

  /** Create a <circle> */
  _circle(cx, cy, r, fill, parent, extra = {}) {
    return this._el('circle', { cx, cy, r, fill, ...extra }, parent);
  }

  /** Create a <rect> */
  _rect(x, y, w, h, fill, parent, extra = {}) {
    return this._el('rect', { x, y, width: w, height: h, fill, rx: 6, ...extra }, parent);
  }

  /** Create a <text> */
  _text(x, y, content, fill, parent, extra = {}) {
    const el = this._el('text', {
      x, y,
      fill,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': 'Inter, sans-serif',
      'font-size': '12',
      ...extra,
    }, parent);
    el.textContent = content;
    return el;
  }

  /** Create a <line> */
  _line(x1, y1, x2, y2, stroke, parent, extra = {}) {
    return this._el('line', { x1, y1, x2, y2, stroke, 'stroke-width': 1.5, ...extra }, parent);
  }

  /** Create a <path> */
  _path(d, stroke, fill, parent, extra = {}) {
    return this._el('path', { d, stroke, fill, 'stroke-width': 1.5, ...extra }, parent);
  }

  /**
   * Linearly interpolate a dot along a straight line.
   * @param {number} t       - 0..1 progress
   * @param {number} x1,y1  - start
   * @param {number} x2,y2  - end
   * @returns {{ x, y }}
   */
  _lerp(t, x1, y1, x2, y2) {
    return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CENTRALISED FL ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shows data flowing FROM 5 client devices TO a central server.
 * Animated dots travel along edges; server pulses on receipt.
 */
class CentralizedFLAnimation extends BaseAnimation {
  constructor() { super('[data-animation="centralized"]', 600, 320); }

  build() {
    if (!this.svg) return;
    const svg = this.svg;

    // Background
    this._rect(0, 0, 600, 320, 'rgba(15,23,42,0.7)', svg, { rx: 0 });
    this._text(300, 18, 'Centralised Learning — Data Flows to Central Server',
      C.slate, svg, { 'font-size': '11', 'font-weight': '600' });

    // Server node (right)
    this._serverX = 480;
    this._serverY = 160;
    this._serverNode = this._circle(this._serverX, this._serverY, 32, C.blue, svg);
    this._el('circle', { cx: this._serverX, cy: this._serverY, r: 32,
      fill: 'none', stroke: C.blue, 'stroke-width': 2 }, svg);
    this._text(this._serverX, this._serverY - 6, '🖥', C.blue, svg, { 'font-size': '18' });
    this._text(this._serverX, this._serverY + 18, 'Server', '#e2e8f0', svg, { 'font-size': '10' });

    // 5 client nodes (left column)
    this._clientPositions = [];
    const clientColors = [C.green, C.yellow, C.cyan, C.purple, C.red];
    for (let i = 0; i < 5; i++) {
      const cx = 100;
      const cy = 60 + i * 52;
      this._clientPositions.push({ cx, cy, color: clientColors[i] });
      this._circle(cx, cy, 20, clientColors[i] + '33', svg);
      this._circle(cx, cy, 20, 'none', svg, { stroke: clientColors[i], 'stroke-width': 1.5 });
      this._text(cx, cy - 4, '📱', '#fff', svg, { 'font-size': '14' });
      this._text(cx, cy + 14, `C${i + 1}`, '#94a3b8', svg, { 'font-size': '9' });

      // Edge line
      this._line(cx + 20, cy, this._serverX - 32, this._serverY,
        clientColors[i] + '33', svg, { 'stroke-width': 1 });
    }

    // Animated dots array
    this._dots = this._clientPositions.map((pos, i) => {
      const dot = this._circle(pos.cx, pos.cy, 5, pos.color, svg);
      return {
        el: dot,
        color: pos.color,
        startX: pos.cx + 20, startY: pos.cy,
        endX:   this._serverX - 32, endY: this._serverY,
        phase:  i * 20,   // stagger
        speed:  0.008 + Math.random() * 0.004,
      };
    });

    // Server pulse ring
    this._pulseRing = this._el('circle', {
      cx: this._serverX, cy: this._serverY, r: 32,
      fill: 'none', stroke: C.cyan, 'stroke-width': 0, opacity: 0,
    }, svg);

    // Label
    this._text(300, 308, '↑ All raw data collected centrally — privacy risk', C.red,
      svg, { 'font-size': '10', 'font-style': 'italic' });
  }

  tick() {
    const t = this._t;
    this._dots.forEach(dot => {
      const prog = ((t * dot.speed + dot.phase * 0.05) % 1);
      const pos  = this._lerp(prog, dot.startX, dot.startY, dot.endX, dot.endY);
      dot.el.setAttribute('cx', pos.x);
      dot.el.setAttribute('cy', pos.y);

      // Pulse server when dot arrives
      if (prog > 0.9) {
        const intensity = (prog - 0.9) * 10;
        this._pulseRing.setAttribute('stroke-width', (intensity * 4).toFixed(1));
        this._pulseRing.setAttribute('r', (32 + intensity * 15).toFixed(1));
        this._pulseRing.setAttribute('opacity', (1 - intensity).toFixed(2));
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FEDERATED FL ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Animates a full FL round:
 *   Phase 0: Global model broadcasts DOWN (green dots, server → clients)
 *   Phase 1: Clients train locally (pulsing nodes)
 *   Phase 2: Local updates flow UP (blue dots, clients → server)
 *   Phase 3: Server aggregates (yellow glow)
 *   Loop with round counter
 */
class FederatedFLAnimation extends BaseAnimation {
  constructor() { super('[data-animation="federated"]', 600, 340); }

  build() {
    if (!this.svg) return;
    const svg = this.svg;
    this._phase     = 0;
    this._phaseT    = 0;
    this._roundNum  = 1;

    // BG
    this._rect(0, 0, 600, 340, 'rgba(15,23,42,0.6)', svg, { rx: 0 });
    this._titleEl = this._text(300, 16, 'Federated Learning — Round 1', '#e2e8f0', svg,
      { 'font-size': '12', 'font-weight': '700' });
    this._phaseLabel = this._text(300, 328, 'Phase: Broadcasting global model…', C.slate, svg,
      { 'font-size': '10' });

    // Server (top center)
    const sx = 300, sy = 70;
    this._serverPos = { x: sx, y: sy };
    this._serverGlow = this._el('circle', {
      cx: sx, cy: sy, r: 36, fill: C.blue + '22', stroke: 'none',
    }, svg);
    this._serverCircle = this._circle(sx, sy, 28, C.blue + 'cc', svg);
    this._text(sx, sy - 5, '🖥', '#fff', svg, { 'font-size': '20' });
    this._text(sx, sy + 16, 'Global Server', '#e2e8f0', svg, { 'font-size': '9' });

    // 4 client nodes (arc below server)
    const clientCount = 4;
    const clientColor = [C.green, C.yellow, C.cyan, C.purple];
    this._clients = [];
    for (let i = 0; i < clientCount; i++) {
      const angle = (i / (clientCount - 1)) * Math.PI * 0.9 + Math.PI * 0.05;
      const cx    = 300 + Math.cos(Math.PI - angle) * 210;
      const cy    = 70  + Math.sin(angle) * 190;
      this._line(sx, sy + 28, cx, cy - 22, clientColor[i] + '33', svg, { 'stroke-width': 1 });
      const pulse = this._circle(cx, cy, 26, clientColor[i] + '22', svg);
      this._circle(cx, cy, 22, clientColor[i] + 'bb', svg);
      this._text(cx, cy - 4, '💻', '#fff', svg, { 'font-size': '16' });
      this._text(cx, cy + 15, `Client ${i + 1}`, '#e2e8f0', svg, { 'font-size': '8' });
      this._clients.push({ x: cx, y: cy, color: clientColor[i], pulse });
    }

    // Animated dots (one per client)
    this._dots = this._clients.map(c => {
      const dot = this._circle(sx, sy, 6, C.green, svg);
      dot.setAttribute('opacity', '0');
      return { el: dot, color: c.color, client: c };
    });
  }

  tick() {
    const PHASE_DURATION = 90; // frames per phase
    this._phaseT++;

    const progress = this._phaseT / PHASE_DURATION;

    switch (this._phase) {
      case 0: this._phaseDown(progress);   break;  // broadcast down
      case 1: this._phaseLocalTrain(progress); break; // local training
      case 2: this._phaseUp(progress);     break;  // updates up
      case 3: this._phaseAggregate(progress); break; // aggregation
    }

    if (this._phaseT >= PHASE_DURATION) {
      this._phaseT = 0;
      this._phase  = (this._phase + 1) % 4;
      if (this._phase === 0) {
        this._roundNum++;
        this._titleEl.textContent = `Federated Learning — Round ${this._roundNum}`;
      }
      // Reset dots
      this._dots.forEach(d => d.el.setAttribute('opacity', '0'));
    }
  }

  _phaseDown(progress) {
    this._phaseLabel.textContent = '📡 Phase 1: Server broadcasts global model to clients';
    const sv = this._serverPos;
    this._dots.forEach((dot, i) => {
      const stagger = i * 0.15;
      const p       = Math.max(0, Math.min(1, (progress - stagger) / (1 - stagger)));
      const pos     = this._lerp(p, sv.x, sv.y + 28,
                                    dot.client.x, dot.client.y - 22);
      dot.el.setAttribute('cx', pos.x);
      dot.el.setAttribute('cy', pos.y);
      dot.el.setAttribute('r',  5);
      dot.el.setAttribute('fill', C.green);
      dot.el.setAttribute('opacity', p > 0 ? 1 : 0);
    });
    // Server glow
    this._serverGlow.setAttribute('r', 36 + Math.sin(this._phaseT * 0.2) * 4);
  }

  _phaseLocalTrain(progress) {
    this._phaseLabel.textContent = '⚙️ Phase 2: Clients training locally on private data';
    this._dots.forEach(d => d.el.setAttribute('opacity', '0'));
    // Pulse client nodes
    this._clients.forEach((c, i) => {
      const pulse = 0.5 + 0.5 * Math.sin(this._phaseT * 0.15 + i * 1.2);
      c.pulse.setAttribute('r', 26 + pulse * 10);
      c.pulse.setAttribute('opacity', 0.3 + pulse * 0.4);
    });
  }

  _phaseUp(progress) {
    this._phaseLabel.textContent = '⬆️ Phase 3: Clients send model updates (not raw data) to server';
    const sv = this._serverPos;
    this._dots.forEach((dot, i) => {
      const stagger = i * 0.12;
      const p       = Math.max(0, Math.min(1, (progress - stagger) / (1 - stagger)));
      const pos     = this._lerp(p, dot.client.x, dot.client.y - 22,
                                    sv.x, sv.y + 28);
      dot.el.setAttribute('cx', pos.x);
      dot.el.setAttribute('cy', pos.y);
      dot.el.setAttribute('r',  5);
      dot.el.setAttribute('fill', C.blue);
      dot.el.setAttribute('opacity', p > 0 ? 1 : 0);
    });
    // Reset client pulses
    this._clients.forEach(c => { c.pulse.setAttribute('r', 26); c.pulse.setAttribute('opacity', 0.2); });
  }

  _phaseAggregate(progress) {
    this._phaseLabel.textContent = '✅ Phase 4: Server aggregates updates (FedAvg) → new global model';
    this._dots.forEach(d => d.el.setAttribute('opacity', '0'));
    // Server yellow glow
    const intensity = Math.sin(progress * Math.PI);
    this._serverCircle.setAttribute('fill', this._blendColor(C.blue, C.yellow, intensity));
    this._serverGlow.setAttribute('r', 36 + intensity * 20);
    this._serverGlow.setAttribute('fill', C.yellow + '33');
  }

  /** Blend two hex colours by t (0=c1, 1=c2) – very simple RGB lerp */
  _blendColor(c1, c2, t) {
    const p = v => parseInt(v, 16);
    const hex = c => c.replace('#', '');
    const r1 = p(hex(c1).slice(0,2)), g1 = p(hex(c1).slice(2,4)), b1 = p(hex(c1).slice(4,6));
    const r2 = p(hex(c2).slice(0,2)), g2 = p(hex(c2).slice(2,4)), b2 = p(hex(c2).slice(4,6));
    const rr = Math.round(r1 + (r2-r1)*t);
    const gg = Math.round(g1 + (g2-g1)*t);
    const bb = Math.round(b1 + (b2-b1)*t);
    return `rgb(${rr},${gg},${bb})`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FEDAVG STEP-BY-STEP ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Five-step walkthrough of the FedAvg algorithm.
 * Steps advance automatically; mathematical formula displayed below.
 */
class FedAvgAnimation extends BaseAnimation {
  constructor() {
    super('[data-animation="fedavg"]', 640, 370);
    this._step     = 0;
    this._stepT    = 0;
    this._STEPS    = 5;
    this._DURATION = 120; // frames per step
  }

  build() {
    if (!this.svg) return;
    const svg = this.svg;

    this._rect(0, 0, 640, 370, 'rgba(15,23,42,0.6)', svg, { rx: 0 });

    // Title
    this._titleEl = this._text(320, 18, 'FedAvg Algorithm — Step 1 of 5', '#e2e8f0', svg,
      { 'font-size': '12', 'font-weight': '700' });

    // Formula box at bottom
    this._rect(10, 320, 620, 44, 'rgba(59,130,246,0.1)', svg, { stroke: C.blue + '44', 'stroke-width': 1 });
    this._formulaEl = this._text(320, 342, 'w_global  =  Σ (nk / n) · wk', C.cyan, svg,
      { 'font-size': '13', 'font-family': 'Fira Code, monospace' });

    // Step description
    this._descEl = this._text(320, 296, '', C.slate, svg, { 'font-size': '10.5' });

    // Server node
    this._sNode = this._circle(320, 75, 30, C.blue + 'cc', svg);
    this._text(320, 71, '🖥', '#fff', svg, { 'font-size': '20' });
    this._text(320, 88, 'Global Server', '#e2e8f0', svg, { 'font-size': '8' });

    // 3 clients
    const cx_ = [130, 320, 510];
    const cy_  = 220;
    const clrs = [C.green, C.yellow, C.purple];
    const wts  = ['w₁=[0.32,…]', 'w₂=[0.28,…]', 'w₃=[0.35,…]'];
    this._cNodes = cx_.map((cx, i) => {
      const node = this._circle(cx, cy_, 26, clrs[i] + 'bb', svg);
      this._text(cx, cy_ - 5, '💻', '#fff', svg, { 'font-size': '16' });
      const wLabel = this._text(cx, cy_ + 18, wts[i], clrs[i], svg,
        { 'font-size': '9', 'font-family': 'Fira Code, monospace' });
      this._line(cx, 75 + 30, cx, cy_ - 26, clrs[i] + '44', svg);
      return { node, cx, cy: cy_, color: clrs[i], wLabel };
    });

    // Dot for each client edge
    this._dots = this._cNodes.map(c => {
      const d = this._circle(320, 105, 6, c.color, svg);
      d.setAttribute('opacity', '0');
      return d;
    });

    // Weights display boxes
    this._weightBoxes = this._cNodes.map((c, i) => {
      const box = this._rect(c.cx - 38, 248, 76, 24, 'rgba(255,255,255,0.04)', svg,
        { stroke: c.color + '55', 'stroke-width': 1 });
      return box;
    });

    // Aggregate result box (hidden initially)
    this._aggBox  = this._rect(250, 110, 140, 26, 'rgba(245,158,11,0.1)', svg,
      { stroke: C.yellow + '66', 'stroke-width': 1, opacity: 0 });
    this._aggText = this._text(320, 123, 'w_new=[0.317,…]', C.yellow, svg,
      { 'font-size': '9', 'font-family': 'Fira Code, monospace', opacity: 0 });
  }

  tick() {
    this._stepT++;
    const p = this._stepT / this._DURATION;

    this._titleEl.textContent = `FedAvg Algorithm — Step ${this._step + 1} of ${this._STEPS}`;

    switch (this._step) {
      case 0: this._s0_global(p);  break;
      case 1: this._s1_dist(p);    break;
      case 2: this._s2_local(p);   break;
      case 3: this._s3_collect(p); break;
      case 4: this._s4_agg(p);     break;
    }

    if (this._stepT >= this._DURATION) {
      this._stepT = 0;
      this._step  = (this._step + 1) % this._STEPS;
      this._dots.forEach(d => d.setAttribute('opacity', '0'));
      this._aggBox.setAttribute('opacity', '0');
      this._aggText.setAttribute('opacity', '0');
    }
  }

  _s0_global(p) {
    this._descEl.textContent = 'Step 1: Server holds current global model weights w_global';
    this._sNode.setAttribute('fill', C.blue + 'cc');
    const glow = 0.5 + 0.5 * Math.sin(this._stepT * 0.12);
    this._sNode.setAttribute('r', 30 + glow * 4);
    this._formulaEl.textContent = 'w_global  =  Σ (nk / n) · wk';
  }

  _s1_dist(p) {
    this._descEl.textContent = 'Step 2: Global model broadcast to all selected clients';
    this._cNodes.forEach((c, i) => {
      const stagger = i * 0.2;
      const pp      = Math.max(0, Math.min(1, (p - stagger) / (1 - stagger * 1.5)));
      const pos     = this._lerp(pp, 320, 105, c.cx, c.cy - 26);
      this._dots[i].setAttribute('cx', pos.x);
      this._dots[i].setAttribute('cy', pos.y);
      this._dots[i].setAttribute('fill', C.green);
      this._dots[i].setAttribute('opacity', pp > 0 ? 1 : 0);
    });
  }

  _s2_local(p) {
    this._descEl.textContent = 'Step 3: Clients train locally for E epochs on private data';
    this._dots.forEach(d => d.setAttribute('opacity', '0'));
    this._cNodes.forEach((c, i) => {
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(this._stepT * 0.18 + i));
      c.node.setAttribute('r', 26 + pulse * 8);
    });
  }

  _s3_collect(p) {
    this._descEl.textContent = 'Step 4: Clients send updated weights back to server';
    this._cNodes.forEach((c, i) => {
      c.node.setAttribute('r', 26);
      const stagger = i * 0.15;
      const pp      = Math.max(0, Math.min(1, (p - stagger) / (1 - stagger * 1.2)));
      const pos     = this._lerp(pp, c.cx, c.cy - 26, 320, 105);
      this._dots[i].setAttribute('cx', pos.x);
      this._dots[i].setAttribute('cy', pos.y);
      this._dots[i].setAttribute('fill', C.blue);
      this._dots[i].setAttribute('opacity', pp > 0 ? 1 : 0);
    });
  }

  _s4_agg(p) {
    this._descEl.textContent = 'Step 5: Server computes weighted average → new global model';
    this._dots.forEach(d => d.setAttribute('opacity', '0'));
    this._aggBox.setAttribute('opacity', Math.min(1, p * 3));
    this._aggText.setAttribute('opacity', Math.min(1, p * 3));
    this._sNode.setAttribute('fill', this._blendColor(C.blue, C.yellow, Math.sin(p * Math.PI)));
    this._formulaEl.textContent = `w_new = (n₁w₁ + n₂w₂ + n₃w₃) / (n₁+n₂+n₃)`;
  }

  _blendColor(c1, c2, t) {
    const p = v => parseInt(v, 16);
    const hex = c => c.replace('#', '');
    const r1=p(hex(c1).slice(0,2)),g1=p(hex(c1).slice(2,4)),b1=p(hex(c1).slice(4,6));
    const r2=p(hex(c2).slice(0,2)),g2=p(hex(c2).slice(2,4)),b2=p(hex(c2).slice(4,6));
    return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SECURE AGGREGATION ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 3 clients send encrypted updates; aggregator can only see the sum.
 */
class SecureAggAnimation extends BaseAnimation {
  constructor() { super('[data-animation="secureagg"]', 600, 320); }

  build() {
    if (!this.svg) return;
    const svg = this.svg;
    this._phase = 0; this._phaseT = 0;

    this._rect(0, 0, 600, 320, 'rgba(15,23,42,0.6)', svg, { rx: 0 });
    this._text(300, 16, 'Secure Aggregation — Individual Updates Remain Private',
      '#e2e8f0', svg, { 'font-size': '12', 'font-weight': '700' });

    // Aggregator (center-right)
    this._aggX = 460; this._aggY = 160;
    this._circle(this._aggX, this._aggY, 32, C.purple + 'cc', svg);
    this._text(this._aggX, this._aggY - 6, '🔒', '#fff', svg, { 'font-size': '20' });
    this._text(this._aggX, this._aggY + 18, 'Aggregator', '#e2e8f0', svg, { 'font-size': '9' });

    // 3 clients
    const clients = [
      { x: 100, y:  70, label: 'Client 1', color: C.green,  update: 'Δw₁' },
      { x: 100, y: 160, label: 'Client 2', color: C.yellow, update: 'Δw₂' },
      { x: 100, y: 250, label: 'Client 3', color: C.cyan,   update: 'Δw₃' },
    ];

    this._cData = clients.map(c => {
      this._circle(c.x, c.y, 22, c.color + 'bb', svg);
      this._text(c.x, c.y - 5, '💻', '#fff', svg, { 'font-size': '14' });
      this._text(c.x, c.y + 14, c.label, '#94a3b8', svg, { 'font-size': '8' });
      this._line(c.x + 22, c.y, this._aggX - 32, this._aggY, c.color + '22', svg);

      // Encrypted label (moves along edge)
      const encLabel = this._text(c.x + 22, c.y, '', c.color, svg,
        { 'font-size': '11', 'font-family': 'Fira Code, monospace', opacity: 0 });

      const dot = this._circle(c.x + 22, c.y, 6, c.color, svg);
      dot.setAttribute('opacity', '0');

      return { ...c, dot, encLabel };
    });

    // Result display
    this._resultBox = this._rect(310, 215, 130, 34, 'rgba(16,185,129,0.1)', svg,
      { stroke: C.green + '44', 'stroke-width': 1, opacity: 0 });
    this._resultText = this._text(375, 232, 'Sum = Δw₁+Δw₂+Δw₃', C.green, svg,
      { 'font-size': '9.5', 'font-family': 'Fira Code, monospace', opacity: 0 });

    this._phaseLabel = this._text(300, 306, '', C.slate, svg, { 'font-size': '10' });
  }

  tick() {
    const DURATION = 100;
    this._phaseT++;
    const p = this._phaseT / DURATION;

    if (this._phase === 0) {
      // Phase 0: dots travel with encrypted label
      this._phaseLabel.textContent = '🔐 Clients encrypt updates before sending';
      this._cData.forEach((c, i) => {
        const stagger = i * 0.18;
        const pp      = Math.max(0, Math.min(1, (p - stagger) / (1 - stagger)));
        const pos     = this._lerp(pp, c.x + 22, c.y, this._aggX - 32, this._aggY);
        c.dot.setAttribute('cx', pos.x);
        c.dot.setAttribute('cy', pos.y);
        c.dot.setAttribute('opacity', pp > 0 ? 1 : 0);
        c.encLabel.setAttribute('x', pos.x);
        c.encLabel.setAttribute('y', pos.y - 10);
        c.encLabel.textContent    = pp > 0.1 ? '???' : '';
        c.encLabel.setAttribute('opacity', pp > 0.1 ? 1 : 0);
      });
      this._resultBox.setAttribute('opacity', '0');
      this._resultText.setAttribute('opacity', '0');
    } else {
      // Phase 1: show result
      this._phaseLabel.textContent = '✅ Only aggregate sum is revealed — individual updates are private';
      this._cData.forEach(c => {
        c.dot.setAttribute('opacity', '0');
        c.encLabel.setAttribute('opacity', '0');
      });
      this._resultBox.setAttribute('opacity', Math.min(1, (p - 0) * 3));
      this._resultText.setAttribute('opacity', Math.min(1, (p - 0) * 3));
    }

    if (this._phaseT >= DURATION) {
      this._phaseT = 0;
      this._phase  = (this._phase + 1) % 2;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. HOMOMORPHIC ENCRYPTION ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Step-by-step toy demo:
 *   Plaintext 7 and 3 → encrypt → compute on ciphertext → decrypt → 10
 */
class HomomorphicEncAnimation extends BaseAnimation {
  constructor() { super('[data-animation="homorphic"]', 640, 340); }

  build() {
    if (!this.svg) return;
    const svg = this.svg;
    this._step = 0; this._stepT = 0;
    const STEP_DUR = 110;
    this._STEP_DUR = STEP_DUR;

    this._rect(0, 0, 640, 340, 'rgba(15,23,42,0.6)', svg, { rx: 0 });
    this._text(320, 18, 'Homomorphic Encryption — Compute on Encrypted Data',
      '#e2e8f0', svg, { 'font-size': '12', 'font-weight': '700' });

    // Step 1: Plaintext boxes
    this._ptBox1 = this._rect(40, 120, 80, 50, C.green  + '22', svg, { stroke: C.green,  'stroke-width': 1.5 });
    this._ptBox2 = this._rect(40, 200, 80, 50, C.blue   + '22', svg, { stroke: C.blue,   'stroke-width': 1.5 });
    this._ptLabel1 = this._text(80, 145, 'Plaintext: 7', C.green, svg, { 'font-size': '11', 'font-family': 'Fira Code, monospace' });
    this._ptLabel2 = this._text(80, 225, 'Plaintext: 3', C.blue,  svg, { 'font-size': '11', 'font-family': 'Fira Code, monospace' });

    // Encrypt arrow
    this._encArrow1 = this._path('M 130 145 L 220 145', C.green, 'none', svg,
      { 'stroke-dasharray': '4 3', opacity: 0 });
    this._encArrow2 = this._path('M 130 225 L 220 225', C.blue,  'none', svg,
      { 'stroke-dasharray': '4 3', opacity: 0 });
    this._encLbl1 = this._text(175, 135, 'Encrypt', C.green, svg, { 'font-size': '9', opacity: 0 });
    this._encLbl2 = this._text(175, 215, 'Encrypt', C.blue,  svg, { 'font-size': '9', opacity: 0 });

    // Step 2: Ciphertext boxes
    this._ctBox1  = this._rect(230, 120, 100, 50, C.purple + '22', svg, { stroke: C.purple, 'stroke-width': 1.5, opacity: 0 });
    this._ctBox2  = this._rect(230, 200, 100, 50, C.purple + '22', svg, { stroke: C.purple, 'stroke-width': 1.5, opacity: 0 });
    this._ctLbl1  = this._text(280, 145, 'enc(7)', C.purple, svg, { 'font-size': '11', 'font-family': 'Fira Code, monospace', opacity: 0 });
    this._ctLbl2  = this._text(280, 225, 'enc(3)', C.purple, svg, { 'font-size': '11', 'font-family': 'Fira Code, monospace', opacity: 0 });

    // Step 3: Computation
    this._compArrow = this._path('M 340 170 L 420 185', C.yellow, 'none', svg,
      { 'stroke-width': 2, opacity: 0 });
    this._compLbl   = this._text(380, 160, 'enc(7) + enc(3)\n= enc(10)', C.yellow, svg,
      { 'font-size': '10', 'font-family': 'Fira Code, monospace', opacity: 0 });
    this._ctBox3  = this._rect(430, 165, 100, 45, C.yellow + '22', svg, { stroke: C.yellow, 'stroke-width': 1.5, opacity: 0 });
    this._ctLbl3  = this._text(480, 187, 'enc(10)', C.yellow, svg, { 'font-size': '11', 'font-family': 'Fira Code, monospace', opacity: 0 });

    // Step 4: Decrypt
    this._decArrow = this._path('M 540 187 L 590 187', C.green, 'none', svg,
      { 'stroke-width': 2, opacity: 0 });
    this._decLbl   = this._text(565, 177, 'Decrypt', C.green, svg, { 'font-size': '9', opacity: 0 });
    this._decBox   = this._rect(600, 165, 30, 45, C.green + '22', svg, { stroke: C.green, 'stroke-width': 1.5, opacity: 0 });
    this._decResult = this._text(615, 187, '10', C.green, svg,
      { 'font-size': '18', 'font-weight': '700', 'font-family': 'Fira Code, monospace', opacity: 0 });

    this._stepDesc = this._text(320, 300, '', C.slate, svg, { 'font-size': '10' });
  }

  tick() {
    this._stepT++;
    const p = Math.min(1, this._stepT / this._STEP_DUR);

    const show = (el, opacity = 1) => el.setAttribute('opacity', opacity);
    const fade = (el, t) => el.setAttribute('opacity', Math.min(1, t * 3));

    switch (this._step) {
      case 0:
        this._stepDesc.textContent = 'Step 1: We have two plaintext values: 7 and 3';
        break;
      case 1:
        this._stepDesc.textContent = 'Step 2: Encrypt both values using HE scheme';
        [this._encArrow1, this._encArrow2, this._encLbl1, this._encLbl2].forEach(e => fade(e, p));
        [this._ctBox1, this._ctBox2, this._ctLbl1, this._ctLbl2].forEach(e => fade(e, p));
        break;
      case 2:
        this._stepDesc.textContent = 'Step 3: Compute addition DIRECTLY on ciphertexts — no decryption needed!';
        [this._compArrow, this._compLbl, this._ctBox3, this._ctLbl3].forEach(e => fade(e, p));
        break;
      case 3:
        this._stepDesc.textContent = 'Step 4: Decrypt result → 10  (= 7 + 3). HE preserves computation!';
        [this._decArrow, this._decLbl, this._decBox, this._decResult].forEach(e => fade(e, p));
        break;
    }

    if (this._stepT >= this._STEP_DUR) {
      this._stepT = 0;
      this._step  = (this._step + 1) % 4;
      if (this._step === 0) {
        // Reset visibility
        const reset = [
          this._encArrow1, this._encArrow2, this._encLbl1, this._encLbl2,
          this._ctBox1, this._ctBox2, this._ctLbl1, this._ctLbl2,
          this._compArrow, this._compLbl, this._ctBox3, this._ctLbl3,
          this._decArrow, this._decLbl, this._decBox, this._decResult,
        ];
        reset.forEach(e => e.setAttribute('opacity', '0'));
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CROSS-DEVICE ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server at top, many mobile icons below.
 * Each round: random subset highlighted → training → aggregation.
 */
class CrossDeviceAnimation extends BaseAnimation {
  constructor() { super('[data-animation="crossdevice"]', 600, 340); }

  build() {
    if (!this.svg) return;
    const svg = this.svg;
    this._phase = 0; this._phaseT = 0; this._round = 1;
    this._selectedIndices = [];

    this._rect(0, 0, 600, 340, 'rgba(15,23,42,0.6)', svg, { rx: 0 });
    this._roundLbl = this._text(300, 16, 'Cross-Device FL — Round 1', '#e2e8f0', svg,
      { 'font-size': '12', 'font-weight': '700' });

    // Server
    this._circle(300, 60, 28, C.blue + 'cc', svg);
    this._text(300, 54, '🖥', '#fff', svg, { 'font-size': '20' });
    this._text(300, 74, 'Server', '#94a3b8', svg, { 'font-size': '9' });

    // 16 device nodes in a grid
    const NUM = 16;
    this._devices = [];
    const cols = 8, rows = 2;
    for (let i = 0; i < NUM; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dx  = 50 + col * 70;
      const dy  = 170 + row * 80;
      this._line(dx, dy - 16, 300, 88, 'rgba(255,255,255,0.05)', svg);
      const ring = this._circle(dx, dy, 20, 'rgba(255,255,255,0.04)', svg);
      const body = this._circle(dx, dy, 18, C.slate + '55', svg);
      const icon = this._text(dx, dy - 4, '📱', '#fff', svg, { 'font-size': '13' });
      this._devices.push({ dx, dy, ring, body, icon });
    }

    this._phaseLbl = this._text(300, 316, '', C.slate, svg, { 'font-size': '10' });

    // Dots
    this._dots = this._devices.map(() => {
      const d = this._circle(300, 88, 5, C.green, svg);
      d.setAttribute('opacity', '0');
      return d;
    });

    // Pick first subset
    this._pickSubset();
  }

  _pickSubset() {
    const indices = [...Array(this._devices.length).keys()];
    // Shuffle and take 5
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    this._selectedIndices = indices.slice(0, 5);
    // Reset all colours
    this._devices.forEach((d, i) => {
      const selected = this._selectedIndices.includes(i);
      d.body.setAttribute('fill', selected ? C.cyan + '99' : C.slate + '55');
      d.ring.setAttribute('r', selected ? 22 : 20);
    });
  }

  tick() {
    const PHASE_DUR = 80;
    this._phaseT++;
    const p = this._phaseT / PHASE_DUR;

    if (this._phase === 0) {
      this._phaseLbl.textContent = '📡 Server selects random subset of available devices';
      this._selectedIndices.forEach(i => {
        const d = this._devices[i];
        const pulse = 0.6 + 0.4 * Math.sin(this._phaseT * 0.2);
        d.ring.setAttribute('r', 22 + pulse * 4);
        d.ring.setAttribute('fill', C.cyan + '33');
      });
    } else if (this._phase === 1) {
      this._phaseLbl.textContent = '⬇️ Global model sent to selected devices';
      this._selectedIndices.forEach((idx, si) => {
        const dev   = this._devices[idx];
        const stagger = si * 0.15;
        const pp      = Math.max(0, Math.min(1, (p - stagger)));
        const pos     = this._lerp(pp, 300, 88, dev.dx, dev.dy - 16);
        this._dots[idx].setAttribute('cx', pos.x);
        this._dots[idx].setAttribute('cy', pos.y);
        this._dots[idx].setAttribute('fill', C.green);
        this._dots[idx].setAttribute('opacity', pp > 0 ? 1 : 0);
      });
    } else if (this._phase === 2) {
      this._phaseLbl.textContent = '⚙️ Selected devices train locally';
      this._dots.forEach(d => d.setAttribute('opacity', '0'));
      this._selectedIndices.forEach(i => {
        const d   = this._devices[i];
        const pulse = Math.abs(Math.sin(this._phaseT * 0.2));
        d.body.setAttribute('fill', C.yellow + `${Math.floor(pulse * 180).toString(16).padStart(2,'0')}`);
      });
    } else {
      this._phaseLbl.textContent = '⬆️ Updates returned to server — round complete';
      this._selectedIndices.forEach((idx, si) => {
        const dev     = this._devices[idx];
        const stagger = si * 0.12;
        const pp      = Math.max(0, Math.min(1, (p - stagger)));
        const pos     = this._lerp(pp, dev.dx, dev.dy - 16, 300, 88);
        this._dots[idx].setAttribute('cx', pos.x);
        this._dots[idx].setAttribute('cy', pos.y);
        this._dots[idx].setAttribute('fill', C.blue);
        this._dots[idx].setAttribute('opacity', pp > 0 ? 1 : 0);
      });
    }

    if (this._phaseT >= PHASE_DUR) {
      this._phaseT = 0;
      this._phase  = (this._phase + 1) % 4;
      if (this._phase === 0) {
        this._round++;
        this._roundLbl.textContent = `Cross-Device FL — Round ${this._round}`;
        this._dots.forEach(d => d.setAttribute('opacity', '0'));
        this._pickSubset();
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CROSS-SILO ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Coordinator at top, 3 organisational nodes (Hospital, Bank, University).
 * Large data pools shown under each. Bidirectional model exchange.
 */
class CrossSiloAnimation extends BaseAnimation {
  constructor() { super('[data-animation="crosssilo"]', 600, 340); }

  build() {
    if (!this.svg) return;
    const svg = this.svg;
    this._phase = 0; this._phaseT = 0; this._round = 1;

    this._rect(0, 0, 600, 340, 'rgba(15,23,42,0.6)', svg, { rx: 0 });
    this._roundLbl = this._text(300, 16, 'Cross-Silo FL — Round 1', '#e2e8f0', svg,
      { 'font-size': '12', 'font-weight': '700' });

    // Coordinator
    this._rect(240, 40, 120, 48, C.purple + '22', svg, { stroke: C.purple, 'stroke-width': 1.5 });
    this._text(300, 58, '🏛', '#fff', svg, { 'font-size': '18' });
    this._text(300, 76, 'Coordinator', C.purple, svg, { 'font-size': '9' });

    // 3 silos
    const silos = [
      { x: 100, y: 195, icon: '🏥', label: 'Hospital',    color: C.green,  data: '2.4 TB EHR' },
      { x: 300, y: 195, icon: '🏦', label: 'Bank',        color: C.blue,   data: '1.8 TB TX'  },
      { x: 500, y: 195, icon: '🎓', label: 'University',  color: C.yellow, data: '900 GB Logs' },
    ];

    this._siloData = silos.map(s => {
      // Data pool
      this._rect(s.x - 60, 255, 120, 38, s.color + '11', svg,
        { stroke: s.color + '44', 'stroke-width': 1 });
      this._text(s.x, 274, s.data, s.color, svg, { 'font-size': '9', 'font-family': 'Fira Code, monospace' });

      // Edge to coordinator
      this._line(s.x, s.y - 22, 300, 88, s.color + '33', svg);

      // Silo node
      const ring = this._circle(s.x, s.y, 30, s.color + '22', svg);
      this._circle(s.x, s.y, 26, s.color + 'bb', svg);
      this._text(s.x, s.y - 8, s.icon, '#fff', svg, { 'font-size': '18' });
      this._text(s.x, s.y + 16, s.label, '#e2e8f0', svg, { 'font-size': '9' });

      // Dot
      const dot = this._circle(s.x, s.y - 22, 6, s.color, svg);
      dot.setAttribute('opacity', '0');

      return { ...s, ring, dot };
    });

    this._phaseLbl = this._text(300, 316, '', C.slate, svg, { 'font-size': '10' });
  }

  tick() {
    const PHASE_DUR = 90;
    this._phaseT++;
    const p = this._phaseT / PHASE_DUR;

    if (this._phase === 0) {
      this._phaseLbl.textContent = '📡 Coordinator sends global model to all silos';
      this._siloData.forEach((s, i) => {
        const stagger = i * 0.15;
        const pp      = Math.max(0, Math.min(1, (p - stagger)));
        const pos     = this._lerp(pp, 300, 88, s.x, s.y - 22);
        s.dot.setAttribute('cx', pos.x);
        s.dot.setAttribute('cy', pos.y);
        s.dot.setAttribute('fill', C.green);
        s.dot.setAttribute('opacity', pp > 0 ? 1 : 0);
      });
    } else if (this._phase === 1) {
      this._phaseLbl.textContent = '⚙️ Each silo trains on its own private data silo';
      this._siloData.forEach(s => s.dot.setAttribute('opacity', '0'));
      this._siloData.forEach((s, i) => {
        const pulse = Math.abs(Math.sin(this._phaseT * 0.18 + i * 1.3));
        s.ring.setAttribute('r', 30 + pulse * 8);
        s.ring.setAttribute('opacity', 0.2 + pulse * 0.5);
      });
    } else {
      this._phaseLbl.textContent = '⬆️ Silos return model updates to coordinator — aggregation';
      this._siloData.forEach((s, i) => {
        s.ring.setAttribute('r', 30);
        const stagger = i * 0.12;
        const pp      = Math.max(0, Math.min(1, (p - stagger)));
        const pos     = this._lerp(pp, s.x, s.y - 22, 300, 88);
        s.dot.setAttribute('cx', pos.x);
        s.dot.setAttribute('cy', pos.y);
        s.dot.setAttribute('fill', C.blue);
        s.dot.setAttribute('opacity', pp > 0 ? 1 : 0);
      });
    }

    if (this._phaseT >= PHASE_DUR) {
      this._phaseT = 0;
      this._phase  = (this._phase + 1) % 3;
      if (this._phase === 0) {
        this._round++;
        this._roundLbl.textContent = `Cross-Silo FL — Round ${this._round}`;
        this._siloData.forEach(s => s.dot.setAttribute('opacity', '0'));
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise all animations after DOM is ready.
 * Each animation auto-detects its container via data-animation attribute.
 * If the container doesn't exist in the current page, it fails silently.
 */
function initFLAnimations() {
  window.FLAnimations = {
    centralized:  new CentralizedFLAnimation(),
    federated:    new FederatedFLAnimation(),
    fedavg:       new FedAvgAnimation(),
    secureAgg:    new SecureAggAnimation(),
    homorphic:    new HomomorphicEncAnimation(),
    crossDevice:  new CrossDeviceAnimation(),
    crossSilo:    new CrossSiloAnimation(),
  };
}

// Expose classes individually for selective use
window.CentralizedFLAnimation = CentralizedFLAnimation;
window.FederatedFLAnimation   = FederatedFLAnimation;
window.FedAvgAnimation        = FedAvgAnimation;
window.SecureAggAnimation     = SecureAggAnimation;
window.HomomorphicEncAnimation= HomomorphicEncAnimation;
window.CrossDeviceAnimation   = CrossDeviceAnimation;
window.CrossSiloAnimation     = CrossSiloAnimation;
window.initFLAnimations       = initFLAnimations;

document.addEventListener('DOMContentLoaded', initFLAnimations);
