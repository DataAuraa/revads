# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 02_fedavg_simulation.py
# Topic: Federated Averaging (FedAvg) from Scratch
# Description: Implements the FedAvg algorithm (McMahan et al., 2017) using
#              scikit-learn LogisticRegression. Shows round-by-round FL training,
#              weight aggregation, and comparison with centralized baseline.
#
# Requirements: numpy, scikit-learn, matplotlib
# Optional: None
#
# For Google Colab:
# !pip install numpy scikit-learn matplotlib
# =============================================================================

# ===== GOOGLE COLAB SETUP =====
# Uncomment the line below if running in Google Colab
# !pip install numpy scikit-learn matplotlib --quiet

import numpy as np
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore')

from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
import copy

np.random.seed(42)

print("=" * 65)
print("  REVA UNIVERSITY - FDP on Federated Learning")
print("  Module 2: Federated Averaging (FedAvg) from Scratch")
print("=" * 65)
print()

# =============================================================================
# SECTION 1: FEDAVG ALGORITHM OVERVIEW
# =============================================================================
# FedAvg was introduced by McMahan et al. in the seminal paper:
# "Communication-Efficient Learning of Deep Networks from Decentralized Data"
# (Google, AISTATS 2017)
#
# The FedAvg algorithm in each round:
#   1. Server sends global model parameters to selected clients
#   2. Each client trains locally on its own data for E local epochs
#   3. Each client sends updated parameters back to the server
#   4. Server computes a WEIGHTED AVERAGE of all client parameters
#      (weighted by each client's dataset size)
#   5. Repeat for R rounds
#
# Mathematical Formula:
#   w_global = Σ (n_k / N) * w_k
#   where:
#     w_global = global model weights after aggregation
#     n_k      = number of samples on client k
#     N        = total samples across all clients
#     w_k      = weights of client k's local model
# =============================================================================

print("📚 SECTION 1: FedAvg Algorithm Overview")
print("-" * 50)
print("FedAvg Formula: w_global = Σ (n_k / N) × w_k")
print("   n_k = client k data size, N = total samples")
print("   w_k = client k model weights")
print()

# =============================================================================
# SECTION 2: GENERATE AND DISTRIBUTE DATASET ACROSS CLIENTS
# =============================================================================

print("📊 SECTION 2: Data Generation & Client Distribution (IID)")
print("-" * 50)

# --- Generate synthetic dataset ---
N_SAMPLES    = 500
N_FEATURES   = 10
N_CLASSES    = 3
N_CLIENTS    = 5    # Number of federated clients (e.g., 5 hospitals)
FL_ROUNDS    = 15   # Number of federated learning rounds
RANDOM_STATE = 42

X, y = make_classification(
    n_samples=N_SAMPLES, n_features=N_FEATURES,
    n_informative=6, n_redundant=2,
    n_classes=N_CLASSES, n_clusters_per_class=1,
    random_state=RANDOM_STATE
)

# --- Split into train/test GLOBALLY ---
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
)

# --- Scale features ---
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# --- IID Split: Randomly distribute training data among N_CLIENTS clients ---
# IID = Independently and Identically Distributed
# Each client gets a random ~equal share of the data
indices = np.random.permutation(len(X_train))
client_indices = np.array_split(indices, N_CLIENTS)  # Split into 5 equal parts

client_data = []
for i, idx in enumerate(client_indices):
    client_data.append({
        'X': X_train_scaled[idx],
        'y': y_train[idx],
        'size': len(idx)
    })
    class_dist = dict(zip(*np.unique(y_train[idx], return_counts=True)))
    print(f"   Client {i+1}: {len(idx)} samples | Class dist: {class_dist}")

print()
print(f"   ✅ {N_CLIENTS} clients created with IID data distribution")
print()

# =============================================================================
# SECTION 3: FEDAVG CORE FUNCTIONS
# =============================================================================

def initialize_global_model(n_features, n_classes, random_state=42):
    """
    Initialize the global model with random weights.
    In real FL, the server initializes this and distributes to all clients.
    
    Returns:
        model: An untrained LogisticRegression model
        coef: Initial coefficient matrix [n_classes, n_features]
        intercept: Initial intercept vector [n_classes]
    """
    np.random.seed(random_state)
    # Initialize with small random weights
    coef      = np.random.randn(n_classes, n_features) * 0.01
    intercept = np.zeros(n_classes)
    return coef, intercept


