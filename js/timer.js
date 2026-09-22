// =============================================================================
// REVA University FDP Portal — timer.js
// Session countdown timer for FDP Day 1 & Day 2
// =============================================================================

'use strict';

class FDPTimer {
  constructor() {
    this.sessions = [
      { day: 1, date: '2026-09-22', start: 17, end: 20, label: 'Day 1 — Foundations of AI & Distributed Learning' },
      { day: 2, date: '2026-09-23', start: 17, end: 20, label: 'Day 2 — FL Architectures & Privacy-Preserving AI' }
    ];
    this.interval    = null;
    this.running     = false;
    this.manualMode  = false;  // true when resource person overrides the timer
    this.manualEnd   = null;   // manual session end timestamp
    this.manualStart = null;

    // DOM references
    this.elHours    = document.getElementById('timer-hours');
    this.elMins     = document.getElementById('timer-minutes');
    this.elSecs     = document.getElementById('timer-seconds');
    this.elBar      = document.getElementById('timer-progress-bar');
    this.elLabel    = document.getElementById('timer-session-label');
    this.elStatus   = document.getElementById('timer-status');
    this.elBtnStart = document.getElementById('timer-start');
    this.elBtnPause = document.getElementById('timer-pause');
    this.elBtnReset = document.getElementById('timer-reset');

    this._bindButtons();
    this.tick(); // initial render
  }

  // ── Session detection ────────────────────────────────────────────────────
  _currentSession() {
    const now = new Date();
    for (const s of this.sessions) {
      const start = new Date(`${s.date}T${String(s.start).padStart(2,'0')}:00:00+05:30`);
      const end   = new Date(`${s.date}T${String(s.end).padStart(2,'0')}:00:00+05:30`);
      if (now >= start && now < end) return { session: s, state: 'active', start, end };
      if (now < start) return { session: s, state: 'upcoming', start, end };
    }
    // All sessions past
    return { session: null, state: 'ended', start: null, end: null };
  }

  // ── Core tick ────────────────────────────────────────────────────────────
  tick() {
    if (this.manualMode && this.manualEnd) {
      const now  = new Date();
      const diff = Math.max(0, this.manualEnd - now);
      const elapsed = now - this.manualStart;
      const total   = this.manualEnd - this.manualStart;
      this._render(diff, elapsed, total, 'Custom Session', diff === 0 ? 'ENDED' : this.running ? 'RUNNING' : 'PAUSED');
      return;
    }

    const { session, state, start, end } = this._currentSession();
    const now = new Date();

    if (state === 'active') {
      const remaining = Math.max(0, end - now);
      const elapsed   = now - start;
      const total     = end - start;
      this._render(remaining, elapsed, total, session.label, 'ACTIVE');
    } else if (state === 'upcoming') {
      const remaining = Math.max(0, start - now);
      this._render(remaining, 0, 1, `Next: ${session.label}`, 'UPCOMING');
      if (this.elBar) this.elBar.style.width = '0%';
    } else {
      this._render(0, 1, 1, 'FDP Sessions Completed', 'ENDED');
    }
  }

  _render(remainingMs, elapsedMs, totalMs, label, status) {
    const totalSec = Math.floor(remainingMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    if (this.elHours) this.elHours.textContent = String(h).padStart(2, '0');
    if (this.elMins)  this.elMins.textContent  = String(m).padStart(2, '0');
    if (this.elSecs)  this.elSecs.textContent  = String(s).padStart(2, '0');

    if (this.elLabel)  this.elLabel.textContent = label;
    if (this.elStatus) {
      this.elStatus.textContent = status;
      this.elStatus.className = 'timer-status ' +
        (status === 'ACTIVE' || status === 'RUNNING' ? 'timer-running' :
         status === 'PAUSED' ? 'timer-paused' : '');
    }

    if (this.elBar && totalMs > 0) {
      const pct = Math.min(100, (elapsedMs / totalMs) * 100);
      this.elBar.style.width = pct + '%';
    }

    // Compact header timer
    const headerTimer = document.getElementById('header-timer-compact');
    if (headerTimer) {
      headerTimer.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
  }

  // ── Controls ─────────────────────────────────────────────────────────────
  start(durationHours = 3) {
    if (this.running) return;
    this.running     = true;
    this.manualMode  = true;
    this.manualStart = new Date();
    this.manualEnd   = new Date(this.manualStart.getTime() + durationHours * 3600 * 1000);
    this.interval    = setInterval(() => this.tick(), 1000);
    this.tick();
    if (window.showNotification) showNotification('⏱️ Session timer started', 'success');
  }

  pause() {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.interval);
    this.interval = null;
    if (window.showNotification) showNotification('⏸️ Timer paused', 'warning');
    this.tick();
  }

  resume() {
    if (this.running) return;
    // Adjust end time by pause duration
    this.running  = true;
    this.interval = setInterval(() => this.tick(), 1000);
    if (window.showNotification) showNotification('▶️ Timer resumed', 'success');
  }

  reset() {
    clearInterval(this.interval);
    this.interval   = null;
    this.running    = false;
    this.manualMode = false;
    this.manualEnd  = null;
    this.manualStart = null;
    this.tick();
    if (window.showNotification) showNotification('🔄 Timer reset', 'info');
  }

  startCountdown() {
    if (this.interval) return;
    this.interval = setInterval(() => this.tick(), 1000);
  }

  _bindButtons() {
    this.elBtnStart?.addEventListener('click', () => {
      if (this.running) this.pause();
      else if (this.manualMode) this.resume();
      else this.start(3);
      this._updateButtonLabels();
    });
    this.elBtnPause?.addEventListener('click', () => { this.pause(); this._updateButtonLabels(); });
    this.elBtnReset?.addEventListener('click', () => { this.reset(); this._updateButtonLabels(); });
  }

  _updateButtonLabels() {
    if (this.elBtnStart) {
      this.elBtnStart.textContent = this.running ? '⏸ Pause' : '▶ Start';
    }
  }
}

// Instantiate globally
window.FDPTimer = new FDPTimer();

// Global shortcuts
window.startTimer  = (h) => FDPTimer.start(h);
window.pauseTimer  = ()  => FDPTimer.pause();
window.resetTimer  = ()  => FDPTimer.reset();
