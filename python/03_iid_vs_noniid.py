# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 03_iid_vs_noniid.py
# Topic: IID vs Non-IID Data Distribution in Federated Learning
# Description: Demonstrates the critical difference between IID (Independent and
#              Identically Distributed) and Non-IID data across FL clients.
#              Shows how Non-IID hurts convergence speed and final accuracy.
#
# Requirements: numpy, scikit-learn, matplotlib
# Optional: None
#
# For Google Colab:
# !pip install numpy scikit-learn matplotlib
# =============================================================================

# ===== GOOGLE COLAB SETUP =====
# Uncomment if running in Google Colab:
# !pip install numpy scikit-learn matplotlib --quiet

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import warnings
warnings.filterwarnings('ignore')

from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

print("=" * 65)
print("  REVA UNIVERSITY - FDP on Federated Learning")
print("  Module 3: IID vs Non-IID Data Distribution")
print("=" * 65)
print()

# =============================================================================
# SECTION 1: WHY DATA DISTRIBUTION MATTERS IN FL
# =============================================================================
# In real-world FL deployments, data across clients is RARELY IID.
#
# IID (Independent and Identically Distributed):
#   - Each client's data is drawn from the SAME underlying distribution
#   - Class proportions are similar across all clients
#   - Example: Survey data randomly distributed to hospitals
#
# Non-IID (Non-Independent/Non-Identically Distributed):
#   - Each client's data comes from a DIFFERENT distribution
#   - Some classes may be absent or over-represented on certain clients
#   - Example: Hospital A sees mostly cancer patients, Hospital B sees
#              mostly diabetic patients → very different distributions!
#
# Non-IID is the NORM in practice:
#   - Mobile users have different app usage patterns
#   - Different hospitals serve different demographics
#   - Different cities have different traffic patterns
#
# Why Non-IID hurts FedAvg:
#   - Local gradients point in DIFFERENT directions (client drift)
#   - Averaging divergent gradients produces a poor global model
#   - More rounds needed to converge; final accuracy is lower
# =============================================================================

print("📚 SECTION 1: Understanding IID vs Non-IID")
print("-" * 50)
print("IID : Each client has similar class distribution (ideal but rare)")
print("Non-IID: Each client has skewed class distribution (realistic)")
print()

# =============================================================================
# SECTION 2: DATASET GENERATION
# =============================================================================

N_SAMPLES   = 600
N_FEATURES  = 10
N_CLASSES   = 3
N_CLIENTS   = 5
FL_ROUNDS   = 20

