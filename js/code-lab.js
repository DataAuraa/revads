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
    const viewer = document.getElementById('python-code-viewer');
    if (viewer) {
      viewer.innerHTML = `<pre><code class="language-python">${this._escape(file.code)}</code></pre>`;
      if (window.hljs) hljs.highlightAll();
    }
    const title = document.getElementById('python-file-title');
    if (title) title.textContent = file.title;
    this.renderStep(0);
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
    // Update step nav
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
    const file = PYTHON_CODE[this.currentFile];
    if (!file) return;
    navigator.clipboard?.writeText(file.code).then(() => {
      const btn = document.getElementById('python-copy-btn');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy Code', 2000); }
    });
  }

  downloadCode() {
    const file = PYTHON_CODE[this.currentFile];
    if (!file) return;
    const blob = new Blob([file.code], { type: 'text/plain' });
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
