// =============================================================================
// REVA University FDP Portal — app.js
// Main application router, navigation, and presenter mode
// =============================================================================

'use strict';

// ── Section & Nav mapping ───────────────────────────────────────────────────
const SECTIONS = [
  'home','dashboard','day1','day2','fl-lab',
  'python-lab','experiments','mini-projects',
  'quiz','research','resources','feedback'
];

const NAV_ORDER = [
  'home','dashboard',
  'day1','day2',
  'fl-lab','python-lab','experiments','mini-projects',
  'quiz','research','resources','feedback'
];

let currentSection = 'home';
let presenterMode  = false;

// ── App bootstrap ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateDynamicContent();
  initNavigation();
  initTabSystem();
  initAIHierarchy();
  initUseCaseCards();
  initThreatCards();
  initExperimentCards();
  initProjectCards();
  initAccordions();
  initSearchFilter();
  initFeedbackForm();
  initKeyboardShortcuts();
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
  document.getElementById('presenter-toggle')?.addEventListener('click', togglePresenterMode);
  document.getElementById('hamburger-btn')?.addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('nav-sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('show');
  });
  // Presenter toolbar nav
  document.getElementById('pres-prev')?.addEventListener('click', () => navigatePresenter(-1));
  document.getElementById('pres-next')?.addEventListener('click', () => navigatePresenter(1));
  document.getElementById('pres-exit')?.addEventListener('click', togglePresenterMode);
  // HE toy demo
  initHEDemo();
  // Comm efficiency calc
  document.getElementById('comm-calculate')?.addEventListener('click', calcCommEfficiency);
});

// ── Dynamic content from config ──────────────────────────────────────────────
function populateDynamicContent() {
  const cfg = window.FDP_CONFIG;
  if (!cfg) return;
  const { fdp, resourcePerson, sessions } = cfg;

  // Inject FDP title everywhere
  document.querySelectorAll('[data-fdp-title]').forEach(el => el.textContent = fdp.title);
  document.querySelectorAll('[data-fdp-institution]').forEach(el => el.textContent = fdp.institution);
  document.querySelectorAll('[data-fdp-school]').forEach(el => el.textContent = fdp.school);
  document.querySelectorAll('[data-fdp-dates]').forEach(el => el.textContent = fdp.dates);
  document.querySelectorAll('[data-fdp-programme]').forEach(el => el.textContent = fdp.programme);
  document.querySelectorAll('[data-rp-name]').forEach(el => el.textContent = resourcePerson.name);
  document.querySelectorAll('[data-rp-role]').forEach(el => el.textContent = resourcePerson.role);
  document.querySelectorAll('[data-rp-spec]').forEach(el => el.textContent = resourcePerson.specialization);
  document.querySelectorAll('[data-rp-bio]').forEach(el => el.textContent = resourcePerson.bio);

  // Session info
  if (sessions && sessions.length) {
    document.querySelectorAll('[data-session-1-date]').forEach(el => el.textContent = sessions[0].date);
    document.querySelectorAll('[data-session-1-time]').forEach(el => el.textContent = sessions[0].displayTime);
    document.querySelectorAll('[data-session-1-topic]').forEach(el => el.textContent = sessions[0].topic);
    if (sessions[1]) {
      document.querySelectorAll('[data-session-2-date]').forEach(el => el.textContent = sessions[1].date);
      document.querySelectorAll('[data-session-2-time]').forEach(el => el.textContent = sessions[1].displayTime);
      document.querySelectorAll('[data-session-2-topic]').forEach(el => el.textContent = sessions[1].topic);
    }
  }

  // Resources
  buildResourceLibrary();
}

