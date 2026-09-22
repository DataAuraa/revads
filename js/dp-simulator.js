/**
 * DP Simulator - Differential Privacy Educational Demonstration
 * REVA University Federated Learning FDP Portal
 *
 * Educational simulation showing the effect of Gaussian noise (DP mechanism)
 * on model gradient updates.
 *
 * DISCLAIMER: This is a simplified educational visualisation.
 * Real DP implementations (e.g., DP-SGD) require formal privacy analysis
 * and careful sensitivity calibration.
 *
 * Mechanism:
 *   noisy_grad = clean_grad + N(0, σ²)
 *   where σ = sensitivity / epsilon
 *
 * Privacy-utility intuition:
 *   Low  ε  (e.g. 0.1) → high noise → high privacy   → low utility
 *   High ε  (e.g. 5.0) → low noise  → low  privacy   → high utility
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** L2-sensitivity of the simulated gradient clipping mechanism */
const SENSITIVITY = 1.0;

/** Number of gradient dimensions to visualise */
const GRAD_DIM = 20;

/** Baseline model accuracy without any noise (%) */
const BASE_ACCURACY = 92.0;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────

/** Box-Muller Gaussian sample */
function dpGaussian(mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function dpClamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLASS
// ─────────────────────────────────────────────────────────────────────────────

class DPSimulator {
  constructor() {
    /** Current privacy budget (from slider) */
    this.epsilon = 1.0;

    /** Fixed "clean" gradient vector (seeded once) */
    this._cleanGradients = DPSimulator._generateCleanGradients();

    /** Chart instances */
    this._originalChart = null;
    this._noisyChart    = null;

    this._initUI();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // INITIALISATION
  // ─────────────────────────────────────────────────────────────────────────────

  _initUI() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._initUI());
      return;
    }

    this._initCharts();
    this._bindSlider();
    this._update(); // initial render
  }

  _bindSlider() {
    const slider = document.getElementById('dp-noise-slider');
    if (!slider) return;

    slider.addEventListener('input', () => {
      this.epsilon = parseFloat(slider.value);
      this._update();
    });

    // Reflect initial value
    this.epsilon = parseFloat(slider.value) || 1.0;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CHART INITIALISATION
  // ─────────────────────────────────────────────────────────────────────────────

  _initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('[DPSimulator] Chart.js not loaded.');
      return;
    }

    const labels = this._cleanGradients.map((_, i) => `g${i + 1}`);

    // ── Original gradient chart ────────────────────────────────────────────────
    const origCanvas = document.getElementById('dp-original-chart');
    if (origCanvas) {
      if (this._originalChart) this._originalChart.destroy();
      this._originalChart = new Chart(origCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Clean Gradient',
              data:  this._cleanGradients.slice(),
              backgroundColor: this._cleanGradients.map(v =>
                v >= 0 ? 'rgba(16,185,129,0.7)' : 'rgba(59,130,246,0.7)'
              ),
              borderColor: this._cleanGradients.map(v =>
                v >= 0 ? '#10b981' : '#3b82f6'
              ),
              borderWidth: 1,
              borderRadius: 3,
            },
          ],
        },
        options: this._chartOptions('Clean Gradient (no noise)'),
      });
    }

    // ── Noisy gradient chart ───────────────────────────────────────────────────
    const noisyCanvas = document.getElementById('dp-noisy-chart');
    if (noisyCanvas) {
      if (this._noisyChart) this._noisyChart.destroy();
      this._noisyChart = new Chart(noisyCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Noisy Gradient (DP)',
              data:  this._addNoise(this.epsilon),
              backgroundColor: 'rgba(245,158,11,0.65)',
              borderColor:     '#f59e0b',
              borderWidth: 1,
              borderRadius: 3,
            },
          ],
        },
        options: this._chartOptions('DP-Noisy Gradient'),
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE CYCLE
  // ─────────────────────────────────────────────────────────────────────────────

  /** Called whenever epsilon changes; recomputes and refreshes all displays */
  _update() {
    const noisyGrads = this._addNoise(this.epsilon);

    // ── Update noisy chart data ────────────────────────────────────────────────
    if (this._noisyChart) {
      const colors = noisyGrads.map(v =>
        v >= 0 ? 'rgba(245,158,11,0.7)' : 'rgba(239,68,68,0.7)'
      );
      const borders = noisyGrads.map(v =>
        v >= 0 ? '#f59e0b' : '#ef4444'
      );
      this._noisyChart.data.datasets[0].data            = noisyGrads;
      this._noisyChart.data.datasets[0].backgroundColor = colors;
      this._noisyChart.data.datasets[0].borderColor     = borders;
      this._noisyChart.update('active');
    }

    // ── Epsilon display ────────────────────────────────────────────────────────
    const epsEl = document.getElementById('dp-epsilon-display');
    if (epsEl) epsEl.textContent = `ε = ${this.epsilon.toFixed(2)}`;

    // ── Accuracy impact ────────────────────────────────────────────────────────
    const accuracy = this._computeAccuracy(this.epsilon);
    const accEl    = document.getElementById('dp-accuracy-display');
    if (accEl) accEl.textContent = `${accuracy.toFixed(1)}%`;

    // ── Privacy score (inversely proportional to epsilon) ─────────────────────
    const privacyScore = dpClamp(100 * (1 / this.epsilon) * 20 / 20, 0, 100);
    // Simplified: privacy = min(100, 100 / epsilon * 1)
    const ps = dpClamp(100 / this.epsilon, 0, 100);
    this._setScoreBar('dp-privacy-score', ps, '#8b5cf6');

    // ── Utility score ─────────────────────────────────────────────────────────
    const us = dpClamp(accuracy, 10, 100);
    this._setScoreBar('dp-utility-score', us, '#10b981');

    // ── Sigma label ───────────────────────────────────────────────────────────
    const sigma = SENSITIVITY / this.epsilon;
    const sigEl = document.getElementById('dp-sigma-display');
    if (sigEl) sigEl.textContent = `σ = ${sigma.toFixed(3)}`;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MATHS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Apply Gaussian noise to the clean gradient vector.
   * σ = sensitivity / epsilon
   *
   * @param {number} epsilon
   * @returns {number[]}
   */
  _addNoise(epsilon) {
    const sigma = SENSITIVITY / epsilon;
    return this._cleanGradients.map(g =>
      parseFloat((g + dpGaussian(0, sigma)).toFixed(5))
    );
  }

  /**
   * Estimate simulated model accuracy given epsilon.
   * accuracy = base_acc * (1 - 0.3 * (1/epsilon)^0.3)
   *
   * @param {number} epsilon
   * @returns {number} percentage
   */
  _computeAccuracy(epsilon) {
    return dpClamp(
      BASE_ACCURACY * (1 - 0.3 * Math.pow(1 / epsilon, 0.3)),
      10,
      BASE_ACCURACY
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Generate a fixed "clean" gradient vector once.
   * Values are in [-0.5, 0.5] – realistic gradient magnitudes for a normalised model.
   *
   * @returns {number[]}
   */
  static _generateCleanGradients() {
    // Use a seeded-like sequence so the chart is visually consistent on load
    const seed = [
       0.312, -0.178,  0.421, -0.089,  0.235,
      -0.356,  0.198, -0.412,  0.073,  0.288,
      -0.145,  0.392, -0.267,  0.181,  0.045,
      -0.223,  0.337, -0.156,  0.499, -0.088,
    ];
    return seed.slice(0, GRAD_DIM);
  }

  /**
   * Set a score bar element's width and colour.
   * @param {string} elementId  - The element ID (no #)
   * @param {number} value      - 0–100
   * @param {string} color      - CSS colour
   */
  _setScoreBar(elementId, value, color) {
    const el = document.getElementById(elementId);
    if (!el) return;

    // If element is a progress-bar wrapper, find inner bar
    const inner = el.querySelector('[data-bar], .bar-fill, .progress-fill') || el;
    inner.style.width      = `${dpClamp(value, 0, 100)}%`;
    inner.style.background = color;
    inner.style.transition = 'width 0.4s ease, background 0.4s ease';

    // Also set aria and text if directly on the element
    el.setAttribute('aria-valuenow', value.toFixed(0));
    const label = el.querySelector('[data-label]') || el.querySelector('span');
    if (label) label.textContent = `${value.toFixed(0)}%`;
  }

  /**
   * Shared Chart.js options for both gradient charts.
   * @param {string} titleText
   * @returns {object}
   */
  _chartOptions(titleText) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { size: 10 } },
          grid:  { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          min: -1.5,
          max:  1.5,
          ticks: { color: '#94a3b8', font: { size: 10 } },
          grid:  { color: 'rgba(255,255,255,0.07)' },
          title: { display: true, text: 'Gradient Value', color: '#94a3b8' },
        },
      },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#94a3b8' } },
        title:  { display: true, text: titleText, color: '#e2e8f0', font: { size: 13 } },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          titleColor:      '#e2e8f0',
          bodyColor:       '#94a3b8',
          borderColor:     'rgba(255,255,255,0.15)',
          borderWidth:      1,
        },
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

window.DPSimulator = DPSimulator;

document.addEventListener('DOMContentLoaded', () => {
  window.dpSimulator = new DPSimulator();
});