X, y = make_classification(
    n_samples=N_SAMPLES, n_features=N_FEATURES,
    n_informative=6, n_redundant=2,
    n_classes=N_CLASSES, n_clusters_per_class=1,
    random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

print(f"📊 SECTION 2: Dataset — {N_SAMPLES} samples, {N_FEATURES} features, {N_CLASSES} classes")
print("-" * 50)

# =============================================================================
# SECTION 3: IID DATA SPLIT
# =============================================================================
# IID split: Randomly shuffle and divide equally among clients
# Each client ends up with a similar class distribution

print("🔀 SECTION 3: Creating IID Data Split")
print("-" * 50)

indices_iid = np.random.permutation(len(X_train))
iid_split   = np.array_split(indices_iid, N_CLIENTS)

iid_clients = []
for i, idx in enumerate(iid_split):
    data = {'X': X_train_s[idx], 'y': y_train[idx], 'size': len(idx)}
    iid_clients.append(data)
    counts = dict(zip(*np.unique(y_train[idx], return_counts=True)))
    print(f"   IID Client {i+1}: {len(idx)} samples | {counts}")

print()

# =============================================================================
# SECTION 4: NON-IID DATA SPLIT
# =============================================================================
# Non-IID split strategy: Pathological (most extreme case)
#   - Sort training data by class label
#   - Client 1 gets mostly class 0
#   - Client 2 gets mostly class 1
#   - Client 3 gets mostly class 2
#   - etc.
# This simulates the "pathological non-IID" setup from McMahan et al. 2017

print("🔀 SECTION 4: Creating Non-IID Data Split (Pathological)")
print("-" * 50)

# Sort indices by class label
sorted_indices = np.argsort(y_train)

# Each client gets a block of consecutive (class-sorted) samples
# This ensures each client is dominated by specific classes
noniid_split = np.array_split(sorted_indices, N_CLIENTS)

noniid_clients = []
for i, idx in enumerate(noniid_split):
    data = {'X': X_train_s[idx], 'y': y_train[idx], 'size': len(idx)}
    noniid_clients.append(data)
    counts = dict(zip(*np.unique(y_train[idx], return_counts=True)))
    print(f"   Non-IID Client {i+1}: {len(idx)} samples | {counts}")

print()
print("   ⚠️  Notice: Non-IID clients are dominated by 1-2 classes!")
print("   This creates CLIENT DRIFT during local training.")
print()

# =============================================================================
# SECTION 5: FEDAVG FUNCTIONS (reused from Module 2)
# =============================================================================

def client_train(client_X, client_y, global_coef, global_intercept, n_classes):
    """
    Simulate local client training.
    Client receives global model, trains locally, returns updated weights.
    """
    model = LogisticRegression(max_iter=200, random_state=42,
                               solver='lbfgs', multi_class='auto')
    # Quick fit to initialize sklearn internal structures
    model.fit(client_X, client_y)
    # Overwrite with global parameters, then fine-tune
    model.coef_      = global_coef.copy()
    model.intercept_ = global_intercept.copy()
    model.fit(client_X, client_y)  # Local training
    return model.coef_.copy(), model.intercept_.copy(), \
           accuracy_score(client_y, model.predict(client_X))


def fed_avg(client_coefs, client_intercepts, client_sizes):
    """
    Weighted average aggregation (FedAvg).
    w_global = Σ (n_k / N) * w_k
    """
    N = sum(client_sizes)
    new_coef      = sum((n/N) * c for c, n in zip(client_coefs, client_sizes))
    new_intercept = sum((n/N) * b for b, n in zip(client_intercepts, client_sizes))
    return new_coef, new_intercept


def evaluate_global_model(global_coef, global_intercept, X_test, y_test):
    """Evaluate global model on test set."""
    model = LogisticRegression(max_iter=1000, random_state=42,
                               solver='lbfgs', multi_class='auto')
    model.fit(X_test[:10], y_test[:10])   # Quick init
    model.coef_      = global_coef.copy()
    model.intercept_ = global_intercept.copy()
    return accuracy_score(y_test, model.predict(X_test))


def run_fedavg(clients, X_test, y_test, n_features, n_classes, fl_rounds, label=""):
    """
    Run complete FedAvg simulation for given client data.
    Returns list of global accuracy per round, and per-client accuracy per round.
    """
    # Initialize global model
    global_coef      = np.random.randn(n_classes, n_features) * 0.01
    global_intercept = np.zeros(n_classes)
    
    global_accs = []
    client_accs = {i: [] for i in range(len(clients))}
    
    print(f"\n  {'Round':>5} | {'Global Acc':>10} | {'Per-Client Local Acc':>45}")
    print(f"  {'-'*70}")
    
    for fl_round in range(1, fl_rounds + 1):
        round_coefs      = []
        round_intercepts = []
        round_sizes      = []
        round_client_acc = []
        
        for i, client in enumerate(clients):
            coef, intercept, acc = client_train(
                client['X'], client['y'],
                global_coef, global_intercept, n_classes
            )
            round_coefs.append(coef)
            round_intercepts.append(intercept)
            round_sizes.append(client['size'])
            round_client_acc.append(acc)
            client_accs[i].append(acc)
        
        # FedAvg aggregation
        global_coef, global_intercept = fed_avg(
            round_coefs, round_intercepts, round_sizes
        )
        
        # Evaluate
        g_acc = evaluate_global_model(global_coef, global_intercept, X_test, y_test)
        global_accs.append(g_acc)
        
        if fl_round % 5 == 0 or fl_round == 1:
            client_str = " | ".join([f"C{i+1}:{a:.2f}" for i, a in enumerate(round_client_acc)])
            print(f"  {fl_round:>5} | {g_acc:>10.4f} | {client_str:>45}")
    
    return global_accs, client_accs

# =============================================================================
# SECTION 6: RUN FEDAVG ON BOTH SPLITS
# =============================================================================

print("=" * 65)
print("🌐 SECTION 6: Running FedAvg on IID Data")
print("=" * 65)
np.random.seed(42)
iid_global_accs, iid_client_accs = run_fedavg(
    iid_clients, X_test_s, y_test,
    N_FEATURES, N_CLASSES, FL_ROUNDS, label="IID"
)

print()
print("=" * 65)
print("🌐 Running FedAvg on Non-IID Data")
print("=" * 65)
np.random.seed(42)
noniid_global_accs, noniid_client_accs = run_fedavg(
    noniid_clients, X_test_s, y_test,
    N_FEATURES, N_CLASSES, FL_ROUNDS, label="Non-IID"
)

print()
print("=" * 65)
print("📊 SECTION 7: Comparison Summary")
print("=" * 65)
print(f"   IID Final Accuracy    : {iid_global_accs[-1]:.4f}")
print(f"   Non-IID Final Accuracy: {noniid_global_accs[-1]:.4f}")
print(f"   Accuracy Drop (Non-IID): {iid_global_accs[-1] - noniid_global_accs[-1]:+.4f}")
print()

# =============================================================================
# SECTION 7: VISUALIZATIONS
# =============================================================================

print("🎨 Generating Visualizations...")
print()

fig, axes = plt.subplots(2, 3, figsize=(20, 12))
fig.suptitle(
    "IID vs Non-IID Data in Federated Learning — REVA University FDP",
    fontsize=14, fontweight='bold'
)

rounds_x = list(range(1, FL_ROUNDS + 1))
class_labels  = [f'Class {c}' for c in range(N_CLASSES)]
client_labels = [f'Client {i+1}' for i in range(N_CLIENTS)]
colors_class  = ['#E74C3C', '#3498DB', '#2ECC71']

# ---- Row 1, Col 1: IID Client Distribution (Stacked Bar) ----
ax = axes[0, 0]
iid_dist = np.zeros((N_CLIENTS, N_CLASSES))
for i, client in enumerate(iid_clients):
    for c in range(N_CLASSES):
        iid_dist[i, c] = np.sum(client['y'] == c)

bottoms = np.zeros(N_CLIENTS)
for c in range(N_CLASSES):
    ax.bar(client_labels, iid_dist[:, c], bottom=bottoms,
           label=class_labels[c], color=colors_class[c], edgecolor='white')
    bottoms += iid_dist[:, c]
ax.set_title("IID: Class Distribution per Client\n(Balanced — each client has all classes)", fontsize=10, fontweight='bold')
ax.set_ylabel("Number of Samples")
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3, axis='y')