// ── Navigation ───────────────────────────────────────────────────────────────
function navigateTo(sectionId) {
  // Hide all
  SECTIONS.forEach(id => {
    const el = document.getElementById('section-' + id);
    if (el) el.style.display = 'none';
  });
  // Show target
  const target = document.getElementById('section-' + sectionId);
  if (target) {
    target.style.display = 'block';
    target.classList.add('section-enter');
    setTimeout(() => target.classList.remove('section-enter'), 600);
  }
  currentSection = sectionId;
  highlightActiveNav(sectionId);
  updatePresenterInfo(sectionId);
  // Update header title
  const headerTitle = document.getElementById('header-section-title');
  if (headerTitle) {
    const link = document.querySelector(`[data-nav="${sectionId}"]`);
    headerTitle.textContent = link ? link.getAttribute('data-label') || sectionId : sectionId;
  }
  window.location.hash = sectionId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // On mobile, close sidebar
  if (window.innerWidth < 768) {
    document.getElementById('nav-sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('show');
  }
  // Lazy-init section-specific stuff
  onSectionActivate(sectionId);
}

function handleHashChange() {
  const hash = window.location.hash.replace('#', '');
  if (SECTIONS.includes(hash)) navigateTo(hash);
  else navigateTo('home');
}

function highlightActiveNav(sectionId) {
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-nav') === sectionId);
  });
}