def set_model_params(model, coef, intercept, X_sample, y_sample, n_classes):
    """
    Set a scikit-learn LogisticRegression model's parameters manually.
    This simulates 'receiving global model weights' on each client.
    
    Note: sklearn requires fitting before we can set parameters,
    so we do a 1-iteration fit first, then overwrite the weights.
    """
    # We need classes_ attribute — do a minimal fit
    model.fit(X_sample, y_sample)
    model.coef_      = coef.copy()
    model.intercept_ = intercept.copy()
    return model


def get_model_params(model):
    """
    Extract model parameters (weights) from a trained sklearn model.
    These are the parameters sent to the server during FL.
    
    Returns:
        coef: Coefficient matrix [n_classes, n_features]
        intercept: Intercept vector [n_classes]
    """
    return model.coef_.copy(), model.intercept_.copy()


def client_local_train(client_id, client_X, client_y, global_coef, global_intercept,
                       n_classes, n_features):
    """
    Simulate local training on a single client.
    
    Steps:
        1. Receive global model parameters from server
        2. Initialize local model with global parameters
        3. Train on local data for several epochs
        4. Return updated local parameters
    
    Args:
        client_id: Client identifier (for logging)
        client_X, client_y: Client's local dataset
        global_coef, global_intercept: Current global model parameters
        
    Returns:
        local_coef, local_intercept: Updated parameters after local training
    """
    # Create a fresh local model
    local_model = LogisticRegression(
        max_iter=100,       # Local epochs (limited to simulate partial training)
        random_state=42,
        solver='lbfgs',
        warm_start=False,
        multi_class='auto'
    )
    
    # Initialize with global model parameters
    local_model = set_model_params(
        local_model, global_coef, global_intercept,
        client_X, client_y, n_classes
    )
    
    # Train on local data (this updates the model parameters)
    local_model.fit(client_X, client_y)
    
    # Extract updated parameters
    local_coef, local_intercept = get_model_params(local_model)
    local_acc = accuracy_score(client_y, local_model.predict(client_X))
    
    return local_coef, local_intercept, local_acc


def fed_avg(global_coef, global_intercept, client_coefs, client_intercepts, client_sizes):
    """
    Federated Averaging: Compute weighted average of client model parameters.
    
    This is the CORE of the FedAvg algorithm.
    The server aggregates all client updates by computing a weighted mean,
    where each client's contribution is proportional to its dataset size.
    
    Formula: w_global = Σ (n_k / N) × w_k
    
    Args:
        global_coef, global_intercept: Current global parameters (unused here, included for clarity)
        client_coefs:      List of coefficient matrices from each client
        client_intercepts: List of intercept vectors from each client
        client_sizes:      List of dataset sizes for each client
        
    Returns:
        new_coef, new_intercept: Aggregated global model parameters
    """
    total_samples = sum(client_sizes)
    
    # Weighted average of coefficients
    new_coef = np.zeros_like(client_coefs[0])
    new_intercept = np.zeros_like(client_intercepts[0])
    
    for k, (coef, intercept, n_k) in enumerate(
            zip(client_coefs, client_intercepts, client_sizes)):
        weight = n_k / total_samples  # Client k's contribution weight
        new_coef      += weight * coef
        new_intercept += weight * intercept
    
    return new_coef, new_intercept

# =============================================================================
# SECTION 4: TRAIN CENTRALIZED BASELINE (for comparison)
# =============================================================================

print("🏋️  SECTION 4: Training Centralized Baseline Model")
print("-" * 50)

centralized_model = LogisticRegression(
    max_iter=1000, random_state=RANDOM_STATE, solver='lbfgs', multi_class='auto'
)
centralized_model.fit(X_train_scaled, y_train)
centralized_acc = accuracy_score(y_test, centralized_model.predict(X_test_scaled))
print(f"   Centralized Model Test Accuracy: {centralized_acc:.4f} ({centralized_acc*100:.2f}%)")
print(f"   (This is the GOLD STANDARD we aim to approach with FL)")
print()

# =============================================================================
# SECTION 5: FEDERATED LEARNING TRAINING LOOP
# =============================================================================

