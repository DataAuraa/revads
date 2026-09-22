/**
 * ChartManager - Chart.js Wrapper Module
 * REVA University Federated Learning FDP Portal
 *
 * Manages all Chart.js instances across the portal with a consistent dark theme.
 * All charts use the portal's CSS design-system colour palette.
 *
 * Usage:
 *   const mgr = new ChartManager();
 *   const chart = mgr.createLineChart('myCanvas', 'Accuracy', [], {});
 *   mgr.updateChartData('myCanvas', { labels: [...], datasets: [...] });
 */

'use strict';

class ChartManager {
  constructor() {
    /** @type {Map<string, Chart>} */
    this._charts = new Map();

    // Register global Chart.js defaults for dark theme
    this._applyGlobalDefaults();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GLOBAL DEFAULTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Apply dark-theme global defaults so every chart looks consistent
   * without per-chart config repetition.
   */
  _applyGlobalDefaults() {
    if (typeof Chart === 'undefined') {
      console.warn('[ChartManager] Chart.js not loaded yet – defaults will be applied lazily.');
      return;
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';
    Chart.defaults.backgroundColor = 'transparent';

    Chart.defaults.plugins.legend.labels.color = '#94a3b8';
    Chart.defaults.plugins.legend.labels.font = { family: 'Inter, sans-serif', size: 12 };

    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15,23,42,0.95)';
    Chart.defaults.plugins.tooltip.titleColor = '#e2e8f0';
    Chart.defaults.plugins.tooltip.bodyColor = '#94a3b8';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.15)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
  }