function initNavigation() {
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.getAttribute('data-nav'));
    });
  });
  // CTA buttons
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-goto')));
  });
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
function initTabSystem() {
  document.querySelectorAll('.tab-nav').forEach(nav => {
    nav.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group  = btn.getAttribute('data-tab-group');
        const target = btn.getAttribute('data-tab');
        // Deactivate all in group
        document.querySelectorAll(`.tab-btn[data-tab-group="${group}"]`).forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.tab-pane[data-tab-group="${group}"]`).forEach(p => p.classList.remove('active'));
        // Activate target
        btn.classList.add('active');
        const pane = document.querySelector(`.tab-pane[data-tab="${target}"][data-tab-group="${group}"]`);
        if (pane) pane.classList.add('active');
      });
    });
  });
}

// ── AI Hierarchy ─────────────────────────────────────────────────────────────
const AI_DETAILS = {
  ai: {
    title: 'Artificial Intelligence',
    definition: 'The simulation of human intelligence processes by computer systems. AI encompasses reasoning, learning, problem-solving, perception, and language understanding.',
    examples: 'Chess engines, recommendation systems, virtual assistants (Siri, Alexa), autonomous vehicles',
    algorithms: 'Search algorithms, logic programming, constraint satisfaction, expert systems',
    application: 'Healthcare diagnosis, financial forecasting, autonomous systems, smart assistants',
    dataset: 'CIFAR-10 (image), IMDb reviews (text), UCI Repository (tabular)'
  },
  ml: {
    title: 'Machine Learning',
    definition: 'A subset of AI where systems learn from data to improve performance without being explicitly programmed. Learns patterns from examples.',
    examples: 'Spam detection, product recommendations, credit scoring, predictive maintenance',
    algorithms: 'Linear Regression, Logistic Regression, Decision Trees, Random Forest, SVM, k-NN',
    application: 'Customer churn prediction, fraud detection, medical image classification',
    dataset: 'Iris, Titanic, Boston Housing, Breast Cancer Wisconsin, MNIST'
  },
  supervised: {
    title: 'Supervised Learning',
    definition: 'Learning from labeled training data. The model learns a mapping from inputs to outputs using input-output pairs.',
    examples: 'Email spam classification, house price prediction, image recognition',
    algorithms: 'Linear Regression, Logistic Regression, SVM, Neural Networks, Random Forest, XGBoost',
    application: 'Medical diagnosis, sentiment analysis, object detection',
    dataset: 'MNIST (digits), CIFAR-10 (images), ImageNet, UCI datasets'
  },
  unsupervised: {
    title: 'Unsupervised Learning',
    definition: 'Learning from unlabeled data to discover hidden patterns, structures, or groupings.',
    examples: 'Customer segmentation, topic modeling, anomaly detection, recommendation systems',
    algorithms: 'K-Means, DBSCAN, Hierarchical Clustering, PCA, Autoencoders, GMM',
    application: 'Market segmentation, document clustering, outlier detection',
    dataset: 'Mall Customers, News articles, Credit card transactions'
  },
  reinforcement: {
    title: 'Reinforcement Learning',
    definition: 'An agent learns to make decisions by interacting with an environment to maximize cumulative reward.',
    examples: 'Game playing (AlphaGo), robot control, resource management, trading algorithms',
    algorithms: 'Q-Learning, Deep Q-Network (DQN), Policy Gradient, Actor-Critic, PPO, SAC',
    application: 'Game AI, autonomous robotics, drug discovery, supply chain optimization',
    dataset: 'OpenAI Gym environments, Atari game ROMs, MuJoCo'
  },
  dl: {
    title: 'Deep Learning',
    definition: 'A subset of ML using multi-layer neural networks (deep architectures) to learn hierarchical feature representations from raw data.',
    examples: 'Image recognition, speech recognition, language translation, generative art',
    algorithms: 'CNN, RNN, LSTM, GRU, Transformer, ResNet, BERT, GPT',
    application: 'Self-driving cars, medical imaging, voice assistants, content generation',
    dataset: 'ImageNet, COCO, LibriSpeech, Common Crawl, Wikipedia'
  },
  genai: {
    title: 'Generative AI',
    definition: 'AI systems that can generate new content (text, images, audio, video, code) that resembles human-created content.',
    examples: 'ChatGPT, DALL-E, Stable Diffusion, GitHub Copilot, Midjourney, Gemini',
    algorithms: 'GANs, VAEs, Diffusion Models, Transformer LLMs, Flow-based Models',
    application: 'Content creation, code generation, drug discovery, artistic creation, education',
    dataset: 'Common Crawl, LAION-5B, The Pile, RedPajama'
  },
  intelligent: {
    title: 'Intelligent Systems',
    definition: 'Systems that exhibit intelligent behaviour by perceiving their environment and taking actions to achieve goals, often combining multiple AI techniques.',
    examples: 'Autonomous vehicles, smart home systems, intelligent tutoring systems, robotic surgery',
    algorithms: 'Multi-agent systems, Expert Systems, Knowledge Graphs, Fuzzy Logic + ML hybrid',
    application: 'Healthcare robots, smart cities, IoT ecosystems, autonomous drones',
    dataset: 'KITTI (autonomous driving), nuScenes, Robot Operating System (ROS) data'
  }
};

function initAIHierarchy() {
  document.querySelectorAll('.ai-node-label').forEach(label => {
    label.addEventListener('click', () => {
      const nodeId = label.getAttribute('data-node');
      const detailPanel = document.getElementById('ai-detail-panel');
      if (!detailPanel || !nodeId || !AI_DETAILS[nodeId]) return;
      document.querySelectorAll('.ai-node-label').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const d = AI_DETAILS[nodeId];
      detailPanel.innerHTML = `
        <div class="ai-detail-title">🔷 ${d.title}</div>
        <div class="grid-2" style="gap:16px">
          <div class="ai-detail-section"><div class="ai-detail-key">📖 Definition</div><div class="ai-detail-value">${d.definition}</div></div>
          <div class="ai-detail-section"><div class="ai-detail-key">💡 Examples</div><div class="ai-detail-value">${d.examples}</div></div>
          <div class="ai-detail-section"><div class="ai-detail-key">⚙️ Key Algorithms</div><div class="ai-detail-value">${d.algorithms}</div></div>
          <div class="ai-detail-section"><div class="ai-detail-key">🌍 Real-world Application</div><div class="ai-detail-value">${d.application}</div></div>
        </div>
        <div class="ai-detail-section" style="margin-top:12px"><div class="ai-detail-key">📊 Example Datasets</div><div class="ai-detail-value">${d.dataset}</div></div>
      `;
      detailPanel.style.display = 'block';
    });
  });
}

// ── Use-case cards ───────────────────────────────────────────────────────────
function initUseCaseCards() {
  document.querySelectorAll('.use-case-card').forEach(card => {
    const header = card.querySelector('.use-case-card-header');
    const body   = card.querySelector('.use-case-card-body');
    if (!header || !body) return;
    body.style.display = 'none';
    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      // Close all
      document.querySelectorAll('.use-case-card-body').forEach(b => b.style.display = 'none');
      if (!isOpen) body.style.display = 'block';
    });
  });
}

// ── Threat cards ─────────────────────────────────────────────────────────────
function initThreatCards() {
  document.querySelectorAll('.threat-card').forEach(card => {
    const header = card.querySelector('.threat-card-header');
    const body   = card.querySelector('.threat-card-body');
    if (!header || !body) return;
    body.style.display = 'none';
    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      document.querySelectorAll('.threat-card-body').forEach(b => b.style.display = 'none');
      if (!isOpen) body.style.display = 'block';
    });
  });
}

// ── Experiment cards ─────────────────────────────────────────────────────────
function initExperimentCards() {
  document.querySelectorAll('.experiment-card-header').forEach(header => {
    const body = header.nextElementSibling;
    if (!body || !body.classList.contains('experiment-card-body')) return;
    body.style.display = 'none';
    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      document.querySelectorAll('.experiment-card-body').forEach(b => b.style.display = 'none');
      document.querySelectorAll('.experiment-card-header').forEach(h => h.classList.remove('active'));
      if (!isOpen) { body.style.display = 'block'; header.classList.add('active'); }
    });
  });
}

// ── Mini project cards ───────────────────────────────────────────────────────
function initProjectCards() {
  document.querySelectorAll('.project-card-header').forEach(header => {
    const body = header.nextElementSibling;
    if (!body || !body.classList.contains('project-card-body')) return;
    body.style.display = 'none';
    header.addEventListener('click', () => {
      const isOpen = body.style.display !== 'none';
      document.querySelectorAll('.project-card-body').forEach(b => b.style.display = 'none');
      document.querySelectorAll('.project-card-header').forEach(h => {
        h.classList.remove('active');
        const ch = h.querySelector('.project-card-chevron');
        if (ch) ch.textContent = 'View Details ▾';
      });
      if (!isOpen) {
        body.style.display = 'block';
        header.classList.add('active');
        const ch = header.querySelector('.project-card-chevron');
        if (ch) ch.textContent = 'Hide Details ▴';
      }
    });
  });
}

// ── Accordions ───────────────────────────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const content = trigger.nextElementSibling;
      if (!content) return;
      const isOpen = content.classList.contains('open');
      if (!trigger.getAttribute('data-accordion-solo')) {
        // Close all in same group
        const group = trigger.getAttribute('data-group');
        if (group) {
          document.querySelectorAll(`.accordion-trigger[data-group="${group}"]`).forEach(t => {
            t.nextElementSibling?.classList.remove('open');
            t.classList.remove('active');
          });
        }
      }
      content.classList.toggle('open', !isOpen);
      trigger.classList.toggle('active', !isOpen);
    });
  });
}

// ── Resource library ─────────────────────────────────────────────────────────
const FILTER_TYPE_MAP = {
  'all':        null,
  'Python':     ['notebook'],
  'Framework':  ['tool'],
  'Dataset':    ['dataset'],
  'Paper':      ['paper'],
  'Slides':     ['slides', 'notes']
};

const TYPE_BADGE = {
  paper:    { label: '📄 Paper',    color: 'badge-blue'   },
  notebook: { label: '🐍 Notebook', color: 'badge-green'  },
  dataset:  { label: '🗄️ Dataset',  color: 'badge-purple' },
  tool:     { label: '🔧 Tool',     color: 'badge-cyan'   },
  slides:   { label: '📊 Slides',   color: 'badge-yellow' },
  notes:    { label: '📝 Notes',    color: 'badge-yellow' }
};

function buildResourceLibrary() {
  const cfg = window.FDP_CONFIG;
  if (!cfg || !cfg.resources) return;
  const container = document.getElementById('resource-list');
  if (!container) return;

  container.innerHTML = cfg.resources.map(r => {
    const typeMeta = TYPE_BADGE[r.type] || { label: r.type || 'Resource', color: 'badge-blue' };
    const tagsHtml = (r.tags || []).slice(0, 3).map(t =>
      `<span class="badge badge-gray" style="font-size:10px;padding:2px 6px">${t}</span>`
    ).join('');

    let actionHtml = '';
    if (r.url) {
      const isExternal = r.external || r.url.startsWith('http');
      if (isExternal) {
        actionHtml = `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" style="white-space:nowrap">🔗 Open ↗</a>`;
      } else if (r.downloadable) {
        actionHtml = `
          <a href="${r.url}" target="_blank" class="btn btn-sm btn-secondary" style="white-space:nowrap">👁️ View PDF</a>
          <a href="${r.url}" download class="btn btn-sm btn-ghost" style="white-space:nowrap;font-size:11px">⬇️ Download</a>`;
      } else {
        actionHtml = `<a href="${r.url}" target="_blank" class="btn btn-sm btn-secondary" style="white-space:nowrap">👁️ View</a>`;
      }
    } else {
      actionHtml = `<span class="badge badge-gray">Coming Soon</span>`;
    }

    const colabHtml = r.colab
      ? `<a href="${r.colab}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-ghost" style="white-space:nowrap;font-size:11px">▶ Colab</a>`
      : '';

    const metaHtml = [
      r.format ? `<span style="font-size:11px;color:var(--text-muted)">${r.format}</span>` : '',
      r.size   ? `<span style="font-size:11px;color:var(--text-muted)">${r.size}</span>`   : '',
      r.install ? `<code style="font-size:10px;background:var(--bg-secondary);padding:2px 6px;border-radius:4px">${r.install}</code>` : ''
    ].filter(Boolean).join('<span style="color:var(--border-color);margin:0 4px">|</span>');

    return `
    <div class="resource-card" data-category="${r.type}" data-tags="${(r.tags||[]).join(' ')}">
      <div class="resource-icon">${r.icon || '📄'}</div>
      <div class="resource-info">
        <div class="resource-title">${r.title}</div>
        <div class="resource-desc" style="margin-bottom:6px">${r.description || ''}</div>
        ${metaHtml ? `<div style="margin-bottom:6px">${metaHtml}</div>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${tagsHtml}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;min-width:fit-content">
        <span class="badge ${typeMeta.color}">${typeMeta.label}</span>
        ${actionHtml}
        ${colabHtml}
      </div>
    </div>`;
  }).join('');
}

// ── Resource search / filter ──────────────────────────────────────────────────
function initSearchFilter() {
  const searchInput = document.getElementById('resource-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('.resource-card').forEach(card => {
        const text = (card.textContent + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => {
        b.classList.remove('active', 'btn-primary');
        b.classList.add('btn-ghost');
      });
      btn.classList.remove('btn-ghost');
      btn.classList.add('active', 'btn-primary');

      const filterKey = btn.getAttribute('data-filter');
      const allowedTypes = FILTER_TYPE_MAP[filterKey] || null;

      document.querySelectorAll('.resource-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        if (!allowedTypes) {
          card.style.display = '';
        } else {
          card.style.display = allowedTypes.includes(cat) ? '' : 'none';
        }
      });
    });
  });
}

// ── Feedback form ─────────────────────────────────────────────────────────────
function initFeedbackForm() {
  const form = document.getElementById('feedback-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      timestamp: new Date().toISOString(),
      ratings: {},
      comments: {}
    };
    form.querySelectorAll('[data-feedback-rating]').forEach(input => {
      data.ratings[input.getAttribute('data-feedback-rating')] = input.value;
    });
    form.querySelectorAll('[data-feedback-comment]').forEach(textarea => {
      data.comments[textarea.getAttribute('data-feedback-comment')] = textarea.value;
    });
    // Store in localStorage
    const existing = JSON.parse(localStorage.getItem('fdp_feedback') || '[]');
    existing.push(data);
    localStorage.setItem('fdp_feedback', JSON.stringify(existing));
    // Show thank you
    const thankYou = document.getElementById('feedback-thankyou');
    if (thankYou) { form.style.display = 'none'; thankYou.style.display = 'block'; }
    showNotification('✅ Feedback submitted — thank you!', 'success');
  });
}

// ── Homomorphic Encryption toy demo ──────────────────────────────────────────
function initHEDemo() {
  const btn = document.getElementById('he-compute-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const a = parseFloat(document.getElementById('he-val1')?.value || 7);
    const b = parseFloat(document.getElementById('he-val2')?.value || 3);
    const op = document.getElementById('he-operation')?.value || 'add';
    let result;
    if (op === 'add') result = a + b;
    else if (op === 'mul') result = a * b;
    else result = a - b;
    const encA = `[🔐 enc(${a})]`, encB = `[🔐 enc(${b})]`, encResult = `[🔐 enc(${result})]`;
    const opSymbol = op === 'add' ? '+' : op === 'mul' ? '×' : '-';
    const el = document.getElementById('he-steps');
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:10px;text-align:center">
        <div class="card-compact" style="background:var(--bg-secondary)"><span style="color:var(--text-muted);font-size:11px">PLAINTEXTS</span><br><span style="font-size:20px;font-weight:800;color:var(--text-primary)">${a} ${opSymbol} ${b}</span></div>
        <div style="color:var(--accent-blue);font-size:20px">↓ Encrypt</div>
        <div class="card-compact" style="background:var(--bg-secondary)"><span style="color:var(--text-muted);font-size:11px">ENCRYPTED</span><br><span style="font-size:15px;font-weight:700;color:var(--accent-purple)">${encA} ${opSymbol} ${encB}</span></div>
        <div style="color:var(--accent-yellow);font-size:20px">↓ Compute on ciphertext</div>
        <div class="card-compact" style="background:var(--bg-secondary)"><span style="color:var(--text-muted);font-size:11px">ENCRYPTED RESULT</span><br><span style="font-size:15px;font-weight:700;color:var(--accent-purple)">${encResult}</span></div>
        <div style="color:var(--accent-green);font-size:20px">↓ Decrypt</div>
        <div class="card-compact" style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3)"><span style="color:var(--accent-green);font-size:11px;font-weight:700">✅ RESULT (without seeing values!)</span><br><span style="font-size:28px;font-weight:800;color:var(--accent-green)">${result}</span></div>
      </div>`;
  });
}

