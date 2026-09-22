// =============================================================================
// REVA University FDP Portal — quiz.js
// Interactive knowledge check engine
// =============================================================================

'use strict';

// ── Built-in question bank ───────────────────────────────────────────────────
const BUILT_IN_QUESTIONS = {
  'fl-basics': [
    { q: 'In Federated Learning, which of the following is sent from client to server?', options: ['Raw training data', 'Model weights / gradients', 'Labels only', 'Test data'], answer: 1, explanation: 'In FL, only model updates (weights/gradients) are sent — never raw data. This is the core privacy advantage of FL.' },
    { q: 'What does "Federated" in Federated Learning mean?', options: ['Fast and distributed', 'A union of independent entities collaborating', 'A central server processing all data', 'Federal government AI projects'], answer: 1, explanation: 'Federated refers to a confederation of independent participants (clients) collaborating while retaining control over their local data.' },
    { q: 'True or False: In Federated Learning, the server sees each client\'s private dataset.', options: ['True', 'False'], answer: 1, explanation: 'False. The server only sees aggregated model updates, never individual client data.' },
    { q: 'Which algorithm is most commonly used for aggregation in Federated Learning?', options: ['FedSGD', 'FedAvg', 'FedProx', 'SecAgg'], answer: 1, explanation: 'FedAvg (Federated Averaging) by McMahan et al. is the foundational and most widely used FL aggregation algorithm.' },
    { q: 'What is the main difference between centralized and federated learning?', options: ['Centralized is faster', 'In FL, data stays on client devices', 'FL uses more computing power', 'FL always produces better models'], answer: 1, explanation: 'The fundamental difference: in FL, training data never leaves client devices, preserving privacy and data sovereignty.' },
    { q: 'Which of the following is a real-world application of Federated Learning?', options: ['Training on a single large server', 'Google\'s Gboard next-word prediction', 'Batch processing of centralized datasets', 'Cloud storage encryption'], answer: 1, explanation: 'Google\'s Gboard uses FL to improve keyboard predictions on smartphones without uploading private typing data.' },
    { q: 'In a FL system with 5 clients and 10 rounds, how many times does each client send updates to the server (assuming all participate every round)?', options: ['5', '1', '10', '50'], answer: 2, explanation: 'Each client participates in every round (10 rounds), sending one update per round. So 10 updates per client.' },
    { q: 'What is a "communication round" in Federated Learning?', options: ['One complete epoch of training on the full dataset', 'One cycle of: broadcast model → local training → aggregate updates', 'A round-robin schedule of server backups', 'One client connecting to the server'], answer: 1, explanation: 'A communication round is one complete cycle: global model distributed to clients, local training performed, updates aggregated.' },
    { q: 'Which FL setting involves millions of mobile devices?', options: ['Cross-silo FL', 'Cross-device FL', 'Horizontal FL', 'Vertical FL'], answer: 1, explanation: 'Cross-device FL involves massive numbers of edge devices (smartphones, IoT sensors) with limited resources.' },
    { q: 'True or False: Non-IID data distribution is more common in real-world FL than IID.', options: ['True', 'False'], answer: 0, explanation: 'True. In practice, different users/organizations have very different data distributions (Non-IID), making FL convergence challenging.' }
  ],
  'fedavg': [
    { q: 'In FedAvg, how are client model updates combined?', options: ['Simple average of all client models', 'Weighted average based on local dataset sizes', 'Only the best client\'s model is used', 'Models are concatenated'], answer: 1, explanation: 'FedAvg uses weighted averaging: w(t+1) = Σ(nk/n) * wk, where nk is client k\'s data size and n is total data.' },
    { q: 'In the FedAvg formula w(t+1) = Σ(nk/n)·wk(t+1), what does nk represent?', options: ['Number of local epochs', 'Size of client k\'s local dataset', 'Number of communication rounds', 'Learning rate of client k'], answer: 1, explanation: 'nk is the number of data samples at client k. Clients with more data contribute proportionally more to the global model.' },
    { q: 'FedAvg was originally proposed in which year?', options: ['2012', '2017', '2020', '2015'], answer: 1, explanation: 'FedAvg was proposed by McMahan et al. in 2017 in the paper "Communication-Efficient Learning of Deep Networks from Decentralized Data".' },
    { q: 'What happens in FedAvg when a client has very different data from others (Non-IID)?', options: ['The global model improves faster', 'Convergence can slow down or become unstable (client drift)', 'Other clients\' models are ignored', 'The client is automatically removed'], answer: 1, explanation: 'Non-IID data causes "client drift" — local models diverge significantly from the global optimum, slowing convergence.' },
    { q: 'In FedAvg, a client with 1000 samples contributes _____ to the global model compared to a client with 100 samples.', options: ['The same amount', '10 times more weight', 'Half as much weight', 'It depends on accuracy'], answer: 1, explanation: 'FedAvg weights by dataset size. The 1000-sample client gets 10× more weight: (1000/total) vs (100/total).' }
  ],
  'privacy': [
    { q: 'What does differential privacy (DP) add to model updates to provide privacy?', options: ['Encryption keys', 'Calibrated random noise', 'Digital signatures', 'Data masking tokens'], answer: 1, explanation: 'DP adds carefully calibrated Gaussian or Laplace noise to model updates, making it statistically impossible to infer individual data records.' },
    { q: 'In (ε, δ)-differential privacy, what does a smaller ε value indicate?', options: ['Less privacy protection', 'Stronger privacy protection (more noise)', 'Faster training', 'Larger dataset requirement'], answer: 1, explanation: 'Smaller ε = stronger privacy = more noise added. The privacy budget ε controls the privacy-utility tradeoff.' },
    { q: 'What is the primary purpose of Secure Aggregation in FL?', options: ['Speed up model training', 'Prevent the server from seeing individual client updates', 'Compress model size', 'Handle Non-IID data'], answer: 1, explanation: 'Secure Aggregation ensures the FL server can only see the aggregate sum of client updates, not individual contributions.' },
    { q: 'True or False: Homomorphic Encryption allows computation on encrypted data without decrypting it.', options: ['True', 'False'], answer: 0, explanation: 'True. Homomorphic Encryption (HE) enables arithmetic operations on ciphertexts, so the server computes aggregates on encrypted updates.' },
    { q: 'Which attack attempts to reconstruct private training data from gradient updates?', options: ['Sybil Attack', 'Gradient Leakage / Deep Leakage', 'Model Poisoning', 'Free-rider Attack'], answer: 1, explanation: 'Gradient Leakage (Zhu et al., 2019) showed that private training data can be reconstructed from shared gradients in FL.' },
    { q: 'What is the privacy-utility tradeoff in DP-FL?', options: ['More privacy always improves accuracy', 'Adding more noise improves privacy but reduces model accuracy', 'Privacy has no effect on model performance', 'More data always means more privacy'], answer: 1, explanation: 'Adding more noise (stronger privacy) degrades model utility. Finding the optimal epsilon requires balancing privacy needs with acceptable accuracy loss.' },
    { q: 'Which privacy mechanism adds noise proportional to the sensitivity of the function?', options: ['Secure Aggregation', 'Homomorphic Encryption', 'Gaussian/Laplace Mechanism', 'K-anonymity'], answer: 2, explanation: 'The Gaussian and Laplace mechanisms of differential privacy calibrate noise based on the sensitivity (Δf) of the query/function.' },
    { q: 'Local DP vs Global DP: which provides stronger privacy guarantees for individual clients?', options: ['Global DP', 'Local DP', 'They are equivalent', 'It depends on the dataset'], answer: 1, explanation: 'Local DP: each client adds noise before sending updates — no trust in the server required. Global DP: noise added by server after aggregation, requiring server trust.' }
  ],
  'security': [
    { q: 'In model poisoning, what does a malicious client try to do?', options: ['Steal data from other clients', 'Manipulate the global model by sending corrupted updates', 'Impersonate the server', 'Slow down communication rounds'], answer: 1, explanation: 'Model poisoning: a compromised client sends carefully crafted malicious updates to corrupt the global model (e.g., introduce backdoors).' },
    { q: 'What is the "honest-but-curious" server threat model?', options: ['Server actively attacks clients', 'Server follows the protocol but tries to infer private information from updates', 'Server shares data with competitors', 'Server crashes during training'], answer: 1, explanation: 'An honest-but-curious (semi-honest) server correctly executes the FL protocol but attempts to extract information from client updates.' },
    { q: 'A free-rider in FL refers to:', options: ['A client with no local data', 'A participant that benefits from the global model without contributing genuine updates', 'A server that trains for free', 'A client that drops out every round'], answer: 1, explanation: 'Free-riders submit random or empty updates but benefit from the improved global model, degrading overall model quality.' },
    { q: 'Which defense is most effective against model poisoning attacks?', options: ['Increasing learning rate', 'Byzantine-robust aggregation (e.g., FedMedian, Krum)', 'Using more local epochs', 'Compressing gradients'], answer: 1, explanation: 'Byzantine-robust aggregation algorithms (Coordinate-wise Median, Krum, FLTrust) are designed to filter out malicious updates.' },
    { q: 'True or False: Differential Privacy alone can prevent all model poisoning attacks.', options: ['True', 'False'], answer: 1, explanation: 'False. DP protects privacy (inference attacks) but does not protect against poisoning attacks. Different defenses are needed for different threat models.' }
  ],
  'advanced': [
    { q: 'What is personalized FL?', options: ['Training one model per user on a central server', 'Adapting the global FL model to individual client distributions', 'Running FL only on premium devices', 'FL with personalized privacy budgets'], answer: 1, explanation: 'Personalized FL (e.g., per-FedAvg, FedPer) produces client-specific models by fine-tuning the global model on local data.' },
    { q: 'Communication efficiency in FL can be improved by:', options: ['Increasing the number of rounds', 'Gradient compression, quantization, and client sampling', 'Using larger batch sizes only', 'Always including all clients every round'], answer: 1, explanation: 'Compression (Top-K sparsification, quantization), partial client participation, and fewer rounds all reduce communication overhead.' },
    { q: 'Vertical Federated Learning differs from Horizontal FL in that:', options: ['Clients have the same features but different samples vs different features for the same samples', 'Vertical FL uses vertical GPUs', 'Vertical FL has more clients', 'There is no difference'], answer: 0, explanation: 'Horizontal FL: clients share the same feature space but different samples. Vertical FL: clients share the same samples but different feature spaces (e.g., bank + hospital collaborating on the same patients).' },
    { q: 'Federated Learning with Large Language Models (Federated LLMs) is challenging because:', options: ['LLMs are too simple', 'Massive model sizes require enormous communication bandwidth', 'LLMs cannot be distributed', 'Federated LLMs always overfit'], answer: 1, explanation: 'LLMs have billions of parameters. Communicating full model updates per round is prohibitively expensive, requiring parameter-efficient methods (LoRA, adapters) in FL.' },
    { q: 'The Flower (flwr) framework is used for:', options: ['Data augmentation in deep learning', 'A federated learning research and production framework', 'Flower-based image recognition', 'Quantum computing experiments'], answer: 1, explanation: 'Flower (flwr) is an open-source, framework-agnostic FL framework supporting research and production FL across diverse environments.' },
    { q: 'Which dataset split is more realistic in cross-device FL?', options: ['IID — each device has balanced class distribution', 'Non-IID — each device has skewed data from its own user', 'Perfectly partitioned by class', 'Identical data on all devices'], answer: 1, explanation: 'Cross-device FL is inherently Non-IID: each user\'s phone contains data specific to their behaviour, language, and preferences.' },
    { q: 'FedProx extends FedAvg by:', options: ['Adding more clients', 'Adding a proximal term to penalise large deviations from the global model during local training', 'Using secure aggregation by default', 'Reducing the number of communication rounds'], answer: 1, explanation: 'FedProx adds a proximal regularization term μ‖w - w_global‖² to the local objective, stabilizing training on heterogeneous (Non-IID) data.' }
  ]
};

