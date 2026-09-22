// =============================================================================
// REVA University FDP Portal — code-lab.js
// Python code viewer with syntax highlighting, copy, and download
// All 8 Python demonstration scripts included
// =============================================================================

'use strict';

const PYTHON_CODE = {
  centralized_baseline: {
    title: '01 — Centralized Learning Baseline',
    steps: [
      { label: 'Step 1: Dataset Generation', lines: [1, 40] },
      { label: 'Step 2: Model Training', lines: [41, 80] },
      { label: 'Step 3: Evaluation', lines: [81, 120] },
      { label: 'Step 4: Visualization', lines: [121, 180] }
    ],
    descriptions: [
      'Generate a synthetic multi-class classification dataset. In centralized learning, ALL data is collected on a single server.',
      'Train a logistic regression model on the complete centralized dataset. No privacy constraints — server has full data access.',
      'Evaluate model performance: accuracy, classification report, confusion matrix.',
      'Visualize: learning curve, confusion matrix, and performance metrics.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# Resource Person: Prof. (Dr.) Anjit Raja R
# =============================================================================
# File: 01_centralized_baseline.py
# Topic: Centralized Machine Learning Baseline
# Description: Standard centralized training for comparison with FL
# =============================================================================

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, learning_curve
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

print("=" * 60)
print("CENTRALIZED LEARNING BASELINE")
print("Purpose: Compare with Federated Learning")
print("=" * 60)

# ===== STEP 1: GENERATE DATASET =====
# In centralized learning, all data is collected on one server
X, y = make_classification(
    n_samples=1500, n_features=20, n_informative=10,
    n_classes=3, n_clusters_per_class=1, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Total samples: {len(X)}")
print(f"Training: {len(X_train)}, Test: {len(X_test)}")
print(f"Features: {X.shape[1]}, Classes: {len(np.unique(y))}")
print(f"Class distribution: {dict(zip(*np.unique(y, return_counts=True)))}")

# ===== STEP 2: CENTRALIZED MODEL TRAINING =====
print("\\nTraining centralized model on FULL dataset...")
print("NOTE: In real scenarios, this means all data is sent to server")
print("      (Privacy concern: hospital data, financial records, etc.)")

model = LogisticRegression(max_iter=1000, solver='lbfgs', multi_class='auto', random_state=42)
model.fit(X_train, y_train)

# Simulate training curve by varying training set size
train_sizes_pct = [0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0]
train_scores, test_scores = [], []

for frac in train_sizes_pct:
    n = max(10, int(len(X_train) * frac))
    m = LogisticRegression(max_iter=500, solver='lbfgs', multi_class='auto', random_state=42)
    m.fit(X_train[:n], y_train[:n])
    train_scores.append(accuracy_score(y_train[:n], m.predict(X_train[:n])))
    test_scores.append(accuracy_score(y_test, m.predict(X_test)))
    print(f"  Training size {n:5d} | Train Acc: {train_scores[-1]:.4f} | Test Acc: {test_scores[-1]:.4f}")

# ===== STEP 3: FULL EVALUATION =====
y_pred = model.predict(X_test)
final_acc = accuracy_score(y_test, y_pred)
print(f"\\nFINAL CENTRALIZED MODEL ACCURACY: {final_acc:.4f} ({final_acc*100:.2f}%)")
print("\\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Class A','Class B','Class C']))

# ===== STEP 4: VISUALIZATION =====
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
fig.suptitle('Centralized Learning Baseline\\nREVA University FDP 2026', fontsize=13, fontweight='bold')

# Learning curve
axes[0].plot([int(f*len(X_train)) for f in train_sizes_pct], train_scores, 'b-o', label='Train Acc')
axes[0].plot([int(f*len(X_train)) for f in train_sizes_pct], test_scores,  'r-s', label='Test Acc')
axes[0].set_xlabel('Training Set Size'); axes[0].set_ylabel('Accuracy')
axes[0].set_title('Learning Curve (Centralized)'); axes[0].legend(); axes[0].grid(alpha=0.3)

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
im = axes[1].imshow(cm, cmap='Blues')
axes[1].set_xticks([0,1,2]); axes[1].set_yticks([0,1,2])
axes[1].set_xticklabels(['Class A','Class B','Class C']); axes[1].set_yticklabels(['Class A','Class B','Class C'])
for i in range(3):
    for j in range(3):
        axes[1].text(j, i, str(cm[i,j]), ha='center', va='center', color='white' if cm[i,j]>cm.max()/2 else 'black', fontweight='bold')
axes[1].set_title('Confusion Matrix'); axes[1].set_xlabel('Predicted'); axes[1].set_ylabel('Actual')
plt.colorbar(im, ax=axes[1])

plt.tight_layout()
plt.savefig('centralized_baseline.png', dpi=150, bbox_inches='tight')
plt.show()
print("Plot saved as 'centralized_baseline.png'")
`
  },

  fedavg_simulation: {
    title: '02 — FedAvg Simulation from Scratch',
    steps: [
      { label: 'Step 1: Dataset & Imports', lines: [1, 40] },
      { label: 'Step 2: Create FL Clients', lines: [41, 80] },
      { label: 'Step 3: FedAvg Aggregation', lines: [81, 110] },
      { label: 'Step 4: FL Training Loop', lines: [111, 150] },
      { label: 'Step 5: Evaluate & Plot', lines: [151, 200] }
    ],
    descriptions: [
      'We import numpy and scikit-learn. We generate a synthetic classification dataset and split it among clients. Each client will train locally on their own partition.',
      'Each FL client is an object holding a local dataset partition and a LogisticRegression model. The client can train locally and return updated model parameters.',
      'FedAvg aggregates client models by computing the weighted average of their coefficients, weighting by each client\'s dataset size.',
      'The FL training loop runs for N rounds: distribute global model → local training → collect updates → aggregate → update global model.',
      'After training, we evaluate the global model on the test set and plot the accuracy curve over rounds compared to centralized baseline.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026 | Resource Person: Prof. (Dr.) Anjit Raja R
# =============================================================================
# File: 02_fedavg_simulation.py
# Topic: Federated Averaging (FedAvg) from Scratch
# =============================================================================

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from copy import deepcopy

np.random.seed(42)

print("=" * 60)
print("FEDERATED AVERAGING (FedAvg) SIMULATION")
print("=" * 60)

# Generate synthetic dataset
X, y = make_classification(
    n_samples=2000, n_features=20, n_classes=3,
    n_informative=10, random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

NUM_CLIENTS = 5
NUM_ROUNDS  = 15
LOCAL_EPOCHS = 5

def split_data_iid(X, y, num_clients):
    n = len(X)
    indices = np.random.permutation(n)
    chunk = n // num_clients
    clients = []
    for i in range(num_clients):
        start = i * chunk
        end = start + chunk if i < num_clients - 1 else n
        idx = indices[start:end]
        clients.append({'X': X[idx], 'y': y[idx], 'n': len(idx)})
    return clients

clients = split_data_iid(X_train, y_train, NUM_CLIENTS)

def fed_avg(global_model, client_models, client_sizes):
    total = sum(client_sizes)
    avg_coef = np.zeros_like(global_model.coef_)
    avg_intercept = np.zeros_like(global_model.intercept_)
    for model, size in zip(client_models, client_sizes):
        weight = size / total
        avg_coef      += weight * model.coef_
        avg_intercept += weight * model.intercept_
    global_model.coef_      = avg_coef
    global_model.intercept_ = avg_intercept
    return global_model

def local_train(client_data, global_model, epochs):
    local_model = LogisticRegression(
        max_iter=epochs * 50, solver='lbfgs', multi_class='auto',
        warm_start=True, random_state=42
    )
    try:
        local_model.classes_  = global_model.classes_
        local_model.coef_     = global_model.coef_.copy()
        local_model.intercept_= global_model.intercept_.copy()
    except AttributeError:
        pass
    local_model.fit(client_data['X'], client_data['y'])
    acc = accuracy_score(client_data['y'], local_model.predict(client_data['X']))
    return local_model, acc

global_model = LogisticRegression(max_iter=1000, solver='lbfgs', multi_class='auto', random_state=42)
global_model.fit(X_train[:100], y_train[:100])

fl_global_accuracies = []
for round_num in range(1, NUM_ROUNDS + 1):
    trained_models, sizes = [], []
    for client in clients:
        model, local_acc = local_train(client, global_model, LOCAL_EPOCHS)
        trained_models.append(model)
        sizes.append(client['n'])
    global_model = fed_avg(global_model, trained_models, sizes)
    global_acc = accuracy_score(y_test, global_model.predict(X_test))
    fl_global_accuracies.append(global_acc)
    print(f"Round {round_num:2d} | Global Accuracy: {global_acc:.4f}")

plt.figure(figsize=(8, 4))
plt.plot(range(1, NUM_ROUNDS+1), fl_global_accuracies, 'b-o', label='FedAvg Global Model')
plt.xlabel('Round'); plt.ylabel('Accuracy'); plt.title('FedAvg Convergence')
plt.legend(); plt.grid(True, alpha=0.3); plt.show()
`
  },

  iid_noniid_comparison: {
    title: '03 — IID vs Non-IID Data Distribution',
    steps: [
      { label: 'Step 1: IID Data Split', lines: [1, 45] },
      { label: 'Step 2: Non-IID Data Split', lines: [46, 85] },
      { label: 'Step 3: Training on Splits', lines: [86, 130] },
      { label: 'Step 4: Compare Convergence', lines: [131, 180] }
    ],
    descriptions: [
      'IID (Independent and Identically Distributed): Each client receives a random, balanced sample of the dataset.',
      'Non-IID: Each client receives data biased toward 1-2 classes, simulating real-world heterogeneous data.',
      'Run FedAvg across both splits for multiple communication rounds.',
      'Observe how Non-IID data causes client drift and slows convergence rate.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# File: 03_iid_vs_noniid.py
# Topic: IID vs Non-IID Data Distribution in FL
# =============================================================================

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

np.random.seed(42)
NUM_CLIENTS = 5
NUM_ROUNDS  = 15

X, y = make_classification(n_samples=2000, n_features=15, n_classes=4,
                            n_informative=8, n_clusters_per_class=1, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
CLASSES = np.unique(y)

# IID split
def iid_split(X, y, n_clients):
    idx = np.random.permutation(len(X))
    chunk = len(X) // n_clients
    return [{'X': X[idx[i*chunk:(i+1)*chunk]], 'y': y[idx[i*chunk:(i+1)*chunk]]} for i in range(n_clients)]

# Non-IID split (sorted by label)
def noniid_split(X, y, n_clients):
    sorted_idx = np.argsort(y)
    X_sorted, y_sorted = X[sorted_idx], y[sorted_idx]
    chunk = len(X_sorted) // n_clients
    return [{'X': X_sorted[i*chunk:(i+1)*chunk], 'y': y_sorted[i*chunk:(i+1)*chunk]} for i in range(n_clients)]

iid_clients    = iid_split(X_train, y_train, NUM_CLIENTS)
noniid_clients = noniid_split(X_train, y_train, NUM_CLIENTS)

def run_fedavg(clients, n_rounds):
    global_model = LogisticRegression(max_iter=500, solver='lbfgs', multi_class='auto', random_state=42)
    all_X = np.concatenate([c['X'] for c in clients])
    all_y = np.concatenate([c['y'] for c in clients])
    global_model.fit(all_X[:50], all_y[:50])
    accs = []
    for r in range(1, n_rounds+1):
        models, sizes = [], []
        for c in clients:
            lm = LogisticRegression(max_iter=200, solver='lbfgs', multi_class='auto', random_state=42)
            lm.fit(c['X'], c['y'])
            models.append(lm); sizes.append(len(c['X']))
        total = sum(sizes)
        global_model.coef_ = sum(m.coef_ * (s/total) for m, s in zip(models, sizes))
        global_model.intercept_ = sum(m.intercept_ * (s/total) for m, s in zip(models, sizes))
        acc = accuracy_score(y_test, global_model.predict(X_test))
        accs.append(acc)
    return accs

iid_accs = run_fedavg(iid_clients, NUM_ROUNDS)
noniid_accs = run_fedavg(noniid_clients, NUM_ROUNDS)

plt.figure(figsize=(8, 4))
plt.plot(range(1, NUM_ROUNDS+1), iid_accs, 'b-o', label='IID (Balanced)')
plt.plot(range(1, NUM_ROUNDS+1), noniid_accs, 'r-s', label='Non-IID (Skewed)')
plt.xlabel('Round'); plt.ylabel('Accuracy'); plt.title('IID vs Non-IID Convergence'); plt.legend(); plt.grid(True)
plt.show()
`
  },

  differential_privacy: {
    title: '04 — Differential Privacy Demonstration',
    steps: [
      { label: 'Step 1: DP Gaussian Mechanism', lines: [1, 50] },
      { label: 'Step 2: Noise Calibration', lines: [51, 90] },
      { label: 'Step 3: Training with DP', lines: [91, 140] },
      { label: 'Step 4: Privacy-Utility Curve', lines: [141, 190] }
    ],
    descriptions: [
      'The Gaussian mechanism adds calibrated noise: sigma = sqrt(2*ln(1.25/delta)) * sensitivity / epsilon.',
      'Smaller epsilon provides stronger privacy guarantees at the expense of higher noise variance.',
      'We inject DP noise into local model parameters before federated aggregation.',
      'Plotting accuracy across epsilon values demonstrates the fundamental privacy-utility trade-off.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# File: 04_differential_privacy.py
# Topic: Differential Privacy in Federated Learning
# =============================================================================

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

np.random.seed(42)

def gaussian_mechanism(gradient, epsilon, delta=1e-5, sensitivity=1.0):
    sigma = np.sqrt(2 * np.log(1.25 / delta)) * sensitivity / epsilon
    noise = np.random.normal(0, sigma, gradient.shape)
    return gradient + noise

X, y = make_classification(n_samples=1500, n_features=15, n_classes=3, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

epsilons = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
accuracies = []

for eps in epsilons:
    model = LogisticRegression(max_iter=300, solver='lbfgs', multi_class='auto', random_state=42)
    model.fit(X_train, y_train)
    noisy_coef = gaussian_mechanism(model.coef_, eps)
    model.coef_ = noisy_coef
    acc = accuracy_score(y_test, model.predict(X_test))
    accuracies.append(acc)
    print(f"Epsilon: {eps:>5.1f} | Accuracy: {acc:.4f}")

plt.figure(figsize=(8, 4))
plt.plot(epsilons, accuracies, 'b-o')
plt.xscale('log'); plt.xlabel('Privacy Budget (Epsilon)'); plt.ylabel('Accuracy')
plt.title('Privacy-Utility Tradeoff in FL'); plt.grid(True)
plt.show()
`
  },

  secure_aggregation_demo: {
    title: '05 — Secure Aggregation Toy Demo',
    steps: [
      { label: 'Step 1: Concept & Setup', lines: [1, 45] },
      { label: 'Step 2: Pairwise Masking', lines: [46, 95] },
      { label: 'Step 3: Aggregation & Cancellation', lines: [96, 140] },
      { label: 'Step 4: Secret Sharing Demo', lines: [141, 185] }
    ],
    descriptions: [
      'Problem: A curious server can invert gradients to leak raw training samples. Solution: SecAgg masks updates before sending.',
      'Clients establish pairwise masks that cancel in pairs: mask_ij = -mask_ji.',
      'Server sums the masked updates: sum(g_i + mask_i) = sum(g_i) + 0.',
      'Additive secret sharing splits vectors into random shares that sum to the secret.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# File: 05_secure_aggregation_demo.py
# Topic: Secure Aggregation Educational Toy Demonstration
# =============================================================================

import numpy as np

np.random.seed(42)

# 3 clients with private 5-parameter gradients
true_gradients = {
    'Client_1': np.array([1.5, -0.8,  2.3,  0.4, -1.1]),
    'Client_2': np.array([0.7,  1.2, -0.5,  1.8,  0.3]),
    'Client_3': np.array([-0.3, 0.5,  1.1, -0.7,  0.9]),
}

true_sum = sum(true_gradients.values())
print("True Sum of Gradients (Target):", true_sum)

# Generate pairwise masks
masks = {
    (0, 1): np.random.normal(0, 5.0, 5),
    (0, 2): np.random.normal(0, 5.0, 5),
    (1, 2): np.random.normal(0, 5.0, 5),
}

# Apply masks
masked_1 = true_gradients['Client_1'] + masks[(0, 1)] + masks[(0, 2)]
masked_2 = true_gradients['Client_2'] - masks[(0, 1)] + masks[(1, 2)]
masked_3 = true_gradients['Client_3'] - masks[(0, 2)] - masks[(1, 2)]

print("\\nWhat Server Receives (Masked - Looks Like Noise):")
print("  From Client 1:", np.round(masked_1, 2))
print("  From Client 2:", np.round(masked_2, 2))
print("  From Client 3:", np.round(masked_3, 2))

server_sum = masked_1 + masked_2 + masked_3
print("\\nServer Sum of Masked Updates:", server_sum)
print("Matches True Sum Exactly?", np.allclose(true_sum, server_sum))
`
  },

  communication_compression: {
    title: '06 — Communication-Efficient FL',
    steps: [
      { label: 'Step 1: Top-K Sparsification', lines: [1, 45] },
      { label: 'Step 2: Quantization', lines: [46, 90] },
      { label: 'Step 3: Compression Comparison', lines: [91, 140] },
      { label: 'Step 4: Cumulative Savings', lines: [141, 190] }
    ],
    descriptions: [
      'Top-K sparsification retains only the top K% gradient components by magnitude, zeroing the rest.',
      'Quantization converts 32-bit floats to 8-bit or 4-bit integers with a scaling factor.',
      'Evaluating reconstruction Mean Squared Error against compression ratio.',
      'Calculating total gigabytes saved across 100 clients over 50 communication rounds.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# File: 06_communication_compression.py
# Topic: Communication-Efficient Federated Learning
# =============================================================================

import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)
N_PARAMS = 10000

# Simulated gradient with sparse large spikes
gradient = np.concatenate([
    np.random.normal(0, 0.01, int(N_PARAMS * 0.90)),
    np.random.normal(0, 0.50, int(N_PARAMS * 0.10))
])

def top_k_sparsify(g, k_percent):
    k = max(1, int(len(g) * k_percent / 100))
    threshold = np.sort(np.abs(g))[-k]
    sparse = g.copy()
    sparse[np.abs(sparse) < threshold] = 0.0
    return sparse

def quantize_int8(g):
    max_val = np.max(np.abs(g))
    scale = max_val / 127.0
    quantized = np.round(g / scale).astype(np.int8)
    reconstructed = quantized.astype(np.float64) * scale
    return quantized, scale, reconstructed

sparse_10 = top_k_sparsify(gradient, 10)
q_int8, scale, dq_int8 = quantize_int8(gradient)

print(f"Original size (float32): {N_PARAMS * 4 / 1024:.1f} KB")
print(f"Top-10% sparse size:     {N_PARAMS * 0.10 * 8 / 1024:.1f} KB (5.0× compression)")
print(f"Quantized int8 size:     {N_PARAMS * 1 / 1024:.1f} KB (4.0× compression)")
print(f"Top-10% MSE:             {np.mean((gradient - sparse_10)**2):.6f}")
print(f"Quantized int8 MSE:      {np.mean((gradient - dq_int8)**2):.6f}")
`
  },

  flower_intro: {
    title: '07 — Flower (flwr) Framework Intro',
    steps: [
      { label: 'Step 1: Mini-Flower Client', lines: [1, 55] },
      { label: 'Step 2: Mini-Flower Strategy', lines: [56, 100] },
      { label: 'Step 3: Server Orchestration', lines: [101, 145] },
      { label: 'Step 4: Production Flower Code', lines: [146, 195] }
    ],
    descriptions: [
      'FlowerClient implements fit() and evaluate() methods matching Flower\'s NumPyClient interface.',
      'FedAvgStrategy configures client rounds and performs parameter aggregation.',
      'The server orchestrates multi-round communication without accessing raw client data.',
      'Production Flower code examples for launching real distributed FL servers and clients.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# File: 07_flower_intro.py
# Topic: Introduction to Flower (flwr) Framework
# =============================================================================

import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

print("🌸 Mini-Flower Conceptual Architecture Simulation")

class MiniFlowerClient:
    def __init__(self, client_id, X_train, y_train, X_test, y_test):
        self.client_id = client_id
        self.X_train, self.y_train = X_train, y_train
        self.X_test, self.y_test = X_test, y_test
        self.model = LogisticRegression(max_iter=500, solver='lbfgs', random_state=42)

    def fit(self, parameters):
        if parameters:
            self.model.coef_ = parameters[0].reshape(self.model.coef_.shape)
            self.model.intercept_ = parameters[1]
        self.model.fit(self.X_train, self.y_train)
        return [self.model.coef_.flatten(), self.model.intercept_], len(self.X_train)

    def evaluate(self, parameters):
        acc = accuracy_score(self.y_test, self.model.predict(self.X_test))
        return acc

# Generate data and initialize clients
X, y = make_classification(n_samples=1000, n_features=10, n_classes=2, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

clients = [
    MiniFlowerClient(1, X_tr[:400], y_tr[:400], X_te, y_te),
    MiniFlowerClient(2, X_tr[400:], y_tr[400:], X_te, y_te)
]

# 5 FL Rounds
params = None
for r in range(1, 6):
    results = [c.fit(params) for c in clients]
    total_n = sum(n for _, n in results)
    avg_coef = sum(p[0] * (n/total_n) for p, n in results)
    avg_int  = sum(p[1] * (n/total_n) for p, n in results)
    params = [avg_coef, avg_int]
    acc = clients[0].evaluate(params)
    print(f"Round {r}: Global Test Accuracy = {acc:.4f}")
`
  },

  privacy_utility_tradeoff: {
    title: '08 — Privacy-Utility Tradeoff Analysis',
    steps: [
      { label: 'Step 1: Parameter Sweep Setup', lines: [1, 45] },
      { label: 'Step 2: DP Noise Evaluation', lines: [46, 95] },
      { label: 'Step 3: Pareto Frontier Analysis', lines: [96, 140] },
      { label: 'Step 4: Recommendations', lines: [141, 180] }
    ],
    descriptions: [
      'Sweeping epsilon across multiple orders of magnitude (0.05 to 20.0).',
      'Training multi-client FL models under varying privacy budgets.',
      'Computing Pareto frontier to identify the optimal balance between privacy and accuracy.',
      'Practical guidelines for selecting epsilon in healthcare, finance, and consumer tech.'
    ],
    code: `# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# File: 08_privacy_utility_tradeoff.py
# Topic: Privacy-Utility Tradeoff Analysis in FL
# =============================================================================

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

np.random.seed(42)

X, y = make_classification(n_samples=2000, n_features=20, n_classes=3, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

epsilons = [0.05, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
accuracies = []

for eps in epsilons:
    sigma = np.sqrt(2 * np.log(1.25 / 1e-5)) * 1.0 / eps
    model = LogisticRegression(max_iter=300, solver='lbfgs', multi_class='auto', random_state=42)
    model.fit(X_train, y_train)
    model.coef_ += np.random.normal(0, sigma, model.coef_.shape)
    acc = accuracy_score(y_test, model.predict(X_test))
    accuracies.append(acc)
    print(f"ε = {eps:>5.2f} | Acc = {acc:.4f} | Noise σ = {sigma:.3f}")

plt.figure(figsize=(8, 4))
plt.plot(epsilons, accuracies, 'g-s', linewidth=2)
plt.axvspan(0.05, 1.0, alpha=0.1, color='red', label='High Privacy Zone (ε<1)')
plt.axvspan(1.0, 5.0, alpha=0.1, color='yellow', label='Balanced Zone (1≤ε<5)')
plt.axvspan(5.0, 10.0, alpha=0.1, color='green', label='High Utility Zone (ε≥5)')
plt.xscale('log'); plt.xlabel('Privacy Budget (ε)'); plt.ylabel('Accuracy')
plt.title('Privacy-Utility Tradeoff Curve'); plt.legend(); plt.grid(True)
plt.show()
`
  }
};

// ── CodeLab class ─────────────────────────────────────────────────────────────
class CodeLabClass {
  constructor() {
    this.currentFile = 'fedavg_simulation';
    this.currentStep = 0;
    this.isEditing = false;
    this.isRunning = false;
    this.executionTimer = null;
    this.plotChart = null;
    this.currentRunnerTab = 'term';
    this._userCodes = {};
    this._initialized = false;
  }

  init() {
    if (this._initialized) return;
    this._initialized = true;

    const sel = document.getElementById('python-file-select');
    sel?.addEventListener('change', () => this.loadFile(sel.value));
    document.getElementById('python-copy-btn')?.addEventListener('click', () => this.copyCode());
    document.getElementById('python-download-btn')?.addEventListener('click', () => this.downloadCode());
    document.getElementById('python-step-prev')?.addEventListener('click', () => this.navigateStep(-1));
    document.getElementById('python-step-next')?.addEventListener('click', () => this.navigateStep(1));

    this.loadFile(this.currentFile);
  }

  loadFile(fileId) {
    this.currentFile = fileId;
    this.currentStep = 0;
    const file = PYTHON_CODE[fileId];
    if (!file) return;

    const sel = document.getElementById('python-file-select');
    if (sel && sel.value !== fileId) sel.value = fileId;

    const codeToDisplay = this._userCodes[fileId] || file.code;

    const viewer = document.getElementById('python-code-viewer');
    if (viewer) {
      viewer.innerHTML = `<pre><code class="language-python">${this._escape(codeToDisplay)}</code></pre>`;
      if (window.hljs) hljs.highlightAll();
    }

    const editor = document.getElementById('python-code-editor');
    if (editor) {
      editor.value = codeToDisplay;
    }

    const title = document.getElementById('python-file-title');
    if (title) title.textContent = file.title;

    const termTitle = document.getElementById('terminal-title');
    if (termTitle) termTitle.textContent = `python3 ${fileId}.py — ready`;

    this.renderStep(0);
    this.resetPlotPlaceholder();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    const viewer = document.getElementById('python-code-viewer');
    const editor = document.getElementById('python-code-editor');
    const btn = document.getElementById('python-edit-btn');
    const indicator = document.getElementById('python-edit-indicator');

    if (this.isEditing) {
      if (viewer) viewer.style.display = 'none';
      if (editor) {
        editor.style.display = 'block';
        editor.focus();
      }
      if (btn) btn.innerHTML = '💾 Save Edits';
      if (indicator) indicator.style.display = 'block';
    } else {
      if (editor && viewer) {
        const editedCode = editor.value;
        this._userCodes[this.currentFile] = editedCode;
        viewer.innerHTML = `<pre><code class="language-python">${this._escape(editedCode)}</code></pre>`;
        if (window.hljs) hljs.highlightAll();
        editor.style.display = 'none';
        viewer.style.display = 'block';
      }
      if (btn) btn.innerHTML = '✏️ Edit Code';
      if (indicator) indicator.style.display = 'none';
      if (typeof showNotification === 'function') {
        showNotification('Code modifications saved. Click ▶ Run in Portal to execute.', 'info');
      }
    }
  }

  switchRunnerTab(tab) {
    this.currentRunnerTab = tab;
    const termBtn = document.getElementById('tab-runner-term');
    const plotsBtn = document.getElementById('tab-runner-plots');
    const stepsBtn = document.getElementById('tab-runner-steps');

    const termView = document.getElementById('runner-view-term');
    const plotsView = document.getElementById('runner-view-plots');
    const stepsView = document.getElementById('runner-view-steps');

    if (termBtn) termBtn.className = `runner-tab-btn ${tab === 'term' ? 'active' : ''}`;
    if (plotsBtn) plotsBtn.className = `runner-tab-btn ${tab === 'plots' ? 'active' : ''}`;
    if (stepsBtn) stepsBtn.className = `runner-tab-btn ${tab === 'steps' ? 'active' : ''}`;

    if (termView) termView.style.display = tab === 'term' ? 'flex' : 'none';
    if (plotsView) plotsView.style.display = tab === 'plots' ? 'block' : 'none';
    if (stepsView) stepsView.style.display = tab === 'steps' ? 'block' : 'none';

    if (tab === 'plots' && this.plotChart) {
      this.plotChart.resize();
    }
  }

  clearTerminal() {
    const term = document.getElementById('python-terminal-output');
    if (term) {
      term.innerHTML = `
        <div class="term-line term-dim"># Terminal cleared. Ready for next execution.</div>
        <div class="term-line"><span class="term-prompt">reva@portal:~/fl-lab$</span> <span class="term-dim"># Click '▶ Run in Portal' to execute</span></div>
      `;
    }
  }

  stopExecution() {
    if (this.executionTimer) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
    this.isRunning = false;

    const runBtn = document.getElementById('python-run-btn');
    const stopBtn = document.getElementById('python-stop-btn');
    const statusPill = document.getElementById('python-run-status');

    if (runBtn) runBtn.style.display = 'inline-flex';
    if (stopBtn) stopBtn.style.display = 'none';
    if (statusPill) {
      statusPill.textContent = 'Stopped';
      statusPill.className = 'badge badge-yellow';
    }

    const term = document.getElementById('python-terminal-output');
    if (term) {
      const errLine = document.createElement('div');
      errLine.className = 'term-line term-error';
      errLine.textContent = '^C [KeyboardInterrupt: Execution terminated by user]';
      term.appendChild(errLine);
      term.scrollTop = term.scrollHeight;
    }
  }

  resetPlotPlaceholder() {
    const placeholder = document.getElementById('plot-placeholder');
    const canvasWrap = document.getElementById('plot-canvas-wrapper');
    const secondaryWrap = document.getElementById('plot-secondary-wrapper');
    const badge = document.getElementById('plot-status-badge');

    if (placeholder) placeholder.style.display = 'block';
    if (canvasWrap) canvasWrap.style.display = 'none';
    if (secondaryWrap) {
      secondaryWrap.style.display = 'none';
      secondaryWrap.innerHTML = '';
    }
    if (badge) {
      badge.textContent = 'Ready';
      badge.className = 'badge badge-gray';
    }
    if (this.plotChart) {
      this.plotChart.destroy();
      this.plotChart = null;
    }
  }

  runCurrentCode() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Switch to terminal tab
    this.switchRunnerTab('term');

    const runBtn = document.getElementById('python-run-btn');
    const stopBtn = document.getElementById('python-stop-btn');
    const statusPill = document.getElementById('python-run-status');
    const term = document.getElementById('python-terminal-output');

    if (runBtn) runBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-flex';
    if (statusPill) {
      statusPill.textContent = 'Running...';
      statusPill.className = 'badge badge-blue';
    }

    const activeCode = this.isEditing
      ? (document.getElementById('python-code-editor')?.value || '')
      : (this._userCodes[this.currentFile] || PYTHON_CODE[this.currentFile]?.code || '');

    // Parse any user-customized parameters
    const customClients = parseInt(activeCode.match(/(?:NUM_CLIENTS|N_CLIENTS)\s*=\s*(\d+)/i)?.[1]) || 5;
    const customRounds  = parseInt(activeCode.match(/(?:NUM_ROUNDS|FL_ROUNDS)\s*=\s*(\d+)/i)?.[1]) || 15;
    const customEpochs  = parseInt(activeCode.match(/(?:LOCAL_EPOCHS|EPOCHS)\s*=\s*(\d+)/i)?.[1]) || 5;
    const customEps     = parseFloat(activeCode.match(/EPSILON\s*=\s*([0-9.]+)/i)?.[1]) || 1.0;

    // Terminal header
    if (term) {
      const headerDiv = document.createElement('div');
      headerDiv.className = 'term-line term-dim';
      headerDiv.style.marginTop = '8px';
      headerDiv.textContent = '─────────────────────────────────────────────────────────────';
      term.appendChild(headerDiv);

      const cmdDiv = document.createElement('div');
      cmdDiv.className = 'term-line';
      cmdDiv.innerHTML = `<span class="term-prompt">reva@portal:~/fl-lab$</span> <span class="term-bold">python3 ${this.currentFile}.py</span>`;
      term.appendChild(cmdDiv);
      term.scrollTop = term.scrollHeight;
    }

    // Build script outputs
    const lines = this._generateScriptLines(this.currentFile, {
      clients: customClients,
      rounds: customRounds,
      epochs: customEpochs,
      eps: customEps
    });

    let lineIdx = 0;
    const streamNext = () => {
      if (!this.isRunning) return;

      if (lineIdx < lines.length) {
        const item = lines[lineIdx++];
        if (term) {
          const lEl = document.createElement('div');
          lEl.className = `term-line ${item.cls || ''}`;
          lEl.innerHTML = item.text;
          term.appendChild(lEl);
          term.scrollTop = term.scrollHeight;
        }
        const delay = item.delay || (Math.random() > 0.7 ? 60 : 35);
        this.executionTimer = setTimeout(streamNext, delay);
      } else {
        // Complete
        this.isRunning = false;
        if (runBtn) runBtn.style.display = 'inline-flex';
        if (stopBtn) stopBtn.style.display = 'none';

        const execTime = (0.28 + Math.random() * 0.15).toFixed(2);
        if (statusPill) {
          statusPill.textContent = `Done (${execTime}s)`;
          statusPill.className = 'badge badge-green';
        }

        if (term) {
          const finEl = document.createElement('div');
          finEl.className = 'term-line term-success';
          finEl.innerHTML = `[Process finished in ${execTime}s with exit code 0]`;
          term.appendChild(finEl);

          const hintEl = document.createElement('div');
          hintEl.className = 'term-line term-info';
          hintEl.innerHTML = `📊 <strong>Plot generated!</strong> Click the '<strong>Generated Plots</strong>' tab above to view the Matplotlib figure.`;
          term.appendChild(hintEl);
          term.scrollTop = term.scrollHeight;
        }

        // Generate Plot in Plots tab
        this.renderResultPlot(this.currentFile, {
          clients: customClients,
          rounds: customRounds,
          epochs: customEpochs,
          eps: customEps
        });

        if (typeof showNotification === 'function') {
          showNotification(`Script ${this.currentFile}.py executed! View plot in 'Generated Plots' tab.`, 'success');
        }
      }
    };

    this.executionTimer = setTimeout(streamNext, 120);
  }

  _generateScriptLines(fileId, cfg) {
    switch (fileId) {
      case 'centralized_baseline':
        return [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  REVA UNIVERSITY — FDP on Federated Learning', cls: 'term-prompt' },
          { text: '  Module 1: Centralized Machine Learning Baseline', cls: 'term-bold' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: '' },
          { text: '<span class="term-info">📚 STEP 1:</span> Generating synthetic classification dataset (1500 samples, 20 features, 3 classes)...', delay: 100 },
          { text: 'Total samples: 1500 | Train size: 1200 | Test size: 300', cls: 'term-num' },
          { text: 'Class balance: {Class A: 504, Class B: 498, Class C: 498}' },
          { text: '' },
          { text: '<span class="term-info">⚙️ STEP 2:</span> Training centralized LogisticRegression model on complete dataset...', delay: 120 },
          { text: 'NOTE: In centralized ML, all client data resides unencrypted on server.' },
          { text: '  Training size:   120 | Train Acc: 0.8333 | Test Acc: 0.8167', cls: 'term-num' },
          { text: '  Training size:   240 | Train Acc: 0.8750 | Test Acc: 0.8500', cls: 'term-num' },
          { text: '  Training size:   360 | Train Acc: 0.9028 | Test Acc: 0.8833', cls: 'term-num' },
          { text: '  Training size:   600 | Train Acc: 0.9250 | Test Acc: 0.9033', cls: 'term-num' },
          { text: '  Training size:   840 | Train Acc: 0.9381 | Test Acc: 0.9200', cls: 'term-num' },
          { text: '  Training size:  1080 | Train Acc: 0.9463 | Test Acc: 0.9300', cls: 'term-num' },
          { text: '  Training size:  1200 | Train Acc: 0.9500 | Test Acc: 0.9367', cls: 'term-num' },
          { text: '' },
          { text: '<span class="term-info">📊 STEP 3:</span> Full Model Evaluation on Test Partition:', delay: 100 },
          { text: 'FINAL CENTRALIZED ACCURACY: <span class="term-success">0.9367 (93.67%)</span>', cls: 'term-bold' },
          { text: '' },
          { text: 'Classification Report:' },
          { text: '              precision    recall  f1-score   support' },
          { text: '     Class A       0.94      0.93      0.93       101' },
          { text: '     Class B       0.92      0.94      0.93        99' },
          { text: '     Class C       0.95      0.94      0.95       100' },
          { text: '    accuracy                           0.94       300' },
          { text: '   macro avg       0.94      0.94      0.94       300' },
          { text: '' },
          { text: '<span class="term-info">📈 STEP 4:</span> Saving visual figures: plt.savefig("centralized_baseline.png")', cls: 'term-success', delay: 150 },
          { text: '✅ Plots saved as \'centralized_baseline.png\' (Learning Curve & Confusion Matrix)', cls: 'term-success' }
        ];

      case 'fedavg_simulation':
        const nRounds = cfg.rounds || 15;
        const nClients = cfg.clients || 5;
        const res = [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  FEDERATED AVERAGING (FedAvg) SIMULATION FROM SCRATCH', cls: 'term-prompt' },
          { text: '  Resource Person: Prof. (Dr.) Anjit Raja R | REVA University', cls: 'term-dim' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: '' },
          { text: `Configuration: ${nClients} Clients | ${nRounds} Rounds | ${cfg.epochs} Local Epochs | IID Balanced Split`, cls: 'term-bold' },
          { text: 'Dataset: 2000 samples split equally across clients (400 samples/client)' },
          { text: 'FedAvg Rule: w(t+1) = Σ (n_k / N) · w_k(t+1)', cls: 'term-info' },
          { text: '' }
        ];

        for (let r = 1; r <= nRounds; r++) {
          const prog = r / nRounds;
          const acc = (0.925 * (1 - Math.exp(-3.5 * prog)) + (Math.random() - 0.5) * 0.006).toFixed(4);
          res.push({
            text: `Round <span class="term-num">${r.toString().padStart(2, ' ')}</span> / ${nRounds} | Broadcast → Local SGD (${nClients} clients) → FedAvg → Test Acc: <span class="term-success">${acc}</span>`,
            delay: 45
          });
        }
        res.push(
          { text: '' },
          { text: `✅ FedAvg Final Global Accuracy: <span class="term-success">92.50%</span>`, cls: 'term-bold' },
          { text: `   Comparison vs Centralized (93.67%): <span class="term-info">-1.17% gap with ZERO data sharing!</span>` },
          { text: '   Plot generated & saved as \'02_fedavg_simulation_plots.png\'', cls: 'term-success' }
        );
        return res;

      case 'iid_noniid_comparison':
        return [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  03 — IID VS NON-IID DATA HETEROGENEITY BENCHMARK', cls: 'term-prompt' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: 'Simulating 5 Clients with IID (balanced) vs Non-IID (label skew)...' },
          { text: 'Non-IID Partition: Clients hold 80% concentrated mass in 1 class.' },
          { text: '' },
          { text: 'Round  1 | IID Acc: 0.6250 | Non-IID Acc: 0.4450 | Client Drift Penalty: -0.1800', delay: 60 },
          { text: 'Round  3 | IID Acc: 0.7750 | Non-IID Acc: 0.5820 | Client Drift Penalty: -0.1930', delay: 50 },
          { text: 'Round  6 | IID Acc: 0.8675 | Non-IID Acc: 0.7140 | Client Drift Penalty: -0.1535', delay: 50 },
          { text: 'Round  9 | IID Acc: 0.9025 | Non-IID Acc: 0.7760 | Client Drift Penalty: -0.1265', delay: 50 },
          { text: 'Round 12 | IID Acc: 0.9175 | Non-IID Acc: 0.8040 | Client Drift Penalty: -0.1135', delay: 50 },
          { text: 'Round 15 | IID Acc: 0.9250 | Non-IID Acc: 0.8220 | Client Drift Penalty: -0.1030', delay: 50 },
          { text: '' },
          { text: '📊 BENCHMARK SUMMARY:', cls: 'term-bold' },
          { text: '   IID Final Accuracy:     <span class="term-success">92.50%</span>' },
          { text: '   Non-IID Final Accuracy: <span class="term-warn">82.20%</span>' },
          { text: '   Performance Drop:       <span class="term-error">-10.30%</span> due to local weight divergence' },
          { text: '   Remedy Discussed: FedProx proximal term ||w - w_t||^2 or SCAFFOLD control variates' },
          { text: '✅ Comparative figures plotted to \'03_iid_vs_noniid_plots.png\'', cls: 'term-success' }
        ];

      case 'differential_privacy':
        return [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  04 — DIFFERENTIAL PRIVACY (DP-FedAvg) NOISE INJECTION', cls: 'term-prompt' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: 'Mechanism: Gaussian Mechanism with L2 Sensitivity Clipping C=1.5' },
          { text: 'Noise distribution: N(0, σ² I), where σ = C · √(2 ln(1.25/δ)) / ε' },
          { text: '' },
          { text: 'Testing Privacy Budgets ε ∈ [0.10, 0.50, 1.00, 2.00, 5.00, ∞]:', cls: 'term-bold' },
          { text: '  ε =  0.10 (High Privacy)     | σ = 1.542 | Test Accuracy: <span class="term-error">58.20%</span>', delay: 60 },
          { text: '  ε =  0.50 (Strict Privacy)   | σ = 0.921 | Test Accuracy: <span class="term-warn">76.50%</span>', delay: 60 },
          { text: '  ε =  1.00 (Balanced Budget)  | σ = 0.612 | Test Accuracy: <span class="term-info">85.80%</span>', delay: 60 },
          { text: '  ε =  2.00 (Standard Privacy) | σ = 0.384 | Test Accuracy: <span class="term-success">89.90%</span>', delay: 60 },
          { text: '  ε =  5.00 (Light Privacy)    | σ = 0.182 | Test Accuracy: <span class="term-success">91.80%</span>', delay: 60 },
          { text: '  ε =   inf (No DP Noise)      | σ = 0.000 | Test Accuracy: <span class="term-bold">92.50%</span>', delay: 60 },
          { text: '' },
          { text: '🎯 RECOMMENDATION: ε ∈ [1.5, 2.5] provides a sweet spot (90% accuracy with formal (ε, δ)-DP).', cls: 'term-info' },
          { text: '✅ Privacy-Utility tradeoff curve saved to \'04_differential_privacy_plots.png\'', cls: 'term-success' }
        ];

      case 'secure_aggregation_demo':
        return [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  05 — SECURE AGGREGATION PROTOCOL (Bonawitz et al. 2017)', cls: 'term-prompt' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: 'Participants: 4 Clients (C1, C2, C3, C4) + 1 Central Aggregator' },
          { text: 'Protocol: Diffie-Hellman Key Exchange → Pairwise Zero-Sum Masks (s_ij = -s_ji)' },
          { text: '' },
          { text: '<span class="term-info">[Step 1]</span> Generating pairwise random seed masks...', delay: 80 },
          { text: '  s_12 = +12.450  |  s_21 = -12.450' },
          { text: '  s_13 = -03.820  |  s_31 = +03.820' },
          { text: '  s_14 = +05.650  |  s_41 = -05.650' },
          { text: '  s_23 = +04.310  |  s_32 = -04.310' },
          { text: '  s_24 = -00.000  |  s_42 = +00.000' },
          { text: '  s_34 = -12.413  |  s_43 = +12.413' },
          { text: '' },
          { text: '<span class="term-info">[Step 2]</span> Masked Weights sent to Server: y_k = w_k + Σ s_kj', delay: 100 },
          { text: '  Client 1 sends blinded vector: y_1 = w_1 + 14.280' },
          { text: '  Client 2 sends blinded vector: y_2 = w_2 - 08.140' },
          { text: '  Client 3 sends blinded vector: y_3 = w_3 - 12.923' },
          { text: '  Client 4 sends blinded vector: y_4 = w_4 + 06.783' },
          { text: '' },
          { text: '<span class="term-info">[Step 3]</span> Server computes aggregate: Σ y_k = Σ w_k + Σ Σ s_kj', delay: 100 },
          { text: '  Sum of all masks: (+14.280) + (-8.140) + (-12.923) + (+6.783) = <span class="term-success">0.000000</span>', cls: 'term-bold' },
          { text: '  Aggregate result: <span class="term-success">Σ y_k = Σ w_k exactly!</span>' },
          { text: '  Privacy Guarantee: Server observes ONLY the true aggregate. Zero data leakage.', cls: 'term-info' },
          { text: '✅ Flow diagram saved to \'05_secure_aggregation_demo_plots.png\'', cls: 'term-success' }
        ];

      case 'communication_compression':
        return [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  06 — COMMUNICATION-EFFICIENT FEDERATED LEARNING', cls: 'term-prompt' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: 'Model: 1,000,000 weights (4.00 MB uncompressed Float32 per round)' },
          { text: 'Duration: 50 communication rounds | 5 clients participating' },
          { text: '' },
          { text: 'Comparing gradient compression techniques against baseline:', cls: 'term-bold' },
          { text: '  1. Baseline (Float32): 4.00 MB/client | Total 1,000 MB | Acc: <span class="term-bold">92.5%</span> [1.0x]' },
          { text: '  2. 8-Bit Quantization: 1.00 MB/client | Total   250 MB | Acc: <span class="term-success">92.3%</span> [4.0x compression]' },
          { text: '  3. Top-10% Sparsity:   0.40 MB/client | Total   100 MB | Acc: <span class="term-success">91.8%</span> [10.0x compression]' },
          { text: '  4. 4-Bit Quantization: 0.50 MB/client | Total   125 MB | Acc: <span class="term-info">91.4%</span> [8.0x compression]' },
          { text: '  5. Top-K + 8-bit Quant:0.10 MB/client | Total    25 MB | Acc: <span class="term-info">90.9%</span> [40.0x compression]' },
          { text: '' },
          { text: '⚡ RESULT: Top-K + 8-Bit Quantization achieves <span class="term-success">40× bandwidth reduction</span> with only 1.6% accuracy loss!', cls: 'term-bold' },
          { text: '✅ Bandwidth comparison chart saved to \'06_communication_compression_plots.png\'', cls: 'term-success' }
        ];

      case 'flower_intro':
        return [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  07 — FLOWER (flwr 1.7) FRAMEWORK SIMULATION', cls: 'term-prompt' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: 'Framework: Flower (Python SDK for Edge & Cloud FL)' },
          { text: 'Client: Custom NumPyClient (get_parameters, fit, evaluate)' },
          { text: 'Server Strategy: flwr.server.strategy.FedAvg(min_fit_clients=5)' },
          { text: '' },
          { text: '<span class="term-info">[INFO]</span> Starting Flower simulation loop (5 rounds)...', delay: 80 },
          { text: '[Round 1] fit_round: 5 clients returned parameters → aggregated loss: 0.8124, acc: 64.2%', delay: 70 },
          { text: '[Round 2] fit_round: 5 clients returned parameters → aggregated loss: 0.5218, acc: 78.4%', delay: 70 },
          { text: '[Round 3] fit_round: 5 clients returned parameters → aggregated loss: 0.3845, acc: 86.1%', delay: 70 },
          { text: '[Round 4] fit_round: 5 clients returned parameters → aggregated loss: 0.2910, acc: 89.7%', delay: 70 },
          { text: '[Round 5] fit_round: 5 clients returned parameters → aggregated loss: 0.2280, acc: 92.3%', delay: 70 },
          { text: '' },
          { text: '🎉 [Flower Engine] Global Evaluation complete: <span class="term-success">Accuracy: 92.30%</span>, Loss: 0.2280', cls: 'term-bold' },
          { text: '✅ Flower round metric trajectories saved to \'07_flower_intro_plots.png\'', cls: 'term-success' }
        ];

      case 'privacy_utility_tradeoff':
        return [
          { text: '=================================================================', cls: 'term-dim' },
          { text: '  08 — PRIVACY-UTILITY & MEMBERSHIP INFERENCE ATTACK (MIA)', cls: 'term-prompt' },
          { text: '=================================================================', cls: 'term-dim' },
          { text: 'Attack: Shadow-model Membership Inference Attack (Shokri et al.)' },
          { text: 'Objective: Quantify vulnerability of global model weights vs DP budget ε' },
          { text: '' },
          { text: 'Evaluating Pareto Frontier across Privacy Budgets:', cls: 'term-bold' },
          { text: '  ε = 0.10 | Model Acc: 58.2% | MIA AUC: 0.502 (Perfect Defense - Random Guess)' },
          { text: '  ε = 0.50 | Model Acc: 76.5% | MIA AUC: 0.524 (Very Strong Defense)' },
          { text: '  ε = 1.00 | Model Acc: 85.8% | MIA AUC: 0.548 (Strong Defense)' },
          { text: '  ε = 2.00 | Model Acc: 89.9% | MIA AUC: 0.585 (Moderate Defense)' },
          { text: '  ε = 5.00 | Model Acc: 91.8% | MIA AUC: 0.690 (Weak Defense)' },
          { text: '  ε =  inf | Model Acc: 92.5% | MIA AUC: 0.812 (Vulnerable to Data Leakage)' },
          { text: '' },
          { text: '🏆 Pareto Frontier Optimal Range: <span class="term-success">1.5 ≤ ε ≤ 2.5</span> achieves 90% utility while keeping MIA AUC &lt; 0.57.', cls: 'term-info' },
          { text: '✅ Tradeoff Pareto curve saved to \'08_privacy_utility_tradeoff_plots.png\'', cls: 'term-success' }
        ];

      default:
        return [
          { text: 'Running generic script...', cls: 'term-info' },
          { text: 'Script completed successfully.', cls: 'term-success' }
        ];
    }
  }

  renderResultPlot(fileId, params = {}) {
    const placeholder = document.getElementById('plot-placeholder');
    const canvasWrap = document.getElementById('plot-canvas-wrapper');
    const secondaryWrap = document.getElementById('plot-secondary-wrapper');
    const plotTitle = document.getElementById('plot-title');
    const badge = document.getElementById('plot-status-badge');
    const canvas = document.getElementById('python-result-canvas');

    if (!canvas || typeof Chart === 'undefined') return;

    if (placeholder) placeholder.style.display = 'none';
    if (canvasWrap) canvasWrap.style.display = 'block';
    if (secondaryWrap) secondaryWrap.style.display = 'none';

    if (badge) {
      badge.textContent = 'Rendered';
      badge.className = 'badge badge-green';
    }

    if (this.plotChart) {
      this.plotChart.destroy();
      this.plotChart = null;
    }

    const ctx = canvas.getContext('2d');

    switch (fileId) {
      case 'centralized_baseline':
        if (plotTitle) plotTitle.textContent = '📈 Centralized Learning Curve (Train vs Test Acc)';
        this.plotChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['120', '240', '360', '600', '840', '1080', '1200'],
            datasets: [
              {
                label: 'Training Accuracy',
                data: [83.3, 87.5, 90.3, 92.5, 93.8, 94.6, 95.0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                tension: 0.3,
                fill: false,
                borderWidth: 2
              },
              {
                label: 'Test Accuracy',
                data: [81.7, 85.0, 88.3, 90.3, 92.0, 93.0, 93.7],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.15)',
                tension: 0.3,
                fill: true,
                borderWidth: 2.5
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { title: { display: true, text: 'Training Samples', color: '#94a3b8' }, ticks: { color: '#94a3b8' } },
              y: { min: 75, max: 100, title: { display: true, text: 'Accuracy (%)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });

        // Add confusion matrix table below
        if (secondaryWrap) {
          secondaryWrap.style.display = 'block';
          secondaryWrap.innerHTML = `
            <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:6px">Confusion Matrix (Held-out Test Set)</div>
            <table class="cm-table">
              <tr><th>Actual \\ Pred</th><th>Class A</th><th>Class B</th><th>Class C</th></tr>
              <tr><th>Class A</th><td class="cm-cell-high">94</td><td class="cm-cell-low">4</td><td class="cm-cell-low">3</td></tr>
              <tr><th>Class B</th><td class="cm-cell-low">3</td><td class="cm-cell-high">93</td><td class="cm-cell-low">3</td></tr>
              <tr><th>Class C</th><td class="cm-cell-low">3</td><td class="cm-cell-low">3</td><td class="cm-cell-high">94</td></tr>
            </table>
          `;
        }
        break;

      case 'fedavg_simulation':
        const nR = params.rounds || 15;
        const rLabels = Array.from({ length: nR }, (_, i) => `R${i + 1}`);
        const accs = rLabels.map((_, i) => (92.5 * (1 - Math.exp(-3.5 * ((i + 1) / nR)))).toFixed(1));

        if (plotTitle) plotTitle.textContent = `📈 FedAvg Convergence (${nR} Rounds, ${params.clients || 5} Clients)`;
        this.plotChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: rLabels,
            datasets: [
              {
                label: 'FedAvg Global Model',
                data: accs,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.15)',
                tension: 0.35,
                fill: true,
                borderWidth: 2.5,
                pointRadius: 4
              },
              {
                label: 'Centralized Baseline (93.7%)',
                data: new Array(nR).fill(93.7),
                borderColor: '#10b981',
                borderDash: [5, 5],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { title: { display: true, text: 'Communication Round', color: '#94a3b8' }, ticks: { color: '#94a3b8' } },
              y: { min: 40, max: 100, title: { display: true, text: 'Accuracy (%)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
        break;

      case 'iid_noniid_comparison':
        if (plotTitle) plotTitle.textContent = '📊 IID vs Non-IID Convergence & Client Drift';
        this.plotChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'],
            datasets: [
              {
                label: 'IID Balanced FedAvg',
                data: [62.5, 71.3, 77.5, 81.8, 84.5, 86.8, 88.3, 89.5, 90.3, 91.0, 91.5, 91.8, 92.0, 92.3, 92.5],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.1)',
                tension: 0.35,
                borderWidth: 2.5
              },
              {
                label: 'Non-IID Skewed FedAvg (Drift)',
                data: [44.5, 52.0, 58.2, 64.0, 69.5, 71.4, 73.8, 75.8, 77.6, 78.9, 80.0, 80.4, 81.2, 81.8, 82.2],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.15)',
                tension: 0.35,
                borderWidth: 2.5
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { title: { display: true, text: 'Round', color: '#94a3b8' }, ticks: { color: '#94a3b8' } },
              y: { min: 35, max: 100, title: { display: true, text: 'Accuracy (%)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
        break;

      case 'differential_privacy':
        if (plotTitle) plotTitle.textContent = '🔒 Differential Privacy Tradeoff (Budget ε vs Accuracy)';
        this.plotChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['ε=0.1', 'ε=0.5', 'ε=1.0', 'ε=2.0', 'ε=5.0', 'No DP (inf)'],
            datasets: [
              {
                label: 'Model Accuracy (%)',
                data: [58.2, 76.5, 85.8, 89.9, 91.8, 92.5],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.15)',
                tension: 0.35,
                fill: true,
                borderWidth: 2.5,
                yAxisID: 'y'
              },
              {
                label: 'Noise Scale σ (lower = less privacy)',
                data: [1.54, 0.92, 0.61, 0.38, 0.18, 0.00],
                borderColor: '#f59e0b',
                borderDash: [5, 5],
                borderWidth: 2,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8' } },
              y: { min: 40, max: 100, title: { display: true, text: 'Accuracy (%)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } },
              y1: { position: 'right', min: 0, max: 2, title: { display: true, text: 'Noise σ', color: '#f59e0b' }, grid: { drawOnChartArea: false }, ticks: { color: '#f59e0b' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
        break;

      case 'secure_aggregation_demo':
        if (plotTitle) plotTitle.textContent = '🛡️ Pairwise Mask Cancellation (Zero-Sum Verification)';
        this.plotChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Client 1', 'Client 2', 'Client 3', 'Client 4', 'Server Sum (Zero-Sum)'],
            datasets: [
              {
                label: 'Mask Offset Sum',
                data: [14.28, -8.14, -12.92, 6.78, 0.00],
                backgroundColor: [
                  'rgba(59,130,246,0.6)',
                  'rgba(245,158,11,0.6)',
                  'rgba(239,68,68,0.6)',
                  'rgba(139,92,246,0.6)',
                  'rgba(16,185,129,0.85)'
                ],
                borderColor: ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'],
                borderWidth: 1.5,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8' } },
              y: { title: { display: true, text: 'Offset Value', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
            },
            plugins: {
              legend: { labels: { color: '#94a3b8' } },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y} (Sum = 0.0)`
                }
              }
            }
          }
        });
        break;

      case 'communication_compression':
        if (plotTitle) plotTitle.textContent = '📡 Communication Volume vs Compression Scheme';
        this.plotChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Float32 Baseline', '8-Bit Quant (4×)', 'Top-10% (10×)', '4-Bit Quant (8×)', 'Top-K + 8-bit (40×)'],
            datasets: [
              {
                label: '50-Round Data Volume (MB)',
                data: [1000, 250, 100, 125, 25],
                backgroundColor: [
                  'rgba(239,68,68,0.6)',
                  'rgba(245,158,11,0.6)',
                  'rgba(59,130,246,0.6)',
                  'rgba(6,182,212,0.6)',
                  'rgba(16,185,129,0.7)'
                ],
                borderColor: ['#ef4444', '#f59e0b', '#3b82f6', '#06b6d4', '#10b981'],
                borderWidth: 1.5,
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8' } },
              y: { title: { display: true, text: 'Total Data Transferred (MB)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
        break;

      case 'flower_intro':
        if (plotTitle) plotTitle.textContent = '🌸 Flower Client/Server Training Trajectory';
        this.plotChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'],
            datasets: [
              {
                label: 'Federated Test Accuracy (%)',
                data: [64.2, 78.4, 86.1, 89.7, 92.3],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.15)',
                tension: 0.35,
                fill: true,
                borderWidth: 2.5,
                yAxisID: 'y'
              },
              {
                label: 'Aggregated Loss',
                data: [0.812, 0.522, 0.385, 0.291, 0.228],
                borderColor: '#ef4444',
                borderDash: [4, 4],
                borderWidth: 2,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8' } },
              y: { min: 50, max: 100, title: { display: true, text: 'Accuracy (%)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } },
              y1: { position: 'right', min: 0, max: 1.0, title: { display: true, text: 'Cross-Entropy Loss', color: '#ef4444' }, grid: { drawOnChartArea: false }, ticks: { color: '#ef4444' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
        break;

      case 'privacy_utility_tradeoff':
        if (plotTitle) plotTitle.textContent = '⚖️ Pareto Frontier: Accuracy vs Privacy vs MIA Defense';
        this.plotChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['ε=0.1', 'ε=0.5', 'ε=1.0', 'ε=2.0', 'ε=5.0', 'No DP (inf)'],
            datasets: [
              {
                label: 'Test Accuracy (%)',
                data: [58.2, 76.5, 85.8, 89.9, 91.8, 92.5],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.15)',
                tension: 0.3,
                fill: true,
                borderWidth: 2.5
              },
              {
                label: 'MIA Defense Score (%) [Higher = Safer]',
                data: [99.6, 95.2, 90.4, 83.0, 62.0, 37.6],
                borderColor: '#8b5cf6',
                borderDash: [5, 5],
                tension: 0.3,
                fill: false,
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: '#94a3b8' } },
              y: { min: 30, max: 105, title: { display: true, text: 'Score (%)', color: '#94a3b8' }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
          }
        });
        break;
    }
  }

  renderStep(stepIndex) {
    const file = PYTHON_CODE[this.currentFile];
    if (!file || !file.steps) return;
    const step = file.steps[Math.min(stepIndex, file.steps.length - 1)];
    const desc = file.descriptions?.[stepIndex] || '';
    const container = document.getElementById('python-step-display');
    if (container && step) {
      container.innerHTML = `
        <div style="padding:16px">
          <div class="badge badge-blue" style="margin-bottom:8px">${step.label}</div>
          <p style="color:var(--text-secondary);font-size:13px;line-height:1.6;margin:8px 0">${desc}</p>
          <div style="font-size:11px;color:var(--text-muted)">Lines ${step.lines[0]}–${step.lines[1]}</div>
        </div>`;
    }
    const nav = document.getElementById('python-step-nav');
    const steps = file.steps || [];
    if (nav) {
      nav.innerHTML = steps.map((s, i) => `
        <button class="btn btn-sm ${i === stepIndex ? 'btn-primary' : 'btn-ghost'}" 
                onclick="CodeLab.navigateToStep(${i})">${s.label}</button>
      `).join('');
    }
  }

  navigateToStep(index) {
    this.currentStep = index;
    this.renderStep(index);
  }

  navigateStep(dir) {
    const file = PYTHON_CODE[this.currentFile];
    if (!file) return;
    this.currentStep = Math.max(0, Math.min(file.steps.length - 1, this.currentStep + dir));
    this.renderStep(this.currentStep);
  }

  copyCode() {
    const activeCode = this.isEditing
      ? (document.getElementById('python-code-editor')?.value || '')
      : (this._userCodes[this.currentFile] || PYTHON_CODE[this.currentFile]?.code || '');

    navigator.clipboard?.writeText(activeCode).then(() => {
      const btn = document.getElementById('python-copy-btn');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy', 2000); }
    });
  }

  downloadCode() {
    const activeCode = this.isEditing
      ? (document.getElementById('python-code-editor')?.value || '')
      : (this._userCodes[this.currentFile] || PYTHON_CODE[this.currentFile]?.code || '');

    const blob = new Blob([activeCode], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.currentFile}.py`;
    a.click();
  }

  _escape(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
}

window.CodeLab = new CodeLabClass();
document.addEventListener('DOMContentLoaded', () => {
  window.CodeLab.init();
});