// ── Communication efficiency calculator ───────────────────────────────────────
function calcCommEfficiency() {
  const clients   = parseInt(document.getElementById('comm-clients')?.value || 100);
  const modelSize = parseFloat(document.getElementById('comm-model-size')?.value || 10);
  const rounds    = parseInt(document.getElementById('comm-rounds')?.value || 50);
  const ratio     = parseInt(document.getElementById('comm-compression')?.value || 10);
  const withoutMB = clients * modelSize * rounds * 2; // upload + download
  const withMB    = withoutMB / ratio;
  const savedMB   = withoutMB - withMB;
  const display   = document.getElementById('comm-savings-display');
  if (display) {
    display.innerHTML = `
      <div class="stat-row">
        <div class="stat-item"><div class="stat-value" style="color:var(--accent-red)">${withoutMB.toLocaleString()} MB</div><div class="stat-label">Without Compression</div></div>
        <div class="stat-item"><div class="stat-value" style="color:var(--accent-green)">${withMB.toLocaleString()} MB</div><div class="stat-label">With ${ratio}× Compression</div></div>
        <div class="stat-item"><div class="stat-value" style="color:var(--accent-yellow)">${savedMB.toLocaleString()} MB</div><div class="stat-label">Total Saved</div></div>
        <div class="stat-item"><div class="stat-value" style="color:var(--accent-cyan)">${((1 - 1/ratio)*100).toFixed(0)}%</div><div class="stat-label">Reduction</div></div>
      </div>`;
  }
  if (window.ChartManager) {
    ChartManager.updateCommChart(withoutMB, withMB, rounds, clients, modelSize, ratio);
  }
}