// ── QuizEngine class ──────────────────────────────────────────────────────────
class QuizEngineClass {
  constructor() {
    this.questions      = [];
    this.currentIndex   = 0;
    this.score          = 0;
    this.answered       = false;
    this.moduleId       = 'fl-basics';
    this.answers        = [];     // store user's answers
    this._initialized   = false;
    this._selectedOption= undefined;
  }

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Module selector
    const sel = document.getElementById('quiz-module-select');
    sel?.addEventListener('change', () => {
      this.loadModule(sel.value);
    });

    // Action buttons
    document.getElementById('quiz-submit')?.addEventListener('click', () => this.submitAnswer());
    document.getElementById('quiz-next')?.addEventListener('click',   () => this.nextQuestion());

    this.loadModule(sel?.value || 'fl-basics');
  }

  loadModule(moduleId) {
    this.moduleId = moduleId;
    const cfg = window.FDP_CONFIG?.quiz?.[moduleId];
    this.questions = cfg || BUILT_IN_QUESTIONS[moduleId] || BUILT_IN_QUESTIONS['fl-basics'];
    
    // Sync dropdown if not already set
    const sel = document.getElementById('quiz-module-select');
    if (sel && sel.value !== moduleId) sel.value = moduleId;

    this.reset();
  }

  reset() {
    this.currentIndex = 0;
    this.score        = 0;
    this.answered     = false;
    this.answers      = [];
    this._selectedOption = undefined;

    const results = document.getElementById('quiz-results');
    const main    = document.getElementById('quiz-main');
    if (results) results.style.display = 'none';
    if (main)    main.style.display    = 'block';

    this.renderQuestion(0);
    this._updateProgress();
  }

  renderQuestion(index) {
    const q = this.questions[index];
    if (!q) return;

    this.currentIndex    = index;
    this.answered        = false;
    this._selectedOption = undefined;

    const container = document.getElementById('quiz-container');
    if (!container) return;

    container.innerHTML = `
      <div class="quiz-card">
        <div class="quiz-progress-text">Question ${index + 1} of ${this.questions.length} &nbsp;|&nbsp; Current Score: ${this.score}/${this.answers.length}</div>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options" id="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}" onclick="window.QuizEngine.selectOption(${i})">
              <span class="quiz-option-indicator">${String.fromCharCode(65+i)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback-panel" style="display:none"></div>
      </div>`;

    // Buttons
    const submitBtn = document.getElementById('quiz-submit');
    const nextBtn   = document.getElementById('quiz-next');
    if (submitBtn) {
      submitBtn.style.display = 'inline-flex';
      submitBtn.disabled = true;
      submitBtn.textContent = '✅ Submit Answer';
    }
    if (nextBtn) {
      nextBtn.style.display = 'none';
    }

    this._updateProgress();
  }

  selectOption(optionIndex) {
    if (this.answered) return;

    this._selectedOption = optionIndex;

    // Highlight selection
    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
      btn.classList.toggle('selected', i === optionIndex);
    });

    const submitBtn = document.getElementById('quiz-submit');
    if (submitBtn) submitBtn.disabled = false;
  }

  submitAnswer() {
    if (this.answered || this._selectedOption === undefined) return;
    this.answered = true;

    const q = this.questions[this.currentIndex];
    const isCorrect = (this._selectedOption === q.answer);
    if (isCorrect) this.score++;

    this.answers.push({
      questionIndex: this.currentIndex,
      selected: this._selectedOption,
      correct: isCorrect
    });

    // Show correct/incorrect styles on options
    document.querySelectorAll('.quiz-option').forEach((btn, i) => {
      if (i === q.answer) btn.classList.add('correct');
      if (i === this._selectedOption && !isCorrect) btn.classList.add('incorrect');
      btn.disabled = true;
    });

    // Show feedback panel
    const feedback = document.getElementById('quiz-feedback-panel');
    if (feedback) {
      feedback.style.display = 'block';
      feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
      feedback.innerHTML = `
        <div style="font-weight:700;font-size:14px;margin-bottom:4px">
          ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
        </div>
        <div>${q.explanation}</div>
      `;
    }

    // Toggle submit/next buttons
    const submitBtn = document.getElementById('quiz-submit');
    const nextBtn   = document.getElementById('quiz-next');
    if (submitBtn) submitBtn.style.display = 'none';
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.textContent = (this.currentIndex + 1 >= this.questions.length) ? 'View Final Results 🏆' : 'Next Question →';
    }

    this._updateProgress();
  }

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex >= this.questions.length) {
      this.showResults();
    } else {
      this.renderQuestion(this.currentIndex);
    }
  }

  showResults() {
    const main    = document.getElementById('quiz-main');
    const results = document.getElementById('quiz-results');
    if (main)    main.style.display    = 'none';
    if (!results) return;

    results.style.display = 'block';
    const total = this.questions.length;
    const pct   = Math.round((this.score / total) * 100);
    const grade = pct >= 80 ? '🏆 Outstanding!' : pct >= 60 ? '👍 Good Job!' : '📚 Keep Learning & Review';
    const color = pct >= 80 ? 'var(--accent-green)' : pct >= 60 ? 'var(--accent-blue)' : 'var(--accent-yellow)';

    results.innerHTML = `
      <div class="quiz-card quiz-score-display">
        <div class="quiz-score-circle" style="border-color:${color};color:${color}">${pct}%</div>
        <h2 style="color:var(--text-primary);margin-bottom:8px">${grade}</h2>
        <p style="color:var(--text-secondary);font-size:14px">You scored <strong style="color:var(--accent-blue)">${this.score} out of ${total}</strong> questions correctly.</p>
        <div style="margin:20px 0;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
          ${this.answers.map((a, i) => `
            <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
              <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:${a.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};color:${a.correct ? '#34d399' : '#f87171'};border:1px solid ${a.correct ? '#10b981' : '#ef4444'};line-height:28px;text-align:center;font-size:13px;font-weight:700">${a.correct?'✓':'✗'}</span>
              <span style="font-size:10px;color:var(--text-muted)">Q${i+1}</span>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap">
          <button class="btn btn-primary" id="quiz-restart" onclick="window.QuizEngine.reset()">🔄 Retake Quiz</button>
          <button class="btn btn-secondary" onclick="navigateTo('research')">🔭 Explore Research</button>
        </div>
      </div>`;

    this._updateProgress();
  }

  _updateProgress() {
    const progressBar = document.getElementById('quiz-progress-fill');
    const progressTxt = document.getElementById('quiz-progress-text');
    const scoreEl     = document.getElementById('quiz-score');
    const total = this.questions.length;
    const currentNum = Math.min(this.currentIndex + 1, total);

    if (progressBar) progressBar.style.width = `${total > 0 ? (this.answers.length / total) * 100 : 0}%`;
    if (progressTxt) progressTxt.textContent = `Question ${currentNum} of ${total}`;
    if (scoreEl) {
      scoreEl.innerHTML = `Score: <strong style="color:var(--accent-green)">${this.score}</strong> / ${this.answers.length}`;
    }
  }
}

// Singleton & Exports
const quizInstance = new QuizEngineClass();
window.QuizEngine = quizInstance;
window.QuizEngineClass = QuizEngineClass;

// Static bridges for safety if called as class
QuizEngineClass.init = () => quizInstance.init();
QuizEngineClass.selectOption = (i) => quizInstance.selectOption(i);
QuizEngineClass.submitAnswer = () => quizInstance.submitAnswer();
QuizEngineClass.nextQuestion = () => quizInstance.nextQuestion();
QuizEngineClass.reset = () => quizInstance.reset();
QuizEngineClass.loadModule = (m) => quizInstance.loadModule(m);

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.QuizEngine.init();
});
