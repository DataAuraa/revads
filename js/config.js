/**
 * config.js — REVA University FDP Portal Global Configuration
 * Federated Learning for Secure and Distributed AI Systems
 *
 * This file exposes window.FDP_CONFIG, the single source of truth for all
 * portal content, metadata, quiz questions, and resource entries.
 * All other modules read from this object — do NOT hard-code values elsewhere.
 */

'use strict';

window.FDP_CONFIG = {

  /* ─────────────────────────────────────────────────────────────────────────
     FDP METADATA
  ───────────────────────────────────────────────────────────────────────── */
  fdp: {
    title:       'Federated Learning for Secure and Distributed AI Systems',
    shortTitle:  'FL for Secure & Distributed AI',
    institution: 'REVA University, Bengaluru',
    school:      'School of Computer Science and Engineering',
    programme:   'Faculty Development Programme',
    duration:    'Five-Day Online FDP',
    dates:       '22nd September 2026 to 26th September 2026',
    startDate:   '2026-09-22',
    endDate:     '2026-09-26',
    version:     '1.0.0',
    disclaimer:
      'All demonstrations are intended for educational and research-training purposes. ' +
      'Real-world deployment requires appropriate privacy, security, governance, ' +
      'compliance, and validation.',
    tags: [
      'Federated Learning', 'Privacy-Preserving AI', 'Distributed Systems',
      'Differential Privacy', 'Secure Aggregation', 'Edge AI', 'IoT', 'Research'
    ]
  },

  /* ─────────────────────────────────────────────────────────────────────────
     RESOURCE PERSON
  ───────────────────────────────────────────────────────────────────────── */
  resourcePerson: {
    name:           'Prof. (Dr.) Anjit Raja R',
    role:           'Professor | AI/ML & Data Science Expert | Researcher | Trainer',
    specialization: 'AI/ML | Data Science | Generative AI | Intelligent Systems | IoT | Research & Innovation',
    designation:    'Resource Person – REVA University FDP',
    email:          'anjit.raja@example.edu',
    linkedin:       'https://linkedin.com/in/anjit-raja-r',
    bio:
      'Prof. (Dr.) Anjit Raja R is an AI/ML and Data Science expert with deep expertise ' +
      'in Intelligent Systems, Generative AI, IoT, and Research & Innovation. ' +
      'As the resource person for this Faculty Development Programme, he brings cutting-edge ' +
      'research knowledge and practical implementation experience to federated learning ' +
      'and privacy-preserving AI.',
    expertise: [
      'Federated & Distributed Machine Learning',
      'Differential Privacy & Secure Computation',
      'Generative AI & Large Language Models',
      'Deep Learning & Neural Architectures',
      'Internet of Things & Edge Intelligence',
      'Research Methodology & Academic Writing'
    ],
    publications: 40,
    experience: 18
  },

  /* ─────────────────────────────────────────────────────────────────────────
     SESSION SCHEDULE (all five days)
  ───────────────────────────────────────────────────────────────────────── */
  sessions: [
    {
      day:         1,
      date:        '22 September 2026',
      isoDate:     '2026-09-22',
      startTime:   '17:00',
      endTime:     '20:00',
      displayTime: '05:00 PM – 08:00 PM IST',
      topic:       'Foundations of Artificial Intelligence and Distributed Learning',
      sectionId:   'day1',
      color:       '#3b82f6',
      modules: [
        'AI, ML, DL Hierarchy — Conceptual Clarity',
        'Classical ML vs. Distributed ML',
        'Why Federated Learning? Motivation & Use Cases',
        'Privacy Laws: GDPR, HIPAA, IT Act 2000',
        'FedAvg Algorithm — Derivation & Intuition',
        'Hands-on: First FL Simulation in Python'
      ]
    },
    {
      day:         2,
      date:        '23 September 2026',
      isoDate:     '2026-09-23',
      startTime:   '17:00',
      endTime:     '20:00',
      displayTime: '05:00 PM – 08:00 PM IST',
      topic:       'Federated Learning Architectures and Privacy-Preserving AI',
      sectionId:   'day2',
      color:       '#06b6d4',
      modules: [
        'Cross-Device vs. Cross-Silo FL',
        'Horizontal, Vertical & Federated Transfer Learning',
        'Differential Privacy — Theory & ε-δ Guarantee',
        'Secure Aggregation with Secret Sharing',
        'Homomorphic Encryption Primer',
        'Hands-on: DP-FedAvg with Privacy Budget Tracking'
      ]
    },
    {
      day:         3,
      date:        '24 September 2026',
      isoDate:     '2026-09-24',
      startTime:   '17:00',
      endTime:     '20:00',
      displayTime: '05:00 PM – 08:00 PM IST',
      topic:       'Non-IID Data, Communication Efficiency & Threat Models',
      sectionId:   'day2',
      color:       '#8b5cf6',
      modules: [
        'Non-IID Data — Types, Challenges, Solutions',
        'FedProx, SCAFFOLD, FedNova Algorithms',
        'Communication Compression & Quantization',
        'Poisoning Attacks & Byzantine Robustness',
        'Model Inversion & Membership Inference',
        'Hands-on: Simulating Non-IID Partitions'
      ]
    },
    {
      day:         4,
      date:        '25 September 2026',
      isoDate:     '2026-09-25',
      startTime:   '17:00',
      endTime:     '20:00',
      displayTime: '05:00 PM – 08:00 PM IST',
      topic:       'Frameworks, Tools & Real-World Deployments',
      sectionId:   'fl-lab',
      color:       '#10b981',
      modules: [
        'TensorFlow Federated (TFF) — Architecture',
        'PySyft & OpenFL Deep Dive',
        'Flower (flwr) Framework — Client/Server API',
        'Healthcare FL: COVID-19 Imaging Case Study',
        'Autonomous Vehicles & Smart Grid Applications',
        'Hands-on: Flower FL with CIFAR-10'
      ]
    },
    {
      day:         5,
      date:        '26 September 2026',
      isoDate:     '2026-09-26',
      startTime:   '17:00',
      endTime:     '20:00',
      displayTime: '05:00 PM – 08:00 PM IST',
      topic:       'Research Frontiers, Ethics & Mini-Project Presentations',
      sectionId:   'research',
      color:       '#f59e0b',
      modules: [
        'FL + LLMs: Federated Fine-Tuning of Large Models',
        'Fairness, Accountability & Explainability in FL',
        'Research Publication Strategy & Grant Writing',
        'Mini-Project Presentations & Peer Review',
        'Industry Q&A Panel',
        'Certification & Valedictory'
      ]
    }
  ],

  /* ─────────────────────────────────────────────────────────────────────────
     QUIZ QUESTIONS  (30+ questions across 10 topic areas)
  ───────────────────────────────────────────────────────────────────────── */
  quiz: {
    totalQuestions: 35,
    passingScore:   70,
    timeLimit:      45, // minutes
    categories: [
      'FL Basics', 'FedAvg', 'Cross-Device & Cross-Silo',
      'Differential Privacy', 'Secure Aggregation',
      'Homomorphic Encryption', 'Non-IID', 'Communication Efficiency',
      'Threat Models', 'Frameworks & Tools'
    ],
    questions: [
      /* ── FL BASICS ───────────────────────────────────────────────────── */
      {
        id: 1,
        category: 'FL Basics',
        difficulty: 'easy',
        question:
          'What is the primary goal of Federated Learning?',
        options: [
          'Centralise all client data on a single powerful server',
          'Train a shared model across multiple clients without sharing raw data',
          'Compress neural networks for edge deployment',
          'Replace supervised learning with reinforcement learning'
        ],
        correct: 1,
        explanation:
          'Federated Learning trains a global model collaboratively across many clients ' +
          '(devices or organisations) while keeping the raw training data local, ' +
          'preserving data privacy.'
      },
      {
        id: 2,
        category: 'FL Basics',
        difficulty: 'easy',
        question:
          'Which entity coordinates the global model in a typical federated learning setup?',
        options: ['Edge node', 'Aggregation server (orchestrator)', 'Database cluster', 'Blockchain validator'],
        correct: 1,
        explanation:
          'A central aggregation server (orchestrator) collects model updates ' +
          '(gradients or weights) from clients and aggregates them into a new global model.'
      },
      {
        id: 3,
        category: 'FL Basics',
        difficulty: 'medium',
        question:
          'Federated Learning was originally proposed for which primary application domain?',
        options: [
          'Autonomous vehicle navigation',
          'Next-word prediction on Android keyboards',
          'Healthcare imaging diagnosis',
          'Financial fraud detection'
        ],
        correct: 1,
        explanation:
          'Google introduced Federated Learning in 2016 primarily for training ' +
          'next-word prediction models on Gboard (Android keyboard) without uploading user text.'
      },
      {
        id: 4,
        category: 'FL Basics',
        difficulty: 'medium',
        question:
          'In a federated learning round, which of the following correctly describes the order of operations?',
        options: [
          'Local training → Global model broadcast → Aggregation → Client selection',
          'Client selection → Global model broadcast → Local training → Aggregation',
          'Aggregation → Local training → Client selection → Global model broadcast',
          'Global model broadcast → Aggregation → Client selection → Local training'
        ],
        correct: 1,
        explanation:
          'Each FL round: (1) Server selects a cohort of clients, (2) broadcasts the current ' +
          'global model, (3) clients perform local training, (4) clients send updates back, ' +
          '(5) server aggregates updates into a new global model.'
      },
      {
        id: 5,
        category: 'FL Basics',
        difficulty: 'hard',
        question:
          'Which statement best captures the "statistical heterogeneity" challenge in FL?',
        options: [
          'Clients have different hardware clock speeds',
          'Client local datasets are non-IID — drawn from different underlying distributions',
          'The server cannot verify client identities',
          'Model weights have different numerical precisions on different devices'
        ],
        correct: 1,
        explanation:
          'Statistical heterogeneity (non-IID data) means each client\'s data distribution ' +
          'differs, causing locally trained models to diverge, which degrades global model ' +
          'convergence compared to IID centralised training.'
      },

      /* ── FEDAVG ──────────────────────────────────────────────────────── */
      {
        id: 6,
        category: 'FedAvg',
        difficulty: 'easy',
        question:
          'What does FedAvg aggregate from each participating client?',
        options: [
          'Raw training data samples',
          'Local model weights (or gradients) weighted by dataset size',
          'Loss values only',
          'Hyperparameter configurations'
        ],
        correct: 1,
        explanation:
          'FedAvg (McMahan et al., 2017) computes a weighted average of client model weights, ' +
          'where each client\'s contribution is proportional to its local dataset size (nₖ/n).'
      },
      {
        id: 7,
        category: 'FedAvg',
        difficulty: 'medium',
        question:
          'In the FedAvg algorithm, what does the parameter "E" control?',
        options: [
          'Number of communication rounds',
          'Number of local epochs each client trains before sending updates',
          'Fraction of clients selected per round',
          'Encryption key size for secure aggregation'
        ],
        correct: 1,
        explanation:
          '"E" is the number of local epochs. Higher E reduces communication rounds ' +
          'but can cause client drift (divergence from global optimum) on non-IID data.'
      },
      {
        id: 8,
        category: 'FedAvg',
        difficulty: 'medium',
        question:
          'What does the fraction parameter "C" represent in FedAvg?',
        options: [
          'Compression ratio for gradient quantisation',
          'The proportion of total clients selected to participate in each round',
          'The clipping norm for differential privacy',
          'The communication bandwidth cap'
        ],
        correct: 1,
        explanation:
          '"C" is the client fraction (0 < C ≤ 1). In each round, max(C·K, 1) clients are ' +
          'selected, where K is the total number of clients.'
      },
      {
        id: 9,
        category: 'FedAvg',
        difficulty: 'hard',
        question:
          'FedAvg global update formula is: w_{t+1} = Σ (nₖ/n) · wₖ. What does "nₖ" represent?',
        options: [
          'Number of local training epochs for client k',
          'Size of client k\'s local dataset',
          'Number of parameters in client k\'s model layer k',
          'Noise multiplier for client k\'s differential privacy'
        ],
        correct: 1,
        explanation:
          'nₖ is the number of training examples held by client k. ' +
          'n = Σnₖ is the total number of samples across all selected clients. ' +
          'This weighted average ensures larger clients have proportional influence.'
      },

      /* ── CROSS-DEVICE & CROSS-SILO ───────────────────────────────────── */
      {
        id: 10,
        category: 'Cross-Device & Cross-Silo',
        difficulty: 'easy',
        question:
          'Which scenario best describes Cross-Silo Federated Learning?',
        options: [
          'Millions of smartphones collaborating to train a keyboard model',
          'A handful of hospitals jointly training a disease-detection model',
          'A single GPU cluster training in data-parallel mode',
          'IoT sensors streaming data to a cloud server'
        ],
        correct: 1,
        explanation:
          'Cross-Silo FL involves a small number of large, reliable organisations ' +
          '(e.g., hospitals, banks) each holding large datasets. ' +
          'Cross-Device FL involves millions of small, unreliable edge devices.'
      },
      {
        id: 11,
        category: 'Cross-Device & Cross-Silo',
        difficulty: 'medium',
        question:
          'Which property is typical of Cross-Device FL but NOT of Cross-Silo FL?',
        options: [
          'High availability of all participants in every round',
          'Strict contractual data-sharing agreements between participants',
          'Massive scale (millions of clients) with high client dropout',
          'Full dataset visibility for audit purposes'
        ],
        correct: 2,
        explanation:
          'Cross-Device FL operates at massive scale with unreliable mobile/IoT devices ' +
          'that frequently drop out. Cross-Silo FL has fewer, more reliable institutional ' +
          'participants with contractual obligations.'
      },
      {
        id: 12,
        category: 'Cross-Device & Cross-Silo',
        difficulty: 'hard',
        question:
          'In Vertical Federated Learning, what is shared between parties?',
        options: [
          'Each party shares its entire local dataset',
          'Intermediate embeddings or encrypted activations, not raw features',
          'Each party shares only the labels',
          'Raw gradients computed on shared data'
        ],
        correct: 1,
        explanation:
          'Vertical FL handles the case where parties share the same sample IDs but different ' +
          'feature sets. They exchange encrypted intermediate representations (e.g., entity ' +
          'embeddings or split-learning activations) rather than raw features or labels.'
      },

      /* ── DIFFERENTIAL PRIVACY ────────────────────────────────────────── */
      {
        id: 13,
        category: 'Differential Privacy',
        difficulty: 'easy',
        question:
          'What does a smaller value of ε (epsilon) in Differential Privacy signify?',
        options: [
          'More noise added, stronger privacy guarantee',
          'Less noise added, weaker privacy guarantee',
          'Faster training convergence',
          'Larger model capacity'
        ],
        correct: 0,
        explanation:
          'ε controls the privacy-utility trade-off. Smaller ε means the mechanism adds ' +
          'more noise (outputs differ little between adjacent datasets), providing a ' +
          'stronger privacy guarantee at the cost of model accuracy.'
      },
      {
        id: 14,
        category: 'Differential Privacy',
        difficulty: 'medium',
        question:
          'Which noise mechanism is most commonly used in DP-SGD for federated learning?',
        options: [
          'Laplace mechanism (L1 sensitivity)',
          'Gaussian mechanism (L2 sensitivity)',
          'Exponential mechanism (utility function)',
          'Randomised response mechanism'
        ],
        correct: 1,
        explanation:
          'DP-SGD uses the Gaussian mechanism: gradients are clipped to bound L2 sensitivity, ' +
          'then Gaussian noise N(0, σ²) is added. This enables tighter privacy accounting ' +
          'via Rényi Differential Privacy (RDP).'
      },
      {
        id: 15,
        category: 'Differential Privacy',
        difficulty: 'medium',
        question:
          'What is the role of gradient clipping in DP-SGD?',
        options: [
          'To accelerate convergence by removing outlier gradients',
          'To bound the L2 sensitivity of the gradient so noise calibration is possible',
          'To compress gradients for bandwidth efficiency',
          'To prevent vanishing gradients in deep networks'
        ],
        correct: 1,
        explanation:
          'Gradient clipping bounds the maximum L2 norm of individual gradients to a clip ' +
          'threshold C. This bounds the sensitivity Δf = C, allowing the noise multiplier ' +
          'σ to be calibrated to achieve a target (ε, δ)-DP guarantee.'
      },
      {
        id: 16,
        category: 'Differential Privacy',
        difficulty: 'hard',
        question:
          'The privacy budget ε in DP composes across multiple queries. ' +
          'For k adaptive queries each with ε-DP guarantee, basic composition gives:',
        options: [
          'Total ε = ε (no change)',
          'Total ε = k · ε (linear composition)',
          'Total ε = √k · ε (Rényi composition)',
          'Total ε = log(k) · ε (advanced composition)'
        ],
        correct: 1,
        explanation:
          'Basic composition theorem: k mechanisms each (ε, 0)-DP compose to (k·ε, 0)-DP. ' +
          'Advanced composition and Rényi DP (RDP) give tighter bounds, especially important ' +
          'for the many gradient steps in FL training.'
      },

      /* ── SECURE AGGREGATION ──────────────────────────────────────────── */
      {
        id: 17,
        category: 'Secure Aggregation',
        difficulty: 'easy',
        question:
          'What is the primary security property guaranteed by Secure Aggregation?',
        options: [
          'The server can view each client\'s individual model update',
          'The server only learns the aggregate sum of client updates, not individual updates',
          'All clients must use the same local dataset',
          'The model is encrypted end-to-end during inference'
        ],
        correct: 1,
        explanation:
          'Secure Aggregation (Bonawitz et al., 2017) uses cryptographic masking (secret ' +
          'sharing + pseudo-random masks) so the server can only compute the sum of client ' +
          'updates — individual updates remain private even if the server is honest-but-curious.'
      },
      {
        id: 18,
        category: 'Secure Aggregation',
        difficulty: 'medium',
        question:
          'In the Secure Aggregation protocol, why are pairwise random masks used?',
        options: [
          'To speed up gradient computation on client devices',
          'So that masks cancel out in the aggregate while hiding individual updates',
          'To compress model weights before transmission',
          'To authenticate clients to the server'
        ],
        correct: 1,
        explanation:
          'Each pair of clients (i, j) agrees on a random mask s_{ij}. Client i adds s_{ij} ' +
          'and client j subtracts s_{ij} (or vice versa). When the server sums all updates, ' +
          'the paired masks cancel, revealing only the aggregate — not individual contributions.'
      },
      {
        id: 19,
        category: 'Secure Aggregation',
        difficulty: 'hard',
        question:
          'Secret sharing in Secure Aggregation is based on which cryptographic primitive?',
        options: [
          'RSA public-key encryption',
          'Shamir\'s Secret Sharing (t-of-n threshold scheme)',
          'SHA-256 hash commitment',
          'Zero-knowledge proofs (ZKPs)'
        ],
        correct: 1,
        explanation:
          'Shamir\'s Secret Sharing splits a secret into n shares such that any t shares ' +
          'can reconstruct it, but t-1 shares reveal nothing. FL uses it so surviving ' +
          'clients can reconstruct dropped-out clients\' mask seeds without learning the masks.'
      },

      /* ── HOMOMORPHIC ENCRYPTION ──────────────────────────────────────── */
      {
        id: 20,
        category: 'Homomorphic Encryption',
        difficulty: 'easy',
        question:
          'What unique property does Homomorphic Encryption (HE) provide?',
        options: [
          'Data is compressed losslessly before transmission',
          'Computations can be performed directly on encrypted data without decryption',
          'Model weights are hashed for integrity verification',
          'Communication is authenticated with digital signatures'
        ],
        correct: 1,
        explanation:
          'Homomorphic Encryption allows a server to compute functions (e.g., addition, ' +
          'multiplication) on ciphertexts. The decrypted result equals the function applied ' +
          'to the plaintexts — enabling aggregation without ever seeing raw updates.'
      },
      {
        id: 21,
        category: 'Homomorphic Encryption',
        difficulty: 'medium',
        question:
          'Which type of Homomorphic Encryption supports unlimited additions AND multiplications?',
        options: [
          'Partially Homomorphic Encryption (PHE)',
          'Somewhat Homomorphic Encryption (SHE)',
          'Fully Homomorphic Encryption (FHE)',
          'Levelled Homomorphic Encryption (LHE)'
        ],
        correct: 2,
        explanation:
          'Fully Homomorphic Encryption (FHE) supports arbitrary computations (both + and ×, ' +
          'unlimited depth). PHE supports only one operation (e.g., Paillier: addition). ' +
          'SHE/LHE support bounded-depth circuits. FHE is most powerful but computationally expensive.'
      },
      {
        id: 22,
        category: 'Homomorphic Encryption',
        difficulty: 'hard',
        question:
          'Why is Full Homomorphic Encryption rarely used directly in production FL systems?',
        options: [
          'FHE is incompatible with neural network activation functions',
          'FHE is computationally prohibitive — ciphertext operations are orders of magnitude slower',
          'FHE requires all clients to hold the same encryption key',
          'FHE does not support floating-point arithmetic'
        ],
        correct: 1,
        explanation:
          'FHE incurs enormous computational overhead (often 1000× or more vs. plaintext). ' +
          'Production systems typically use Partial HE (e.g., Paillier for additive ' +
          'aggregation), or combine Secure Aggregation with DP for practical privacy guarantees.'
      },

      /* ── NON-IID DATA ────────────────────────────────────────────────── */
      {
        id: 23,
        category: 'Non-IID',
        difficulty: 'easy',
        question:
          'What does "IID" stand for in the context of machine learning data?',
        options: [
          'Independently and Identically Distributed',
          'Incrementally and Iteratively Differentiated',
          'Input-Independent Data',
          'Integrated and Indexed Dataset'
        ],
        correct: 0,
        explanation:
          'IID = Independently and Identically Distributed. In IID settings, all samples ' +
          'are drawn from the same distribution. Non-IID data (heterogeneous data) is the norm ' +
          'in FL since each client generates data reflecting their own usage patterns.'
      },
      {
        id: 24,
        category: 'Non-IID',
        difficulty: 'medium',
        question:
          'Which algorithm was specifically designed to address client drift caused by non-IID data?',
        options: [
          'FedAvg', 'SGD with momentum', 'FedProx', 'AdaGrad'
        ],
        correct: 2,
        explanation:
          'FedProx (Li et al., 2020) adds a proximal term ||w - w_global||² to each client\'s ' +
          'local objective, limiting how far local models drift from the global model. ' +
          'This improves convergence on heterogeneous data compared to vanilla FedAvg.'
      },
      {
        id: 25,
        category: 'Non-IID',
        difficulty: 'hard',
        question:
          'In Dirichlet-based non-IID partitioning (parameter α), what does α → 0 produce?',
        options: [
          'Perfectly uniform (IID) data distribution across clients',
          'Extreme heterogeneity — each client holds data from only one or few classes',
          'Equal-sized but randomly shuffled client datasets',
          'No data on any client'
        ],
        correct: 1,
        explanation:
          'The Dirichlet distribution Dir(α) is widely used to simulate non-IID splits. ' +
          'As α → 0, the distribution becomes more concentrated, giving each client data ' +
          'from almost a single class (extreme heterogeneity). α → ∞ approaches IID.'
      },

      /* ── COMMUNICATION EFFICIENCY ────────────────────────────────────── */
      {
        id: 26,
        category: 'Communication Efficiency',
        difficulty: 'easy',
        question:
          'Which technique reduces the number of bits transmitted per FL round by representing ' +
          'gradients with fewer bits?',
        options: [
          'Gradient sparsification', 'Quantisation', 'Knowledge distillation', 'Batch normalisation'
        ],
        correct: 1,
        explanation:
          'Quantisation reduces bit-width of gradient values (e.g., 32-bit float → 8-bit int ' +
          'or 1-bit sign), drastically cutting communication cost with minimal accuracy loss.'
      },
      {
        id: 27,
        category: 'Communication Efficiency',
        difficulty: 'medium',
        question:
          'Top-K sparsification in FL sends only the K largest-magnitude gradients. ' +
          'What technique is used to correct the "lost" gradient information?',
        options: [
          'Momentum SGD with weight decay',
          'Error feedback (error accumulation / error correction)',
          'Batch normalisation across clients',
          'Knowledge distillation from a teacher model'
        ],
        correct: 1,
        explanation:
          'Error feedback accumulates the residual (gradient - sparse approximation) locally ' +
          'and adds it to the next round\'s gradient. This ensures no gradient information ' +
          'is permanently lost despite sparsification.'
      },
      {
        id: 28,
        category: 'Communication Efficiency',
        difficulty: 'hard',
        question:
          'SCAFFOLD (Stochastic Controlled Averaging for FL) uses control variates to correct:',
        options: [
          'Adversarial gradients from Byzantine clients',
          'Client drift caused by heterogeneous data via variance reduction',
          'Quantisation error from gradient compression',
          'Membership inference attacks on the global model'
        ],
        correct: 1,
        explanation:
          'SCAFFOLD maintains server and client control variates (cᵢ, c) that estimate the ' +
          'update direction for each client\'s local optimiser, correcting client drift ' +
          'without extra communication rounds. It achieves linear speedup even under non-IID data.'
      },

      /* ── THREAT MODELS ───────────────────────────────────────────────── */
      {
        id: 29,
        category: 'Threat Models',
        difficulty: 'easy',
        question:
          'What is a model poisoning attack in Federated Learning?',
        options: [
          'An attacker intercepts the global model during transmission',
          'A malicious client submits manipulated model updates to corrupt the global model',
          'The server deliberately reveals client data to external parties',
          'A client refuses to participate in any training round'
        ],
        correct: 1,
        explanation:
          'In model poisoning, a malicious (Byzantine) client submits carefully crafted ' +
          'gradient updates designed to degrade global model accuracy or embed a backdoor, ' +
          'without being detected by the aggregation server.'
      },
      {
        id: 30,
        category: 'Threat Models',
        difficulty: 'medium',
        question:
          'A Membership Inference Attack (MIA) on a machine learning model aims to determine:',
        options: [
          'The exact training labels used during model training',
          'Whether a specific data sample was part of the model\'s training set',
          'The architecture and hyperparameters of the target model',
          'The gradient norms of individual training samples'
        ],
        correct: 1,
        explanation:
          'MIA exploits the fact that models often behave differently on training vs. unseen ' +
          'data (overfitting). An adversary queries the model and uses output confidence ' +
          'scores to infer whether a target sample was in the training set.'
      },
      {
        id: 31,
        category: 'Threat Models',
        difficulty: 'medium',
        question:
          'Which defence mechanism provides Byzantine fault tolerance by computing the ' +
          'coordinate-wise median of client updates?',
        options: [
          'FedAvg', 'Krum', 'Coordinate-wise Median (coordinate median)', 'FedProx'
        ],
        correct: 2,
        explanation:
          'Coordinate-wise Median aggregation replaces the mean with the median for each ' +
          'model parameter. The median is statistically robust to a bounded fraction of ' +
          'Byzantine outliers, unlike the mean which can be arbitrarily skewed.'
      },
      {
        id: 32,
        category: 'Threat Models',
        difficulty: 'hard',
        question:
          'A "gradient inversion attack" (e.g., Deep Leakage from Gradients — Zhu et al.) can:',
        options: [
          'Only reconstruct labels, not input features',
          'Reconstruct original training images from shared gradients with high fidelity',
          'Only work on linear models, not deep neural networks',
          'Require direct access to the training dataset'
        ],
        correct: 1,
        explanation:
          'Zhu et al. (2019) showed that optimising a dummy input to match real gradients can ' +
          'reconstruct training images with pixel-level accuracy from gradients alone. ' +
          'This motivates secure aggregation and DP in FL, as raw gradient sharing is unsafe.'
      },

      /* ── FRAMEWORKS & TOOLS ──────────────────────────────────────────── */
      {
        id: 33,
        category: 'Frameworks & Tools',
        difficulty: 'easy',
        question:
          'Which open-source FL framework uses a client-server architecture where clients ' +
          'are defined by overriding NumPy Methods (get_parameters, fit, evaluate)?',
        options: [
          'TensorFlow Federated (TFF)',
          'Flower (flwr)',
          'PySyft',
          'IBM Federated Learning'
        ],
        correct: 1,
        explanation:
          'Flower (flwr) provides a simple NumPy-based client API: implement ' +
          'get_parameters(), fit(), and evaluate(). It is framework-agnostic, supporting ' +
          'PyTorch, TensorFlow, scikit-learn, and more.'
      },
      {
        id: 34,
        category: 'Frameworks & Tools',
        difficulty: 'medium',
        question:
          'TensorFlow Federated (TFF) is built on two primary programming abstractions: ' +
          'FC (Federated Core) and FL (Federated Learning). What does FC provide?',
        options: [
          'Pre-built FL algorithms like FedAvg ready to deploy',
          'Low-level primitives for expressing arbitrary federated computations over placed values',
          'A dashboard for monitoring FL training progress',
          'Automatic differential privacy integration'
        ],
        correct: 1,
        explanation:
          'TFF\'s Federated Core (FC) provides low-level building blocks: federated types, ' +
          'operators (federated_mean, federated_broadcast, etc.) and allows users to express ' +
          'any federated computation as a functional program. The FL layer builds on FC.'
      },
      {
        id: 35,
        category: 'Frameworks & Tools',
        difficulty: 'hard',
        question:
          'In the context of FL with differential privacy, the "privacy accountant" tracks:',
        options: [
          'The number of active clients per round',
          'Cumulative privacy loss ε across all training steps to enforce the privacy budget',
          'The total communication bandwidth consumed',
          'Client authentication tokens'
        ],
        correct: 1,
        explanation:
          'A privacy accountant (e.g., using Rényi DP or the moments accountant) accumulates ' +
          'the privacy cost ε of every gradient step. Training stops or noise is adjusted ' +
          'when the budget ε_total is exhausted, ensuring the overall (ε,δ)-DP guarantee.'
      }
    ]
  },

  /* ─────────────────────────────────────────────────────────────────────────
     RESOURCE LIBRARY (15+ entries)
  ───────────────────────────────────────────────────────────────────────── */
  resources: [
    /* ── SLIDE DECKS ─────────────────────────────────────────────────── */
    {
      id:          'slides-day1',
      type:        'slides',
      icon:        '📊',
      day:         1,
      title:       'Day 1 Slides — Foundations of AI & Distributed Learning',
      description: 'Covers AI/ML/DL hierarchy, classical vs. distributed ML, FL motivation, ' +
                   'privacy laws (GDPR, HIPAA), and FedAvg derivation.',
      tags:        ['slides', 'day1', 'foundation', 'fedavg'],
      size:        '8.2 MB',
      format:      'PDF',
      url:         'PPT/REVA_FDP_Day1_Federated_Learning.pdf',
      downloadable: true
    },
    {
      id:          'slides-day2',
      type:        'slides',
      icon:        '📊',
      day:         2,
      title:       'Day 2 Slides — FL Architectures & Privacy-Preserving AI',
      description: 'Cross-device vs. cross-silo FL, horizontal/vertical/federated transfer ' +
                   'learning, differential privacy, secure aggregation, homomorphic encryption.',
      tags:        ['slides', 'day2', 'privacy', 'architecture'],
      size:        '10.1 MB',
      format:      'PDF',
      url:         'assets/slides/day2_privacy.pdf',
      downloadable: true
    },
    /* ── LECTURE NOTES ───────────────────────────────────────────────── */
    {
      id:          'notes-fedavg',
      type:        'notes',
      icon:        '📝',
      day:         1,
      title:       'Detailed Notes — FedAvg Algorithm Derivation',
      description: 'Step-by-step mathematical derivation of the Federated Averaging algorithm ' +
                   'with convergence analysis and worked examples.',
      tags:        ['notes', 'fedavg', 'math', 'algorithm'],
      size:        '1.4 MB',
      format:      'PDF',
      url:         'assets/notes/fedavg_derivation.pdf',
      downloadable: true
    },
    {
      id:          'notes-dp',
      type:        'notes',
      icon:        '📝',
      day:         2,
      title:       'Detailed Notes — Differential Privacy in FL',
      description: 'Formal DP definitions, ε-δ privacy, Gaussian mechanism, DP-SGD, ' +
                   'privacy accounting (Rényi DP / moments accountant).',
      tags:        ['notes', 'differential-privacy', 'math'],
      size:        '2.1 MB',
      format:      'PDF',
      url:         'assets/notes/differential_privacy.pdf',
      downloadable: true
    },
    /* ── PYTHON NOTEBOOKS ────────────────────────────────────────────── */
    {
      id:          'nb-fedavg-scratch',
      type:        'notebook',
      icon:        '🐍',
      day:         1,
      title:       'Notebook 1 — FedAvg from Scratch (NumPy)',
      description: 'Implement FedAvg from scratch using NumPy. Simulates 10 clients with ' +
                   'IID/non-IID MNIST splits. Plots convergence curves.',
      tags:        ['notebook', 'fedavg', 'numpy', 'mnist', 'hands-on'],
      size:        '245 KB',
      format:      'Jupyter Notebook (.ipynb)',
      url:         'assets/notebooks/01_fedavg_scratch.ipynb',
      downloadable: true,
      colab:       'https://colab.research.google.com/drive/placeholder-nb1'
    },
    {
      id:          'nb-dp-fedavg',
      type:        'notebook',
      icon:        '🐍',
      day:         2,
      title:       'Notebook 2 — DP-FedAvg with Privacy Budget Tracking',
      description: 'Adds Gaussian noise + gradient clipping to FedAvg. Tracks cumulative ε ' +
                   'using the moments accountant. Visualises privacy-utility trade-off.',
      tags:        ['notebook', 'dp-sgd', 'privacy', 'hands-on'],
      size:        '312 KB',
      format:      'Jupyter Notebook (.ipynb)',
      url:         'assets/notebooks/02_dp_fedavg.ipynb',
      downloadable: true,
      colab:       'https://colab.research.google.com/drive/placeholder-nb2'
    },
    {
      id:          'nb-flower-cifar',
      type:        'notebook',
      icon:        '🐍',
      day:         4,
      title:       'Notebook 3 — Flower FL Framework with CIFAR-10',
      description: 'End-to-end FL pipeline using Flower (flwr). PyTorch CNN client, ' +
                   'FedAvg strategy, 5 clients, 10 rounds. Includes evaluation metrics.',
      tags:        ['notebook', 'flower', 'pytorch', 'cifar10', 'hands-on'],
      size:        '421 KB',
      format:      'Jupyter Notebook (.ipynb)',
      url:         'assets/notebooks/03_flower_cifar10.ipynb',
      downloadable: true,
      colab:       'https://colab.research.google.com/drive/placeholder-nb3'
    },
    {
      id:          'nb-noniid',
      type:        'notebook',
      icon:        '🐍',
      day:         3,
      title:       'Notebook 4 — Non-IID Data Partitioning & FedProx',
      description: 'Dirichlet(α) data partitioning, visual class distribution heatmap, ' +
                   'FedAvg vs. FedProx convergence comparison on non-IID data.',
      tags:        ['notebook', 'non-iid', 'fedprox', 'dirichlet', 'hands-on'],
      size:        '287 KB',
      format:      'Jupyter Notebook (.ipynb)',
      url:         'assets/notebooks/04_noniid_fedprox.ipynb',
      downloadable: true,
      colab:       'https://colab.research.google.com/drive/placeholder-nb4'
    },
    /* ── RESEARCH PAPERS ─────────────────────────────────────────────── */
    {
      id:          'paper-fedavg',
      type:        'paper',
      icon:        '📄',
      day:         1,
      title:       'McMahan et al. (2017) — Communication-Efficient Learning of Deep Networks ' +
                   'from Decentralized Data (FedAvg)',
      description: 'The seminal paper introducing Federated Averaging (FedAvg). ' +
                   'Foundational reading for any FL practitioner.',
      tags:        ['paper', 'fedavg', 'seminal', 'google'],
      format:      'PDF',
      url:         'https://arxiv.org/abs/1602.05629',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-dp-fl',
      type:        'paper',
      icon:        '📄',
      day:         2,
      title:       'Geyer et al. (2017) — Differentially Private Federated Learning: ' +
                   'A Client Level Perspective',
      description: 'Introduces client-level DP in FL, applying DP to the entire client update ' +
                   'rather than individual gradients. Key reference for DP-FL systems.',
      tags:        ['paper', 'differential-privacy', 'fl'],
      format:      'PDF',
      url:         'https://arxiv.org/abs/1712.07557',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-secagg',
      type:        'paper',
      icon:        '📄',
      day:         2,
      title:       'Bonawitz et al. (2017) — Practical Secure Aggregation for ' +
                   'Privacy-Preserving Machine Learning',
      description: 'Introduces the Secure Aggregation protocol used in production FL ' +
                   '(Google). Covers secret sharing, masking, and dropout handling.',
      tags:        ['paper', 'secure-aggregation', 'cryptography'],
      format:      'PDF',
      url:         'https://dl.acm.org/doi/10.1145/3133956.3133982',
      downloadable: false,
      external:    true
    },
    /* ── DATASETS ────────────────────────────────────────────────────── */
    {
      id:          'dataset-mnist',
      type:        'dataset',
      icon:        '🗄️',
      day:         1,
      title:       'MNIST — Handwritten Digit Dataset (FL partitioned)',
      description: 'Classic 70,000-image MNIST dataset pre-partitioned into IID and non-IID ' +
                   '(Dirichlet α=0.5) splits for 10 and 50 clients. Ready for FL simulation.',
      tags:        ['dataset', 'mnist', 'image', 'benchmark'],
      size:        '11 MB',
      format:      'NumPy .npz',
      url:         'assets/datasets/mnist_fl_splits.zip',
      downloadable: true
    },
    {
      id:          'dataset-cifar',
      type:        'dataset',
      icon:        '🗄️',
      day:         4,
      title:       'CIFAR-10 — FL Simulation Dataset',
      description: 'CIFAR-10 dataset pre-partitioned for federated simulation (5, 10, 20 clients), ' +
                   'with both IID and pathological non-IID (2-class-per-client) splits.',
      tags:        ['dataset', 'cifar10', 'image', 'benchmark'],
      size:        '163 MB',
      format:      'PyTorch Dataset',
      url:         'assets/datasets/cifar10_fl_splits.zip',
      downloadable: true
    },
    /* ── TOOLS & FRAMEWORKS ──────────────────────────────────────────── */
    {
      id:          'tool-flower',
      type:        'tool',
      icon:        '🔧',
      day:         4,
      title:       'Flower (flwr) — Federated Learning Framework',
      description: 'Open-source, framework-agnostic FL framework. Simple client API, ' +
                   'built-in strategies (FedAvg, FedProx, FedOpt), simulation engine.',
      tags:        ['tool', 'framework', 'flower', 'python'],
      format:      'Python Package',
      url:         'https://flower.dev',
      downloadable: false,
      external:    true,
      install:     'pip install flwr'
    },
    {
      id:          'tool-tff',
      type:        'tool',
      icon:        '🔧',
      day:         4,
      title:       'TensorFlow Federated (TFF)',
      description: 'Google\'s open-source FL framework built on TensorFlow. ' +
                   'Provides FC (low-level) and FL (high-level) APIs with built-in DP support.',
      tags:        ['tool', 'framework', 'tensorflow', 'google'],
      format:      'Python Package',
      url:         'https://www.tensorflow.org/federated',
      downloadable: false,
      external:    true,
      install:     'pip install tensorflow-federated'
    },
    {
      id:          'tool-opacus',
      type:        'tool',
      icon:        '🔧',
      day:         2,
      title:       'Opacus — Differential Privacy for PyTorch',
      description: 'Meta\'s library for training PyTorch models with differential privacy. ' +
                   'Provides DP-SGD, per-sample gradient clipping, and privacy accounting.',
      tags:        ['tool', 'differential-privacy', 'pytorch', 'opacus'],
      format:      'Python Package',
      url:         'https://opacus.ai',
      downloadable: false,
      external:    true,
      install:     'pip install opacus'
    },
    {
      id:          'tool-pysyft',
      type:        'tool',
      icon:        '🔧',
      day:         4,
      title:       'PySyft — Encrypted, Privacy-Preserving ML',
      description: 'OpenMined\'s Python library for remote data science. Supports FL, ' +
                   'SMPC, HE, and DP. Integrates with PyTorch and TensorFlow.',
      tags:        ['tool', 'pysyft', 'smpc', 'homomorphic-encryption'],
      format:      'Python Package',
      url:         'https://github.com/OpenMined/PySyft',
      downloadable: false,
      external:    true,
      install:     'pip install syft'
    },
    {
      id:          'tool-openfl',
      type:        'tool',
      icon:        '🔧',
      day:         4,
      title:       'OpenFL (Intel) — Open Federated Learning',
      description: 'Intel\'s open-source cross-silo FL framework with built-in SGX hardware security, ' +
                   'plan-based workflows, and support for PyTorch and TensorFlow.',
      tags:        ['tool', 'openfl', 'intel', 'enterprise', 'cross-silo'],
      format:      'Python Package',
      url:         'https://openfl.readthedocs.io/en/latest/',
      downloadable: false,
      external:    true,
      install:     'pip install openfl'
    },
    {
      id:          'tool-nvflare',
      type:        'tool',
      icon:        '🔧',
      day:         4,
      title:       'NVIDIA FLARE — Federated Learning Application Runtime Environment',
      description: 'NVIDIA\'s production-grade FL framework optimised for healthcare and life sciences. ' +
                   'Integrates with Clara medical imaging pipelines and RAPIDS for GPU-accelerated FL.',
      tags:        ['tool', 'nvidia', 'flare', 'healthcare', 'gpu'],
      format:      'Python Package',
      url:         'https://developer.nvidia.com/flare',
      downloadable: false,
      external:    true,
      install:     'pip install nvflare'
    },

    /* ── RESEARCH PAPERS (Real, Live Links) ──────────────────────────────── */
    {
      id:          'paper-fl-original',
      type:        'paper',
      icon:        '📄',
      day:         1,
      title:       'McMahan et al. (2017) — Communication-Efficient Learning of Deep Networks from Decentralized Data (FedAvg)',
      description: 'The seminal FedAvg paper. Introduces Federated Averaging and benchmarks it on ' +
                   'MNIST and Shakespeare datasets with 100+ clients. ' +
                   'Foundational reading for any FL researcher or practitioner.',
      tags:        ['paper', 'fedavg', 'seminal', 'google', 'day1'],
      format:      'PDF — arXiv:1602.05629',
      url:         'https://arxiv.org/abs/1602.05629',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-dp-fl-geyer',
      type:        'paper',
      icon:        '📄',
      day:         2,
      title:       'Geyer et al. (2017) — Differentially Private Federated Learning: A Client Level Perspective',
      description: 'Introduces client-level differential privacy in FL. Applies DP to the entire ' +
                   'client update instead of individual gradients, improving practical privacy guarantees.',
      tags:        ['paper', 'differential-privacy', 'fl', 'day2'],
      format:      'PDF — arXiv:1712.07557',
      url:         'https://arxiv.org/abs/1712.07557',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-secagg-bonawitz',
      type:        'paper',
      icon:        '📄',
      day:         2,
      title:       'Bonawitz et al. (2017) — Practical Secure Aggregation for Privacy-Preserving Machine Learning',
      description: 'Introduces the Secure Aggregation protocol used in Google\'s production FL. ' +
                   'Covers Shamir secret sharing, pairwise masking, and dropout-tolerant design.',
      tags:        ['paper', 'secure-aggregation', 'cryptography', 'google', 'day2'],
      format:      'PDF — ACM CCS 2017',
      url:         'https://dl.acm.org/doi/10.1145/3133956.3133982',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-fedprox',
      type:        'paper',
      icon:        '📄',
      day:         3,
      title:       'Li et al. (2020) — Federated Optimization in Heterogeneous Networks (FedProx)',
      description: 'Introduces FedProx: adds a proximal regularisation term to bound client drift ' +
                   'under non-IID data and partial participation. Convergence guarantees for heterogeneous FL.',
      tags:        ['paper', 'fedprox', 'non-iid', 'convergence', 'day3'],
      format:      'PDF — MLSys 2020',
      url:         'https://arxiv.org/abs/1812.06127',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-scaffold',
      type:        'paper',
      icon:        '📄',
      day:         3,
      title:       'Karimireddy et al. (2020) — SCAFFOLD: Stochastic Controlled Averaging for Federated Learning',
      description: 'SCAFFOLD uses server and client control variates to correct client drift, ' +
                   'achieving linear speedup even under heterogeneous data distributions.',
      tags:        ['paper', 'scaffold', 'non-iid', 'variance-reduction', 'day3'],
      format:      'PDF — ICML 2020',
      url:         'https://arxiv.org/abs/1910.06378',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-gradient-leakage',
      type:        'paper',
      icon:        '📄',
      day:         3,
      title:       'Zhu et al. (2019) — Deep Leakage from Gradients',
      description: 'Demonstrates that private training data (including high-res images and text) can be ' +
                   'reconstructed pixel-by-pixel from gradients alone. Motivates Secure Aggregation + DP.',
      tags:        ['paper', 'privacy', 'attack', 'gradient-leakage', 'threat-model'],
      format:      'PDF — NeurIPS 2019',
      url:         'https://arxiv.org/abs/1906.08935',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-fl-at-scale',
      type:        'paper',
      icon:        '📄',
      day:         4,
      title:       'Bonawitz et al. (2019) — Towards Federated Learning at Scale: A System Design',
      description: 'Google\'s production FL system paper. Covers the real-world challenges of deploying ' +
                   'FL to millions of Android devices: device selection, system efficiency, and FL lifecycle.',
      tags:        ['paper', 'production', 'system-design', 'google', 'cross-device'],
      format:      'PDF — MLSys 2019',
      url:         'https://arxiv.org/abs/1902.01046',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-personalized-fl',
      type:        'paper',
      icon:        '📄',
      day:         5,
      title:       'Fallah et al. (2020) — Personalized Federated Learning with Theoretical Guarantees (pFedMe / Per-FedAvg)',
      description: 'Applies MAML-style meta-learning to FL for personalization. Each client learns ' +
                   'a global initialization that can be rapidly adapted to local data distributions.',
      tags:        ['paper', 'personalization', 'meta-learning', 'federated', 'day5'],
      format:      'PDF — NeurIPS 2020',
      url:         'https://arxiv.org/abs/2002.07948',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-fl-llm',
      type:        'paper',
      icon:        '📄',
      day:         5,
      title:       'Ye et al. (2024) — OpenFedLLM: Training Large Language Models on Decentralized Private Data via Federated Learning',
      description: 'Explores federated fine-tuning of LLMs (e.g., LLaMA, Mistral) across private institutional ' +
                   'datasets. Combines LoRA adapters with FedAvg for efficient LLM federation.',
      tags:        ['paper', 'llm', 'large-language-models', 'federated', 'fine-tuning', 'day5'],
      format:      'PDF — arXiv:2402.06954',
      url:         'https://arxiv.org/abs/2402.06954',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-ditto',
      type:        'paper',
      icon:        '📄',
      day:         3,
      title:       'Li et al. (2021) — Ditto: Fair and Robust Federated Learning Through Personalization',
      description: 'Ditto jointly trains a global FL model and a personalised local model per client. ' +
                   'Improves fairness across heterogeneous clients while remaining robust to Byzantine attacks.',
      tags:        ['paper', 'ditto', 'personalization', 'fairness', 'robustness'],
      format:      'PDF — ICML 2021',
      url:         'https://arxiv.org/abs/2012.04235',
      downloadable: false,
      external:    true
    },
    {
      id:          'paper-fl-healthcare',
      type:        'paper',
      icon:        '📄',
      day:         4,
      title:       'Rieke et al. (2020) — The Future of Digital Health with Federated Learning',
      description: 'Surveys FL in healthcare: brain tumour segmentation (FeTS), COVID-19 imaging, ' +
                   'patient risk stratification. Addresses regulatory compliance (GDPR, HIPAA) in medical FL.',
      tags:        ['paper', 'healthcare', 'medical-imaging', 'survey', 'gdpr'],
      format:      'PDF — npj Digital Medicine 2020',
      url:         'https://www.nature.com/articles/s41746-020-00323-1',
      downloadable: false,
      external:    true
    }
  ],

  /* ─────────────────────────────────────────────────────────────────────────
     PYTHON CODE SNIPPETS (used by Python Lab section)
  ───────────────────────────────────────────────────────────────────────── */
  codeSnippets: {
    fedavg_basic: `import numpy as np

def federated_averaging(global_weights, client_updates, client_sizes):
    """
    FedAvg: weighted average of client model weights.

    Args:
        global_weights (list of np.ndarray): current global model weights
        client_updates (list of list of np.ndarray): list of client weight updates
        client_sizes (list of int): number of samples on each client

    Returns:
        list of np.ndarray: new aggregated global weights
    """
    total_samples = sum(client_sizes)
    new_weights = [np.zeros_like(w) for w in global_weights]

    for client_idx, (weights, n_k) in enumerate(zip(client_updates, client_sizes)):
        fraction = n_k / total_samples
        for layer_idx, layer_weights in enumerate(weights):
            new_weights[layer_idx] += fraction * layer_weights

    return new_weights

# Example: 3 clients with different dataset sizes
client_sizes = [500, 300, 200]  # n_k for each client
# Simulate 2 weight matrices (layer 1: 10x5, layer 2: 5x2)
client_updates = [
    [np.random.randn(10, 5), np.random.randn(5, 2)] for _ in range(3)
]
global_weights = [np.zeros((10, 5)), np.zeros((5, 2))]

aggregated = federated_averaging(global_weights, client_updates, client_sizes)
print("Aggregated layer 1 shape:", aggregated[0].shape)
print("FedAvg complete for round 1.")`,

    dp_gaussian: `import numpy as np

def dp_clip_and_noise(gradient, clip_norm: float, noise_multiplier: float, seed=None):
    """
    DP-SGD: clip gradient and add calibrated Gaussian noise.

    Args:
        gradient (np.ndarray): raw gradient from one sample
        clip_norm (float): L2 clipping threshold C
        noise_multiplier (float): σ (noise scale relative to clip_norm)
        seed (int, optional): random seed for reproducibility

    Returns:
        np.ndarray: noised gradient with (ε, δ)-DP guarantee
    """
    rng = np.random.default_rng(seed)

    # Step 1: Clip gradient to bound L2 sensitivity
    l2_norm = np.linalg.norm(gradient)
    if l2_norm > clip_norm:
        gradient = gradient * (clip_norm / l2_norm)

    # Step 2: Add Gaussian noise calibrated to σ = noise_multiplier * clip_norm
    noise_std = noise_multiplier * clip_norm
    noise = rng.normal(0, noise_std, size=gradient.shape)
    dp_gradient = gradient + noise

    return dp_gradient

# Demo
grad = np.array([3.0, 4.0])  # L2 norm = 5.0
clipped = dp_clip_and_noise(grad, clip_norm=1.0, noise_multiplier=1.1, seed=42)
print("Original gradient:", grad)
print("DP gradient:", clipped)
print("L2 norm after clip+noise:", np.linalg.norm(clipped))`,

    flower_client: `import flwr as fl
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from collections import OrderedDict
from typing import List, Tuple
import numpy as np

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 10)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = x.view(-1, 784)
        return self.fc2(self.relu(self.fc1(x)))

class FLClient(fl.client.NumPyClient):
    """Flower FL client wrapping a PyTorch model."""

    def __init__(self, model, train_loader, val_loader):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
        self.criterion = nn.CrossEntropyLoss()

    def get_parameters(self, config) -> List[np.ndarray]:
        """Return current model weights as list of NumPy arrays."""
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters: List[np.ndarray]):
        """Load global model weights into local model."""
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = OrderedDict({k: torch.tensor(v) for k, v in params_dict})
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config) -> Tuple[List[np.ndarray], int, dict]:
        """Train locally for config['local_epochs'] epochs."""
        self.set_parameters(parameters)
        local_epochs = config.get('local_epochs', 1)

        self.model.train()
        for epoch in range(local_epochs):
            for images, labels in self.train_loader:
                self.optimizer.zero_grad()
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
                loss.backward()
                self.optimizer.step()

        return self.get_parameters(config), len(self.train_loader.dataset), {}

    def evaluate(self, parameters, config) -> Tuple[float, int, dict]:
        """Evaluate global model on local validation set."""
        self.set_parameters(parameters)
        self.model.eval()
        loss, correct = 0.0, 0

        with torch.no_grad():
            for images, labels in self.val_loader:
                outputs = self.model(images)
                loss += self.criterion(outputs, labels).item()
                correct += (outputs.argmax(1) == labels).sum().item()

        accuracy = correct / len(self.val_loader.dataset)
        return loss / len(self.val_loader), len(self.val_loader.dataset), {"accuracy": accuracy}

# Start client (connect to server at localhost:8080)
# fl.client.start_numpy_client(server_address="localhost:8080", client=FLClient(...))`
  },

  /* ─────────────────────────────────────────────────────────────────────────
     FL SIMULATOR CONFIGURATION
  ───────────────────────────────────────────────────────────────────────── */
  flSimulator: {
    defaultClients:    5,
    maxClients:        20,
    defaultRounds:     10,
    maxRounds:         50,
    defaultEpochs:     2,
    maxEpochs:         10,
    defaultFraction:   0.8,
    defaultLearningRate: 0.01,
    defaultDataset:    'mnist',
    defaultStrategy:   'fedavg',
    strategies: ['FedAvg', 'FedProx', 'FedNova', 'SCAFFOLD'],
    datasets:   ['MNIST', 'CIFAR-10', 'Fashion-MNIST'],
    // Simulated accuracy curves (used by JS simulator when no real training)
    simulatedAccuracy: {
      iid:    [0.12, 0.41, 0.62, 0.73, 0.81, 0.86, 0.89, 0.91, 0.93, 0.94],
      noniid: [0.10, 0.31, 0.48, 0.59, 0.67, 0.73, 0.77, 0.80, 0.82, 0.84]
    }
  },

  /* ─────────────────────────────────────────────────────────────────────────
     NAVIGATION STRUCTURE
  ───────────────────────────────────────────────────────────────────────── */
  navigation: [
    { id: 'home',         label: 'Home',              icon: '🏠', section: 'Programme Overview' },
    { id: 'dashboard',    label: 'Dashboard',          icon: '📊', section: 'Programme Overview' },
    { id: 'day1',         label: 'Day 1 — Foundations', icon: '📘', section: 'Sessions' },
    { id: 'day2',         label: 'Day 2 — FL & Privacy', icon: '🔐', section: 'Sessions' },
    { id: 'fl-lab',       label: 'FL Interactive Lab',  icon: '🧪', section: 'Hands-on Labs' },
    { id: 'python-lab',   label: 'Python Lab',          icon: '🐍', section: 'Hands-on Labs' },
    { id: 'experiments',  label: 'Experiments',         icon: '⚗️',  section: 'Hands-on Labs' },
    { id: 'mini-projects',label: 'Mini Projects',       icon: '💡', section: 'Projects' },
    { id: 'quiz',         label: 'Knowledge Quiz',      icon: '🎯', section: 'Assessment' },
    { id: 'research',     label: 'Research Frontiers',  icon: '🔬', section: 'Advanced' },
    { id: 'resources',    label: 'Resource Library',    icon: '📚', section: 'Resources' },
    { id: 'feedback',     label: 'Feedback',            icon: '💬', section: 'Resources' }
  ]

}; // end window.FDP_CONFIG

/* ─────────────────────────────────────────────────────────────────────────
   Config freeze — prevent accidental mutation
───────────────────────────────────────────────────────────────────────── */
Object.freeze(window.FDP_CONFIG.fdp);
Object.freeze(window.FDP_CONFIG.resourcePerson);

console.info(
  `%c[FDP CONFIG] Loaded — ${window.FDP_CONFIG.fdp.title}`,
  'color: #3b82f6; font-weight: bold;'
);