  /**
   * Shared scale configuration for x/y axes (dark theme).
   * @param {boolean} [showX=true]
   * @param {boolean} [showY=true]
   * @returns {object}
   */
  _darkScales(showX = true, showY = true) {
    const axis = {
      grid: { color: 'rgba(255,255,255,0.07)', drawBorder: false },
      ticks: { color: '#94a3b8', font: { family: 'Inter, sans-serif', size: 11 } },
    };
    return {
      x: { display: showX, ...axis },
      y: { display: showY, ...axis },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FACTORY METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create a line chart.
   * @param {string} canvasId   - Canvas element ID (without #)
   * @param {string} label      - Dataset label
   * @param {Array}  initialData - Initial y-values array
   * @param {object} [options]  - Chart.js options overrides
   * @returns {Chart|null}
   */
  createLineChart(canvasId, label, initialData = [], options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`[ChartManager] Canvas #${canvasId} not found.`);
      return null;
    }
    this.destroyChart(canvasId);

    const labels = initialData.map((_, i) => i + 1);

    const defaultConfig = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data: initialData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.12)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#3b82f6',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: this._darkScales(),
        plugins: {
          legend: { display: true, position: 'top' },
        },
        ...options,
      },
    };

    const chart = new Chart(canvas.getContext('2d'), defaultConfig);
    this._charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Create a multi-dataset line chart.
   * @param {string}  canvasId  - Canvas element ID
   * @param {Array}   labels    - X-axis labels
   * @param {Array}   datasets  - Array of Chart.js dataset objects
   * @param {object}  [options] - Options overrides
   * @returns {Chart|null}
   */
  createMultiLineChart(canvasId, labels = [], datasets = [], options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`[ChartManager] Canvas #${canvasId} not found.`);
      return null;
    }
    this.destroyChart(canvasId);

    const config = {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: this._darkScales(),
        plugins: { legend: { display: true, position: 'top' } },
        ...options,
      },
    };

    const chart = new Chart(canvas.getContext('2d'), config);
    this._charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Create a bar chart.
   * @param {string} canvasId   - Canvas element ID
   * @param {Array}  labels     - Category labels
   * @param {Array}  datasets   - Chart.js dataset objects
   * @param {object} [options]  - Options overrides
   * @returns {Chart|null}
   */
  createBarChart(canvasId, labels = [], datasets = [], options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`[ChartManager] Canvas #${canvasId} not found.`);
      return null;
    }
    this.destroyChart(canvasId);

    const config = {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: this._darkScales(),
        plugins: { legend: { display: true, position: 'top' } },
        ...options,
      },
    };

    const chart = new Chart(canvas.getContext('2d'), config);
    this._charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Create a doughnut chart.
   * @param {string} canvasId - Canvas element ID
   * @param {Array}  labels   - Segment labels
   * @param {Array}  data     - Values
   * @param {Array}  [colors] - Hex colour strings
   * @returns {Chart|null}
   */
  createDoughnutChart(canvasId, labels = [], data = [], colors = []) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`[ChartManager] Canvas #${canvasId} not found.`);
      return null;
    }
    this.destroyChart(canvasId);

    const defaultColors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6',
    ];
    const palette = colors.length ? colors : defaultColors;

    const config = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: palette.slice(0, data.length).map(c => c + 'cc'),
            borderColor: palette.slice(0, data.length),
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        plugins: {
          legend: { display: true, position: 'right' },
        },
      },
    };

    const chart = new Chart(canvas.getContext('2d'), config);
    this._charts.set(canvasId, chart);
    return chart;
  }

  /**
   * Create a scatter chart.
   * @param {string} canvasId  - Canvas element ID
   * @param {Array}  datasets  - Chart.js dataset objects with { x, y } points
   * @param {object} [options] - Options overrides
   * @returns {Chart|null}
   */
  createScatterChart(canvasId, datasets = [], options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`[ChartManager] Canvas #${canvasId} not found.`);
      return null;
    }
    this.destroyChart(canvasId);

    const config = {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Privacy (ε)', color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
          y: {
            display: true,
            title: { display: true, text: 'Utility (Accuracy %)', color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.07)' },
            ticks: { color: '#94a3b8' },
          },
        },
        plugins: { legend: { display: true, position: 'top' } },
        ...options,
      },
    };

    const chart = new Chart(canvas.getContext('2d'), config);
    this._charts.set(canvasId, chart);
    return chart;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SPECIALISED CHARTS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Create the communication-efficiency comparison charts.
   * Renders two side-by-side bar charts: without compression and with compression.
   * @param {string} withoutCanvasId - Canvas for "without compression"
   * @param {string} withCanvasId    - Canvas for "with compression"
   * @param {object} data            - { rounds, withoutMB, withMB }
   */
  createCommunicationComparisonChart(withoutCanvasId, withCanvasId, data) {
    const { rounds = [], withoutMB = [], withMB = [] } = data;

    // Without compression
    this.createBarChart(
      withoutCanvasId,
      rounds.map(r => `Rnd ${r}`),
      [
        {
          label: 'Total Data (MB)',
          data: withoutMB,
          backgroundColor: 'rgba(239,68,68,0.6)',
          borderColor: '#ef4444',
          borderWidth: 1,
        },
      ],
      {
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'Without Compression', color: '#94a3b8' },
        },
        scales: {
          ...this._darkScales(),
          y: {
            ...this._darkScales().y,
            title: { display: true, text: 'MB Transferred', color: '#94a3b8' },
          },
        },
      }
    );

    // With compression
    this.createBarChart(
      withCanvasId,
      rounds.map(r => `Rnd ${r}`),
      [
        {
          label: 'Total Data (MB)',
          data: withMB,
          backgroundColor: 'rgba(16,185,129,0.6)',
          borderColor: '#10b981',
          borderWidth: 1,
        },
      ],
      {
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'With Compression', color: '#94a3b8' },
        },
        scales: {
          ...this._darkScales(),
          y: {
            ...this._darkScales().y,
            title: { display: true, text: 'MB Transferred', color: '#94a3b8' },
          },
        },
      }
    );
  }

  /**
   * Create the privacy-utility tradeoff scatter chart.
   * Generates a predefined curve showing how higher epsilon (less private) 
   * generally yields higher utility.
   * @param {string} canvasId
   */
  createPrivacyUtilityChart(canvasId) {
    // Generate tradeoff curve: epsilon from 0.1 to 10
    const epsilons = [0.1, 0.2, 0.5, 1, 2, 3, 5, 7, 10];
    const baseAcc = 92;
    const points = epsilons.map(eps => ({
      x: parseFloat(eps.toFixed(2)),
      y: parseFloat((baseAcc * (1 - 0.3 * Math.pow(1 / eps, 0.3))).toFixed(2)),
    }));

    this.createScatterChart(
      canvasId,
      [
        {
          label: 'Privacy-Utility Tradeoff',
          data: points,
          backgroundColor: 'rgba(139,92,246,0.7)',
          borderColor: '#8b5cf6',
          pointRadius: 7,
          showLine: true,
          tension: 0.4,
          borderWidth: 2,
          fill: false,
        },
      ],
      {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx =>
                `ε=${ctx.parsed.x}  →  Accuracy ≈ ${ctx.parsed.y.toFixed(1)}%`,
            },
          },
        },
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DATA UPDATE / DESTROY
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Update a chart's data and trigger re-render.
   * @param {string} chartId   - Canvas element ID used when the chart was created
   * @param {object} newData   - { labels?, datasets? } or just { data } for single-dataset charts
   * @param {number} [datasetIndex=0] - Which dataset to update (for single-value updates)
   */
  updateChartData(chartId, newData, datasetIndex = 0) {
    const chart = this._charts.get(chartId);
    if (!chart) {
      console.warn(`[ChartManager] No chart found for id "${chartId}".`);
      return;
    }

    if (newData.labels !== undefined) {
      chart.data.labels = newData.labels;
    }
    if (Array.isArray(newData.datasets)) {
      newData.datasets.forEach((ds, i) => {
        if (chart.data.datasets[i]) {
          Object.assign(chart.data.datasets[i], ds);
        } else {
          chart.data.datasets.push(ds);
        }
      });
    } else if (newData.data !== undefined) {
      chart.data.datasets[datasetIndex].data = newData.data;
    }

    chart.update('active');
  }

  /**
   * Append a single data point to a dataset.
   * @param {string} chartId
   * @param {*}      label         - X-axis label for the new point
   * @param {number} value         - Y value
   * @param {number} [dsIndex=0]   - Dataset index
   * @param {number} [maxPoints]   - If set, remove oldest point to keep chart tidy
   */
  appendDataPoint(chartId, label, value, dsIndex = 0, maxPoints = null) {
    const chart = this._charts.get(chartId);
    if (!chart) return;

    chart.data.labels.push(label);
    chart.data.datasets[dsIndex].data.push(value);

    if (maxPoints && chart.data.labels.length > maxPoints) {
      chart.data.labels.shift();
      chart.data.datasets.forEach(ds => ds.data.shift());
    }

    chart.update('active');
  }

  /**
   * Destroy a single chart by canvas ID.
   * @param {string} chartId
   */
  destroyChart(chartId) {
    if (this._charts.has(chartId)) {
      this._charts.get(chartId).destroy();
      this._charts.delete(chartId);
    }
  }

  /**
   * Destroy all active chart instances.
   */
  destroyAll() {
    for (const [id, chart] of this._charts) {
      chart.destroy();
    }
    this._charts.clear();
  }

  /**
   * Get an existing chart instance.
   * @param {string} chartId
   * @returns {Chart|undefined}
   */
  getChart(chartId) {
    return this._charts.get(chartId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────
window.ChartManager = ChartManager;

/** Global singleton used by other modules */
window.chartManager = new ChartManager();
