/**
 * FL Simulator - Federated Learning Browser Simulation Engine
 * REVA University Federated Learning FDP Portal
 *
 * This is an EDUCATIONAL simulation. It uses mathematical models to simulate
 * the behaviour of federated learning without actual distributed computation.
 *
 * Simulation model:
 * - Each client has a "local dataset" represented by parameters that affect learning.
 * - Local training is simulated using a logistic convergence curve with noise.
 * - FedAvg aggregation is weighted averaging of simulated model weights.
 * - IID:     All clients converge at similar rates.
 * - Non-IID: Clients have different convergence rates and final accuracies.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Portal accent colours (matches CSS custom properties) */
const FL_COLORS = {
  blue:   '#3b82f6',
  green:  '#10b981',
  red:    '#ef4444',
  yellow: '#f59e0b',
  cyan:   '#06b6d4',
  purple: '#8b5cf6',
};

/** Palette for per-client chart lines */
const CLIENT_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6',
  '#f97316', '#a3e635',
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Gaussian random using Box-Muller transform */
function gaussianRandom(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Clamp a value between min and max */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** Format a number to N decimal places */
function fmt(n, d = 4) {
  return parseFloat(n.toFixed(d));
}

/** Return current HH:MM:SS timestamp string */
function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLASS
// ─────────────────────────────────────────────────────────────────────────────

class FLSimulator {
  constructor() {
    /** Simulation hyper-parameters (synced from UI sliders/selects) */
    this.config = {
      numClients:   5,
      numRounds:    20,
      epochs:       3,
      learningRate: 0.01,
      batchSize:    32,
      dataset:      'synthetic',
      distribution: 'iid',
      aggregation:  'fedavg',
    };

    /** Runtime state */
    this.state = {
      currentRound:   0,
      isRunning:      false,
      isPaused:       false,
      globalAccuracy: 0,
      globalLoss:     1.0,
      history: {
        rounds:         [],
        globalAccuracy: [],
        globalLoss:     [],
        clientAccuracy: [], // 2-D: [round][clientIndex]
        clientLoss:     [],
      },
    };

    /** Array of client descriptor objects */
    this.clients = [];

    /** Simulated global model weights vector (length 8) */
    this._globalWeights = new Array(8).fill(0).map(() => Math.random() * 0.1);

    /** Chart instances */
    this._accuracyChart     = null;
    this._lossChart         = null;
    this._distributionChart = null;

    /** Timeout handle for round scheduling */
    this._roundTimer = null;

    this._initUI();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UI INITIALISATION
  // ─────────────────────────────────────────────────────────────────────────────

  /** Bind all controls and initialise display values */
  _initUI() {
    // Wait for DOM if called too early
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._initUI());
      return;
    }

    this._bindSliders();
    this._bindSelects();
    this._bindButtons();
    this.initCharts();
    this._setStatus('Ready. Configure parameters and press Start.');
    this.addToLog('FL Simulator initialised.', 'info');
  }

  /** Wire up range inputs and show live value labels */
  _bindSliders() {
    const sliders = [
      { id: 'fl-sim-clients',  prop: 'numClients',   label: '#fl-sim-clients-val',  parse: parseInt },
      { id: 'fl-sim-rounds',   prop: 'numRounds',    label: '#fl-sim-rounds-val',   parse: parseInt },
      { id: 'fl-sim-epochs',   prop: 'epochs',       label: '#fl-sim-epochs-val',   parse: parseInt },
      { id: 'fl-sim-lr',       prop: 'learningRate', label: '#fl-sim-lr-val',        parse: parseFloat },
      { id: 'fl-sim-batch',    prop: null,           label: null,                    parse: parseInt },
    ];

    sliders.forEach(({ id, prop, label, parse }) => {
      const el = document.getElementById(id);
      if (!el) return;

      // Set initial display
      if (label) {
        const lbl = document.querySelector(label);
        if (lbl) lbl.textContent = el.value;
      }
      if (prop && this.config[prop] !== undefined) {
        this.config[prop] = parse(el.value);
      }

      el.addEventListener('input', () => {
        if (label) {
          const lbl = document.querySelector(label);
          if (lbl) lbl.textContent = el.value;
        }
        if (prop) this.config[prop] = parse(el.value);
      });
    });
  }

  /** Wire up select inputs */
  _bindSelects() {
    const selects = [
      { id: 'fl-sim-batch',        prop: 'batchSize',    parse: parseInt },
      { id: 'fl-sim-dataset',      prop: 'dataset',      parse: v => v },
      { id: 'fl-sim-distribution', prop: 'distribution', parse: v => v },
      { id: 'fl-sim-aggregation',  prop: 'aggregation',  parse: v => v },
    ];

    selects.forEach(({ id, prop, parse }) => {
      const el = document.getElementById(id);
      if (!el) return;
      this.config[prop] = parse(el.value);
      el.addEventListener('change', () => {
        this.config[prop] = parse(el.value);
      });
    });
  }

  /** Wire up start / stop / reset buttons */
  _bindButtons() {
    const startBtn = document.getElementById('fl-sim-start');
    const stopBtn  = document.getElementById('fl-sim-stop');
    const resetBtn = document.getElementById('fl-sim-reset');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn)  stopBtn.addEventListener('click',  () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────────

  /** Begin the simulation from round 1 */
  start() {
    if (this.state.isRunning) return;

    // Re-read config from DOM in case user changed values after last reset
    this._syncConfigFromDOM();

    this.state.isRunning    = true;
    this.state.isPaused     = false;
    this.state.currentRound = 0;

    // Generate fresh clients
    this.clients = this.generateClientData(this.config.numClients, this.config.distribution);

    // Clear history
    this.state.history = {
      rounds:         [],
      globalAccuracy: [],
      globalLoss:     [],
      clientAccuracy: [],
      clientLoss:     [],
    };

    // Reset global weights
    this._globalWeights = new Array(8).fill(0).map(() => Math.random() * 0.1);

    // Reset stats
    this.state.globalAccuracy = 0;
    this.state.globalLoss     = 1.0;

    // Draw per-client panels
    this._renderClientPanels();

    this._setStatus('Running…');
    this.addToLog(`Simulation started: ${this.config.numClients} clients, ${this.config.numRounds} rounds, ${this.config.distribution.toUpperCase()}, ${this.config.aggregation.toUpperCase()}`, 'start');

    // Kick off round loop
    this._scheduleRound(1);
  }

  /** Stop a running simulation */
  stop() {
    if (!this.state.isRunning) return;
    if (this._roundTimer) clearTimeout(this._roundTimer);
    this.state.isRunning = false;
    this.state.isPaused  = true;
    this._setStatus('Stopped by user.');
    this.addToLog('Simulation stopped.', 'warn');
  }

  /** Reset simulation to initial state, clear charts */
  reset() {
    this.stop();
    this.state = {
      currentRound:   0,
      isRunning:      false,
      isPaused:       false,
      globalAccuracy: 0,
      globalLoss:     1.0,
      history: {
        rounds:         [],
        globalAccuracy: [],
        globalLoss:     [],
        clientAccuracy: [],
        clientLoss:     [],
      },
    };
    this.clients = [];
    this._globalWeights = new Array(8).fill(0).map(() => Math.random() * 0.1);

    // Clear panels
    const panelContainer = document.getElementById('fl-sim-client-panels');
    if (panelContainer) panelContainer.innerHTML = '';

    // Reset stat displays
    this._setRoundDisplay(0);
    this._setGlobalAcc(0);
    this._setGlobalLoss(1.0);
    this._setStatus('Reset. Configure parameters and press Start.');

    // Re-init charts (clears data)
    this.initCharts();

    // Clear log
    const log = document.getElementById('fl-sim-log');
    if (log) log.innerHTML = '';

    this.addToLog('Simulator reset.', 'info');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ROUND EXECUTION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Schedule next round with a 300 ms delay to give a real-time feel.
   * @param {number} roundNum
   */
  _scheduleRound(roundNum) {
    const delay = 300; // ms per round
    this._roundTimer = setTimeout(() => this.runRound(roundNum), delay);
  }

  /**
   * Simulate one complete FL round.
   * @param {number} roundNum - 1-based round index
   */
  runRound(roundNum) {
    if (!this.state.isRunning) return;

    this.state.currentRound = roundNum;
    this._setRoundDisplay(roundNum);
    this.addToLog(`──── Round ${roundNum} / ${this.config.numRounds} ────`, 'round');

    // ── Step A: Broadcast global model to all clients ──────────────────────────
    this.addToLog('Broadcasting global model to clients…', 'info');

    // ── Step B: Local training on each client ──────────────────────────────────
    const clientUpdates = this.clients.map(client => {
      const metrics = this.simulateLocalTraining(client, roundNum);
      client.localAccuracy = metrics.accuracy;
      client.localLoss     = metrics.loss;
      client.weights       = metrics.weights;
      return { client, metrics };
    });

    this.addToLog(`All ${this.clients.length} clients completed local training.`, 'success');

    // ── Step C: Aggregate ──────────────────────────────────────────────────────
    let newGlobalWeights;
    switch (this.config.aggregation) {
      case 'fedmedian':
        newGlobalWeights = this.federatedMedian(clientUpdates.map(u => u.client.weights));
        break;
      case 'fedprox':
        newGlobalWeights = this.federatedProx(clientUpdates.map(u => ({
          weights: u.client.weights,
          dataSize: u.client.dataSize,
        })), 0.01);
        break;
      case 'fedavg':
      default:
        newGlobalWeights = this.federatedAverage(clientUpdates.map(u => ({
          weights:  u.client.weights,
          dataSize: u.client.dataSize,
        })));
        break;
    }

    this._globalWeights = newGlobalWeights;

    // ── Step D: Compute global accuracy & loss from aggregated weights ─────────
    const targetAccuracy = this._targetAccuracy();
    const progress       = roundNum / this.config.numRounds;
    const noise          = gaussianRandom(0, 0.004);

    // Logistic convergence
    const k              = 3.5 + this.config.learningRate * 20;
    const rawAcc         = targetAccuracy * (1 - Math.exp(-k * progress)) + noise;
    this.state.globalAccuracy = clamp(rawAcc * 100, 0, 99.9);
    this.state.globalLoss     = clamp(
      1.0 * Math.exp(-k * progress) + Math.abs(gaussianRandom(0, 0.008)),
      0.001,
      1.5
    );

    // ── Step E: Update history ─────────────────────────────────────────────────
    this.state.history.rounds.push(roundNum);
    this.state.history.globalAccuracy.push(fmt(this.state.globalAccuracy, 2));
    this.state.history.globalLoss.push(fmt(this.state.globalLoss, 4));

    const roundClientAcc  = [];
    const roundClientLoss = [];
    this.clients.forEach(c => {
      roundClientAcc.push(fmt(c.localAccuracy * 100, 2));
      roundClientLoss.push(fmt(c.localLoss, 4));
    });
    this.state.history.clientAccuracy.push(roundClientAcc);
    this.state.history.clientLoss.push(roundClientLoss);

    // ── Step F: Update all UI ─────────────────────────────────────────────────
    this.updateDisplay();
    this.updateCharts();

    this.addToLog(
      `Global → Accuracy: ${this.state.globalAccuracy.toFixed(2)}%  Loss: ${this.state.globalLoss.toFixed(4)}`,
      'success'
    );

    // ── Step G: Continue or finish ─────────────────────────────────────────────
    if (roundNum < this.config.numRounds && this.state.isRunning) {
      this._scheduleRound(roundNum + 1);
    } else if (roundNum >= this.config.numRounds) {
      this.state.isRunning = false;
      this._setStatus(`✔ Simulation complete! Final accuracy: ${this.state.globalAccuracy.toFixed(2)}%`);
      this.addToLog(
        `Simulation complete. Final accuracy: ${this.state.globalAccuracy.toFixed(2)}%  Final loss: ${this.state.globalLoss.toFixed(4)}`,
        'complete'
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TRAINING SIMULATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Simulate local training for a single client in a given round.
   * Uses logistic convergence: accuracy = target_acc * (1 - exp(-k * epochs * round))
   *
   * @param {object} client   - Client descriptor
   * @param {number} roundNum - Current round number
   * @returns {{ accuracy: number, loss: number, weights: number[] }}
   */
  simulateLocalTraining(client, roundNum) {
    const { epochs, learningRate } = this.config;
    const k        = client.convergenceRate * learningRate * 50;
    const progress = (roundNum * epochs) / (this.config.numRounds * epochs);

    const noise    = gaussianRandom(0, client.noiseLevel);
    const rawAcc   = client.targetAccuracy * (1 - Math.exp(-k * progress)) + noise;
    const accuracy = clamp(rawAcc, 0, 0.999);

    const loss     = clamp(
      client.initialLoss * Math.exp(-k * progress * 0.9)
        + Math.abs(gaussianRandom(0, client.noiseLevel * 0.5)),
      0.001, 2.0
    );

    // Simulate local weight vector (perturb global weights slightly)
    const weights = this._globalWeights.map(w =>
      w + gaussianRandom(0, learningRate * (1 - progress) * 0.2)
    );

    // Update panel
    this.updateClientPanel(client, { accuracy: accuracy * 100, loss });

    return { accuracy, loss, weights };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AGGREGATION ALGORITHMS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * FedAvg: weighted average of client weights by local dataset size.
   * w_global = Σ (n_k / n_total) * w_k
   *
   * @param {{ weights: number[], dataSize: number }[]} updates
   * @returns {number[]} aggregated weight vector
   */
  federatedAverage(updates) {
    const totalData = updates.reduce((s, u) => s + u.dataSize, 0);
    const dim       = updates[0].weights.length;
    const result    = new Array(dim).fill(0);

    updates.forEach(({ weights, dataSize }) => {
      const frac = dataSize / totalData;
      weights.forEach((w, i) => { result[i] += frac * w; });
    });

    return result;
  }

  /**
   * FedMedian: coordinate-wise median (robust to Byzantine attacks).
   *
   * @param {number[][]} weightsList - Array of weight vectors
   * @returns {number[]}
   */
  federatedMedian(weightsList) {
    const dim    = weightsList[0].length;
    const result = [];

    for (let i = 0; i < dim; i++) {
      const col    = weightsList.map(w => w[i]).sort((a, b) => a - b);
      const mid    = Math.floor(col.length / 2);
      const median = col.length % 2 === 0
        ? (col[mid - 1] + col[mid]) / 2
        : col[mid];
      result.push(median);
    }
    return result;
  }

  /**
   * FedProx: proximal term regularises local updates towards global model.
   * Simplified: weighted average with μ-regularised correction toward global.
   *
   * @param {{ weights: number[], dataSize: number }[]} updates
   * @param {number} mu - Proximal term coefficient
   * @returns {number[]}
   */
  federatedProx(updates, mu = 0.01) {
    const avgWeights = this.federatedAverage(updates);
    // Apply light pull toward global (proximal step)
    return avgWeights.map((w, i) =>
      w - mu * (w - this._globalWeights[i])
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CLIENT GENERATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate an array of heterogeneous client descriptors.
   *
   * IID:     Similar convergence rates and balanced class distribution.
   * Non-IID: Highly varied convergence rates; each client biased to 1-2 classes.
   *
   * @param {number} numClients
   * @param {'iid'|'non-iid'} distribution
   * @returns {object[]}
   */
  generateClientData(numClients, distribution) {
    const clients = [];
    const numClasses = 10;

    for (let i = 0; i < numClients; i++) {
      let convergenceRate, targetAccuracy, noiseLevel, classDistribution;

      if (distribution === 'iid') {
        convergenceRate    = 0.8 + Math.random() * 0.4;   // 0.8 – 1.2
        targetAccuracy     = 0.88 + Math.random() * 0.06; // 88 – 94 %
        noiseLevel         = 0.005 + Math.random() * 0.01;
        classDistribution  = new Array(numClasses).fill(1 / numClasses); // uniform
      } else {
        // Non-IID: each client is biased toward 1–2 classes
        convergenceRate    = 0.3 + Math.random() * 1.2;   // 0.3 – 1.5
        targetAccuracy     = 0.60 + Math.random() * 0.25; // 60 – 85 %
        noiseLevel         = 0.01 + Math.random() * 0.04;

        classDistribution  = new Array(numClasses).fill(0.01);
        const dominantClass   = Math.floor(Math.random() * numClasses);
        const secondary       = (dominantClass + 1) % numClasses;
        classDistribution[dominantClass] = 0.6 + Math.random() * 0.3;
        classDistribution[secondary]     = 0.1 + Math.random() * 0.1;

        // Normalise
        const sum = classDistribution.reduce((a, b) => a + b, 0);
        classDistribution = classDistribution.map(v => v / sum);
      }

      const dataSize = Math.floor(500 + Math.random() * 4500); // 500 – 5000

      clients.push({
        id:               i + 1,
        localAccuracy:    0,
        localLoss:        1.0,
        dataSize,
        convergenceRate,
        targetAccuracy,
        noiseLevel,
        initialLoss:      1.2 + Math.random() * 0.8,
        classDistribution,
        weights:          new Array(8).fill(0).map(() => Math.random() * 0.1),
        color:            CLIENT_PALETTE[i % CLIENT_PALETTE.length],
      });
    }

    return clients;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DISPLAY UPDATES
  // ─────────────────────────────────────────────────────────────────────────────

  /** Synchronise all global stat DOM elements */
  updateDisplay() {
    this._setGlobalAcc(this.state.globalAccuracy);
    this._setGlobalLoss(this.state.globalLoss);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOGGING
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Append a timestamped entry to the simulation log.
   * @param {string} message
   * @param {'info'|'success'|'warn'|'error'|'round'|'start'|'complete'} type
   */
  addToLog(message, type = 'info') {
    const log = document.getElementById('fl-sim-log');
    if (!log) return;

    const colorMap = {
      info:     '#94a3b8',
      success:  '#10b981',
      warn:     '#f59e0b',
      error:    '#ef4444',
      round:    '#3b82f6',
      start:    '#8b5cf6',
      complete: '#06b6d4',
    };

    const entry  = document.createElement('div');
    entry.className = 'fl-log-entry';
    entry.style.cssText = `
      padding: 3px 0;
      font-size: 0.78rem;
      font-family: 'Fira Code', monospace;
      color: ${colorMap[type] || '#94a3b8'};
      border-bottom: 1px solid rgba(255,255,255,0.04);
    `;
    entry.textContent = `[${timestamp()}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CLIENT PANELS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Render all client panels inside #fl-sim-client-panels.
   */
  _renderClientPanels() {
    const container = document.getElementById('fl-sim-client-panels');
    if (!container) return;
    container.innerHTML = '';
    this.clients.forEach(c => {
      const panel = this.createClientPanel(c);
      container.appendChild(panel);
    });
  }

  /**
   * Create the HTML element for a single client training panel.
   * @param {object} client
   * @returns {HTMLElement}
   */
  createClientPanel(client) {
    const panel = document.createElement('div');
    panel.id    = `fl-client-panel-${client.id}`;
    panel.style.cssText = `
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 8px;
      transition: box-shadow 0.3s;
    `;

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-weight:600;color:${client.color};font-size:0.85rem;">
          🖥 Client ${client.id}
        </span>
        <span style="font-size:0.75rem;color:#64748b;">
          ${client.dataSize.toLocaleString()} samples
        </span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div>
          <div style="font-size:0.7rem;color:#64748b;margin-bottom:2px;">Accuracy</div>
          <div id="fl-c${client.id}-acc" style="font-size:1rem;font-weight:700;color:#e2e8f0;">0.00%</div>
          <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:4px;overflow:hidden;">
            <div id="fl-c${client.id}-acc-bar" style="height:100%;width:0%;background:${client.color};transition:width 0.4s;border-radius:2px;"></div>
          </div>
        </div>
        <div>
          <div style="font-size:0.7rem;color:#64748b;margin-bottom:2px;">Loss</div>
          <div id="fl-c${client.id}-loss" style="font-size:1rem;font-weight:700;color:#e2e8f0;">1.0000</div>
          <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:4px;overflow:hidden;">
            <div id="fl-c${client.id}-loss-bar" style="height:100%;width:100%;background:#ef4444;transition:width 0.4s;border-radius:2px;"></div>
          </div>
        </div>
      </div>
      <div style="margin-top:8px;font-size:0.7rem;color:#64748b;">
        Convergence rate: <span style="color:${client.color};">${client.convergenceRate.toFixed(2)}</span>
        &nbsp;|&nbsp;
        Data dist: <span style="color:#94a3b8;">${
          this.config.distribution === 'iid' ? 'Uniform (IID)' : 'Skewed (Non-IID)'
        }</span>
      </div>
    `;

    return panel;
  }

  /**
   * Update the per-client panel with new metrics.
   * @param {object} client
   * @param {{ accuracy: number, loss: number }} metrics
   */
  updateClientPanel(client, metrics) {
    const accEl    = document.getElementById(`fl-c${client.id}-acc`);
    const lossEl   = document.getElementById(`fl-c${client.id}-loss`);
    const accBar   = document.getElementById(`fl-c${client.id}-acc-bar`);
    const lossBar  = document.getElementById(`fl-c${client.id}-loss-bar`);

    if (accEl)   accEl.textContent  = `${clamp(metrics.accuracy, 0, 100).toFixed(2)}%`;
    if (lossEl)  lossEl.textContent = metrics.loss.toFixed(4);
    if (accBar)  accBar.style.width = `${clamp(metrics.accuracy, 0, 100)}%`;
    if (lossBar) lossBar.style.width = `${clamp(metrics.loss * 66.7, 0, 100)}%`;

    // Flash effect
    const panel = document.getElementById(`fl-client-panel-${client.id}`);
    if (panel) {
      panel.style.boxShadow = `0 0 12px ${client.color}44`;
      setTimeout(() => { panel.style.boxShadow = 'none'; }, 500);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHARTS
  // ─────────────────────────────────────────────────────────────────────────────

  /** Initialise (or re-initialise) all three simulation charts */
  initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('[FLSimulator] Chart.js not loaded.');
      return;
    }

    // Accuracy chart (global + one line per client)
    this._accuracyChart = this._buildAccuracyChart();
    // Loss chart
    this._lossChart     = this._buildLossChart();
    // Distribution chart (data per client)
    this._distributionChart = this._buildDistributionChart();
  }

  _buildAccuracyChart() {
    const canvas = document.getElementById('fl-sim-accuracy-chart');
    if (!canvas) return null;

    // Destroy existing
    if (this._accuracyChart) this._accuracyChart.destroy();

    return new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Global Accuracy (%)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.12)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Round', color: '#94a3b8' },
            grid:  { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
          y: {
            display: true,
            min: 0, max: 100,
            title: { display: true, text: 'Accuracy (%)', color: '#94a3b8' },
            grid:  { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
        },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#94a3b8' } },
        },
      },
    });
  }

  _buildLossChart() {
    const canvas = document.getElementById('fl-sim-loss-chart');
    if (!canvas) return null;

    if (this._lossChart) this._lossChart.destroy();

    return new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Global Loss',
            data: [],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.1)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Round', color: '#94a3b8' },
            grid:  { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
          y: {
            display: true,
            min: 0,
            title: { display: true, text: 'Loss', color: '#94a3b8' },
            grid:  { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
        },
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#94a3b8' } },
        },
      },
    });
  }

  _buildDistributionChart() {
    const canvas = document.getElementById('fl-sim-distribution-chart');
    if (!canvas) return null;

    if (this._distributionChart) this._distributionChart.destroy();

    return new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Client', color: '#94a3b8' },
            grid:  { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
          y: {
            display: true,
            min: 0, max: 100,
            title: { display: true, text: 'Local Accuracy (%)', color: '#94a3b8' },
            grid:  { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
  }

  /** Update all chart data from current state history */
  updateCharts() {
    const { rounds, globalAccuracy, globalLoss } = this.state.history;

    // ── Accuracy chart ─────────────────────────────────────────────────────────
    if (this._accuracyChart) {
      this._accuracyChart.data.labels = rounds.slice();
      this._accuracyChart.data.datasets[0].data = globalAccuracy.slice();
      this._accuracyChart.update('active');
    }

    // ── Loss chart ─────────────────────────────────────────────────────────────
    if (this._lossChart) {
      this._lossChart.data.labels = rounds.slice();
      this._lossChart.data.datasets[0].data = globalLoss.slice();
      this._lossChart.update('active');
    }

    // ── Distribution (per-client accuracy bar) ─────────────────────────────────
    if (this._distributionChart && this.clients.length > 0) {
      this._distributionChart.data.labels   = this.clients.map(c => `C${c.id}`);
      this._distributionChart.data.datasets = [
        {
          label: 'Client Accuracy (%)',
          data:  this.clients.map(c => clamp(c.localAccuracy * 100, 0, 100).toFixed(2)),
          backgroundColor: this.clients.map(c => c.color + 'cc'),
          borderColor:     this.clients.map(c => c.color),
          borderWidth: 1,
          borderRadius: 4,
        },
      ];
      this._distributionChart.update('active');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  /** Dataset-specific target accuracy ceiling */
  _targetAccuracy() {
    switch (this.config.dataset) {
      case 'mnist-like':  return 0.97;
      case 'iris-like':   return 0.95;
      case 'synthetic':   return 0.91;
      case 'custom':      return 0.88;
      default:            return 0.90;
    }
  }

  /** Re-read all DOM inputs into config (in case user changed values) */
  _syncConfigFromDOM() {
    const r = id => document.getElementById(id);
    if (r('fl-sim-clients'))      this.config.numClients   = parseInt(r('fl-sim-clients').value)   || 5;
    if (r('fl-sim-rounds'))       this.config.numRounds    = parseInt(r('fl-sim-rounds').value)    || 20;
    if (r('fl-sim-epochs'))       this.config.epochs       = parseInt(r('fl-sim-epochs').value)    || 3;
    if (r('fl-sim-lr'))           this.config.learningRate = parseFloat(r('fl-sim-lr').value)      || 0.01;
    if (r('fl-sim-batch'))        this.config.batchSize    = parseInt(r('fl-sim-batch').value)     || 32;
    if (r('fl-sim-dataset'))      this.config.dataset      = r('fl-sim-dataset').value             || 'synthetic';
    if (r('fl-sim-distribution')) this.config.distribution = r('fl-sim-distribution').value        || 'iid';
    if (r('fl-sim-aggregation'))  this.config.aggregation  = r('fl-sim-aggregation').value         || 'fedavg';
  }

  _setStatus(msg) {
    const el = document.getElementById('fl-sim-status');
    if (el) el.textContent = msg;
  }

  _setRoundDisplay(n) {
    const el = document.getElementById('fl-sim-round-display');
    if (el) el.textContent = n;
  }

  _setGlobalAcc(pct) {
    const el = document.getElementById('fl-sim-global-acc');
    if (el) el.textContent = `${pct.toFixed(2)}%`;
  }

  _setGlobalLoss(loss) {
    const el = document.getElementById('fl-sim-global-loss');
    if (el) el.textContent = loss.toFixed(4);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

window.FLSimulator = FLSimulator;

/** Auto-instantiate when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  window.flSimulator = new FLSimulator();
});