# ---- Row 1, Col 2: Non-IID Client Distribution (Stacked Bar) ----
ax = axes[0, 1]
noniid_dist = np.zeros((N_CLIENTS, N_CLASSES))
for i, client in enumerate(noniid_clients):
    for c in range(N_CLASSES):
        noniid_dist[i, c] = np.sum(client['y'] == c)

bottoms = np.zeros(N_CLIENTS)
for c in range(N_CLASSES):
    ax.bar(client_labels, noniid_dist[:, c], bottom=bottoms,
           label=class_labels[c], color=colors_class[c], edgecolor='white')
    bottoms += noniid_dist[:, c]
ax.set_title("Non-IID: Class Distribution per Client\n(Skewed — each client dominated by few classes)", fontsize=10, fontweight='bold')
ax.set_ylabel("Number of Samples")
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3, axis='y')

# ---- Row 1, Col 3: Global Accuracy Comparison ----
ax = axes[0, 2]
ax.plot(rounds_x, iid_global_accs, 'o-', color='steelblue',
        linewidth=2.5, markersize=5, label='IID Global Accuracy')
ax.plot(rounds_x, noniid_global_accs, 's--', color='tomato',
        linewidth=2.5, markersize=5, label='Non-IID Global Accuracy')
ax.fill_between(rounds_x, iid_global_accs, noniid_global_accs,
                alpha=0.15, color='orange', label='Performance Gap')
ax.set_xlabel("FL Round", fontsize=10)
ax.set_ylabel("Global Test Accuracy", fontsize=10)
ax.set_title("Global Accuracy: IID vs Non-IID\n(Non-IID shows slower convergence)", fontsize=10, fontweight='bold')
ax.legend(fontsize=9)
ax.grid(True, alpha=0.3)

# ---- Row 2, Col 1: IID Per-Client Accuracy ----
ax = axes[1, 0]
colors_c = plt.cm.Set1(np.linspace(0, 1, N_CLIENTS))
for i in range(N_CLIENTS):
    ax.plot(rounds_x, iid_client_accs[i], linewidth=1.5, marker='o',
            markersize=3, color=colors_c[i], label=f'Client {i+1}', alpha=0.8)