// ── Presenter mode ────────────────────────────────────────────────────────────
function togglePresenterMode() {
  presenterMode = !presenterMode;
  document.body.classList.toggle('presenter-mode', presenterMode);
  const btn = document.getElementById('presenter-toggle');
  if (btn) {
    btn.textContent = presenterMode ? '👤 Participant Mode' : '📽️ Presenter Mode';
    btn.classList.toggle('btn-warning', presenterMode);
    btn.classList.toggle('btn-ghost', !presenterMode);
  }
  showNotification(presenterMode ? '📽️ Presenter Mode ON — Speaker notes visible' : '👤 Participant Mode ON', presenterMode ? 'warning' : 'info');
}

function updatePresenterInfo(sectionId) {
  const info = document.getElementById('pres-section-info');
  if (!info) return;
  const labels = {
    'home': 'Home', 'dashboard': 'Dashboard', 'day1': 'Day 1: AI Foundations',
    'day2': 'Day 2: Privacy & Architectures', 'fl-lab': 'FL Lab',
    'python-lab': 'Python Lab', 'experiments': 'Experiments',
    'mini-projects': 'Mini Projects', 'quiz': 'Quiz',
    'research': 'Research Corner', 'resources': 'Resources', 'feedback': 'Feedback'
  };
  info.textContent = labels[sectionId] || sectionId;
}