print("🌐 SECTION 5: Federated Learning Training (FedAvg)")
print("-" * 50)
print(f"   Clients: {N_CLIENTS} | Rounds: {FL_ROUNDS}")
print()

# Initialize global model
global_coef, global_intercept = initialize_global_model(N_FEATURES, N_CLASSES)

# Storage for metrics across rounds
global_accuracies   = []
client_accuracies   = {i: [] for i in range(N_CLIENTS)}

print(f"{'Round':>6} | {'Global Acc':>10} | {'Client Accuracies':>40} | {'vs Centralized':>15}")
print("-" * 80)

for fl_round in range(1, FL_ROUNDS + 1):
    # --- Step 1: Each client trains locally using global model params ---
    round_client_coefs       = []
    round_client_intercepts  = []
    round_client_sizes       = []
    round_client_accs        = []
    
    for client_id in range(N_CLIENTS):
        client_X = client_data[client_id]['X']
        client_y = client_data[client_id]['y']
        n_k      = client_data[client_id]['size']
        
        # Client trains locally on its private data
        local_coef, local_intercept, local_acc = client_local_train(
            client_id, client_X, client_y,
            global_coef, global_intercept,
            N_CLASSES, N_FEATURES
        )
        
        round_client_coefs.append(local_coef)
        round_client_intercepts.append(local_intercept)
        round_client_sizes.append(n_k)
        round_client_accs.append(local_acc)
        client_accuracies[client_id].append(local_acc)
    
    # --- Step 2: Server aggregates using FedAvg ---
    global_coef, global_intercept = fed_avg(
        global_coef, global_intercept,
        round_client_coefs, round_client_intercepts, round_client_sizes
    )
    
    # --- Step 3: Evaluate global model on test set ---
    # Build a proxy model with the aggregated weights for evaluation
    eval_model = LogisticRegression(max_iter=1000, random_state=42,
                                    solver='lbfgs', multi_class='auto')
    # Use a minimal sample for initialization
    eval_model.fit(X_test_scaled[:10], y_test[:10])
    eval_model.coef_      = global_coef.copy()
    eval_model.intercept_ = global_intercept.copy()
    global_acc = accuracy_score(y_test, eval_model.predict(X_test_scaled))
    global_accuracies.append(global_acc)
    
    # --- Print progress ---
    client_acc_str = " | ".join([f"C{i+1}:{acc:.3f}" for i, acc in enumerate(round_client_accs)])
    gap = global_acc - centralized_acc
    gap_str = f"{gap:+.4f}"
    print(f"{fl_round:>6} | {global_acc:>10.4f} | {client_acc_str:>40} | {gap_str:>15}")

print()
print(f"   Final FL Global Accuracy  : {global_accuracies[-1]:.4f}")
print(f"   Centralized Accuracy      : {centralized_acc:.4f}")
print(f"   Accuracy Gap              : {global_accuracies[-1] - centralized_acc:+.4f}")
print()

# =============================================================================
# SECTION 6: VISUALIZATIONS
# =============================================================================

print("🎨 SECTION 6: Generating Visualizations")
print("-" * 50)

fig, axes = plt.subplots(1, 3, figsize=(18, 6))
fig.suptitle(
    "FedAvg Simulation — REVA University FDP on Federated Learning",
    fontsize=13, fontweight='bold'
)

rounds_x = list(range(1, FL_ROUNDS + 1))

# --- Plot 1: Global Accuracy vs Rounds ---
ax1 = axes[0]
ax1.plot(rounds_x, global_accuracies, 'o-', color='steelblue',
         linewidth=2.5, markersize=6, label='FL Global Accuracy (FedAvg)')
ax1.axhline(y=centralized_acc, color='tomato', linestyle='--', linewidth=2,
            label=f'Centralized Baseline ({centralized_acc:.3f})')
ax1.fill_between(rounds_x, global_accuracies, centralized_acc,
                 alpha=0.15, color='orange', label='FL-Centralized Gap')
ax1.set_xlabel("Federated Learning Round", fontsize=11)
ax1.set_ylabel("Test Accuracy", fontsize=11)
ax1.set_title("Global Model Accuracy vs FL Rounds\n(FedAvg Aggregation)", fontsize=11, fontweight='bold')
ax1.legend(fontsize=9)
ax1.grid(True, alpha=0.3)
ax1.set_ylim([0.3, 1.05])