ax.set_xlabel("FL Round", fontsize=10)
ax.set_ylabel("Local Training Accuracy", fontsize=10)
ax.set_title("IID: Per-Client Local Accuracy\n(Clients converge together — low variance)", fontsize=10, fontweight='bold')
ax.legend(fontsize=8, loc='lower right')
ax.grid(True, alpha=0.3)

# ---- Row 2, Col 2: Non-IID Per-Client Accuracy ----
ax = axes[1, 1]
for i in range(N_CLIENTS):
    ax.plot(rounds_x, noniid_client_accs[i], linewidth=1.5, marker='s',
            markersize=3, color=colors_c[i], label=f'Client {i+1}', alpha=0.8)
ax.set_xlabel("FL Round", fontsize=10)
ax.set_ylabel("Local Training Accuracy", fontsize=10)
ax.set_title("Non-IID: Per-Client Local Accuracy\n(High variance — clients diverge!)", fontsize=10, fontweight='bold')
ax.legend(fontsize=8, loc='lower right')
ax.grid(True, alpha=0.3)

# ---- Row 2, Col 3: Convergence Speed Bar Chart ----
ax = axes[1, 2]
# Find the round at which each scenario first exceeds a target accuracy
target = 0.55
iid_rounds_to_target    = next((i+1 for i, a in enumerate(iid_global_accs)    if a >= target), FL_ROUNDS)
noniid_rounds_to_target = next((i+1 for i, a in enumerate(noniid_global_accs) if a >= target), FL_ROUNDS)
scenario = ['IID', 'Non-IID']
rounds_to_target = [iid_rounds_to_target, noniid_rounds_to_target]
final_accs = [iid_global_accs[-1], noniid_global_accs[-1]]
bar_colors = ['steelblue', 'tomato']
bars = ax.bar(scenario, final_accs, color=bar_colors, edgecolor='white', width=0.4)
ax.set_ylim(0, 1.1)
ax.set_ylabel("Final Test Accuracy (Round 20)", fontsize=10)
ax.set_title(f"Final Accuracy Comparison\n(IID vs Non-IID after {FL_ROUNDS} rounds)", fontsize=10, fontweight='bold')
for bar, val in zip(bars, final_accs):
    ax.text(bar.get_x() + bar.get_width()/2, val + 0.015,
            f'{val:.3f}', ha='center', va='bottom', fontweight='bold', fontsize=12)
ax.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig("03_iid_vs_noniid_plots.png", dpi=150, bbox_inches='tight')
print("✅ Plot saved as '03_iid_vs_noniid_plots.png'")
plt.show()
print()

# =============================================================================
# SECTION 8: DISCUSSION — WHY NON-IID HURTS FL
# =============================================================================

print("=" * 65)
print("💡 SECTION 8: Why Non-IID Hurts Federated Learning")
print("=" * 65)
print()
print("1. CLIENT DRIFT (Gradient Divergence):")
print("   Each client's gradient ∇L_k points toward its local optimum.")
print("   If clients have different class distributions, ∇L_1, ∇L_2,...")
print("   point in DIFFERENT directions → averaging them is suboptimal.")
print()
print("2. LOSS OF GLOBAL INFORMATION:")
print("   A client with only Class 0 data can't learn to distinguish")
print("   Class 1 from Class 2. Its local model is biased.")
print()
print("3. SLOWER CONVERGENCE:")
print(f"   IID reached target accuracy in ~{iid_rounds_to_target} rounds")
print(f"   Non-IID reached it in ~{noniid_rounds_to_target} rounds (or may not!)")
print()
print("4. LOWER FINAL ACCURACY:")
print(f"   IID final    : {iid_global_accs[-1]:.4f}")
print(f"   Non-IID final: {noniid_global_accs[-1]:.4f}")
print()
print("SOLUTIONS TO NON-IID PROBLEM:")
print("   • FedProx: Adds proximal term to penalize deviation from global model")
print("             min_w F_k(w) + (μ/2)||w - w_global||²")
print("   • SCAFFOLD: Uses control variates to correct client drift")
print("   • FedNova: Normalizes client updates by local step count")
print("   • MOON: Uses contrastive learning to align client representations")
print("   • Clustered FL: Group similar clients together")
print()
print("  → See 04_differential_privacy.py for privacy mechanisms")
print("=" * 65)