function navigatePresenter(dir) {
  const idx = NAV_ORDER.indexOf(currentSection);
  const next = NAV_ORDER[idx + dir];
  if (next) navigateTo(next);
}

// ── Sidebar toggle ────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar  = document.getElementById('nav-sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

// ── Toast notification ────────────────────────────────────────────────────────
function showNotification(message, type = 'info') {
  const toast = document.getElementById('notification-toast');
  if (!toast) return;
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  toast.className = `toast show toast-enter`;
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => { toast.classList.remove('show'); }, 300);
  }, 3000);
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'p' || e.key === 'P') togglePresenterMode();
    if (e.key === 'Escape') {
      document.getElementById('modal-overlay')?.classList.remove('open');
      if (presenterMode) togglePresenterMode();
    }
    if (e.key === 'ArrowRight' && presenterMode) navigatePresenter(1);
    if (e.key === 'ArrowLeft'  && presenterMode) navigatePresenter(-1);
  });
}

// ── Section-specific lazy init ────────────────────────────────────────────────
function onSectionActivate(sectionId) {
  if (sectionId === 'fl-lab' || sectionId === 'day1') {
    if (window.FLSimulator) window.FLSimulator.ensureReady();
    if (window.FLAnimations) {
      FLAnimations.centralized?.start?.();
      FLAnimations.federated?.start?.();
    }
  }
  if (sectionId === 'day2') {
    if (window.DPSimulator) DPSimulator.render();
    if (window.FLAnimations) {
      FLAnimations.crossDevice?.start?.();
      FLAnimations.crossSilo?.start?.();
      FLAnimations.secureAgg?.start?.();
    }
  }
  if (sectionId === 'python-lab') {
    if (window.CodeLab) CodeLab.init();
  }
  if (sectionId === 'quiz') {
    if (window.QuizEngine) window.QuizEngine.init();
  }
  if (sectionId === 'dashboard') {
    if (window.FDPTimer) FDPTimer.startCountdown();
  }
}

// Expose global
window.navigateTo = navigateTo;
window.showNotification = showNotification;
window.togglePresenterMode = togglePresenterMode;