# --- Plot 2: Per-Client Accuracy Curves ---
ax2 = axes[1]
colors = plt.cm.Set1(np.linspace(0, 1, N_CLIENTS))
for client_id in range(N_CLIENTS):
    ax2.plot(rounds_x, client_accuracies[client_id],
             marker='o', markersize=4, linewidth=1.5,
             color=colors[client_id], alpha=0.8,
             label=f'Client {client_id+1}')
ax2.axhline(y=centralized_acc, color='black', linestyle='--', linewidth=1.5,
            label='Centralized Baseline', alpha=0.7)
ax2.set_xlabel("Federated Learning Round", fontsize=11)
ax2.set_ylabel("Local Training Accuracy", fontsize=11)
ax2.set_title("Per-Client Local Accuracy vs FL Rounds\n(IID Distribution)", fontsize=11, fontweight='bold')
ax2.legend(fontsize=8, loc='lower right')
ax2.grid(True, alpha=0.3)
ax2.set_ylim([0.3, 1.05])

# --- Plot 3: Accuracy Comparison Bar Chart ---
ax3 = axes[2]
comparison_labels = ['Centralized\n(All Data)', 'FedAvg\n(Round 1)',
                     f'FedAvg\n(Round {FL_ROUNDS//2})', f'FedAvg\n(Round {FL_ROUNDS})']
comparison_values = [centralized_acc, global_accuracies[0],
                     global_accuracies[FL_ROUNDS//2 - 1], global_accuracies[-1]]
bar_colors = ['#E74C3C', '#3498DB', '#27AE60', '#2C3E50']
bars = ax3.bar(comparison_labels, comparison_values, color=bar_colors,
               edgecolor='white', width=0.5)
ax3.set_ylabel("Test Accuracy", fontsize=11)
ax3.set_title("Accuracy Comparison:\nCentralized vs FedAvg Rounds", fontsize=11, fontweight='bold')
ax3.set_ylim([0, 1.1])
for bar, val in zip(bars, comparison_values):
    ax3.text(bar.get_x() + bar.get_width()/2, val + 0.015,
             f'{val:.3f}', ha='center', va='bottom', fontweight='bold', fontsize=10)
ax3.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig("02_fedavg_simulation_plots.png", dpi=150, bbox_inches='tight')
print("   ✅ Plot saved as '02_fedavg_simulation_plots.png'")
plt.show()
print()

# =============================================================================
# SECTION 7: FEDAVG FORMULA VISUALIZATION (Text)
# =============================================================================

print("=" * 65)
print("📐 SECTION 7: FedAvg Formula — Step-by-Step Explanation")
print("=" * 65)
print()
total = sum(client_data[i]['size'] for i in range(N_CLIENTS))
print("FedAvg Weighted Aggregation (Final Round):")
print()
print(f"   Total samples N = {total}")
print()
for i in range(N_CLIENTS):
    n_k = client_data[i]['size']
    w_k = n_k / total
    print(f"   Client {i+1}: n_k = {n_k:3d} | weight (n_k/N) = {w_k:.4f}")
print()
print("   w_global = Σ (n_k / N) × w_k")
print("           = weight₁×w₁ + weight₂×w₂ + ... + weight₅×w₅")
print()
print("   Since all clients have equal data (IID), each weight ≈ 0.20")
print("   → This is simply the arithmetic mean of client weights!")
print()
print("=" * 65)
print("🏆 FINAL RESULTS SUMMARY")
print("=" * 65)
print(f"   Centralized Model Accuracy : {centralized_acc:.4f} ({centralized_acc*100:.2f}%)")
print(f"   FedAvg Final Accuracy      : {global_accuracies[-1]:.4f} ({global_accuracies[-1]*100:.2f}%)")
print(f"   Accuracy Difference        : {global_accuracies[-1]-centralized_acc:+.4f}")
print()
print("  KEY INSIGHT: FedAvg can approach centralized accuracy")
print("  while keeping data PRIVATE on each client!")
print()
print("  → See 03_iid_vs_noniid.py for the impact of non-IID data")
print("=" * 65)
