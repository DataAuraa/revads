# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 04_differential_privacy.py
# Topic: Differential Privacy in Federated Learning (DP-SGD concept)
# Description: Implements the Gaussian Mechanism for differential privacy.
#              Shows how adding calibrated noise protects gradients, and
#              visualizes the privacy-utility tradeoff across epsilon values.
#
# Requirements: numpy, scikit-learn, matplotlib
# Optional: None
#
# For Google Colab:
# !pip install numpy scikit-learn matplotlib
#
# ⚠️  WARNING: This is an EDUCATIONAL DEMONSTRATION ONLY.
#     Real DP-FL requires rigorous privacy accounting (e.g., Rényi DP,
#     moments accountant). Do NOT use this in production systems.
# =============================================================================

# ===== GOOGLE COLAB SETUP =====
# !pip install numpy scikit-learn matplotlib --quiet

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
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
print("  Module 4: Differential Privacy in FL")
print("=" * 65)
print()

# =============================================================================
# SECTION 1: WHAT IS DIFFERENTIAL PRIVACY?
# =============================================================================
# Differential Privacy (DP) is a mathematical framework for quantifying
# and limiting the privacy risk of sharing information.
#
# FORMAL DEFINITION (Dwork et al., 2006):
#   A randomized mechanism M satisfies (ε, δ)-DP if, for any two
#   neighboring datasets D and D' (differing in ONE data point), and
#   for any possible output set S:
#
#   P[M(D) ∈ S] ≤ exp(ε) × P[M(D') ∈ S] + δ
#
#   Where:
#     ε (epsilon): Privacy budget — SMALLER = MORE PRIVATE
#                  ε = 0: Perfect privacy (useless model)
#                  ε → ∞: No privacy (full information leak)
#     δ (delta):   Probability of a "catastrophic" privacy failure
#                  Typically set to 1/n² where n = dataset size
#
# INTUITION: If you train a model with DP, an adversary who can see
# the model output cannot reliably determine if Alice's data was in
# the training set or not — privacy is GUARANTEED mathematically.
#
# IN FEDERATED LEARNING:
#   Each client adds noise to their LOCAL GRADIENT before sending to server.
#   This protects individual data points from being reconstructed
#   even if the server is "honest but curious."
# =============================================================================

print("📚 SECTION 1: Differential Privacy Theory")
print("-" * 50)
print("(ε, δ)-DP: P[M(D) ∈ S] ≤ exp(ε)·P[M(D') ∈ S] + δ")
print()
print("  ε (epsilon) = Privacy Budget")
print("    Small ε → Strong privacy, more noise, lower accuracy")
print("    Large ε → Weak privacy, less noise, higher accuracy")
print()
print("  δ (delta) = Failure Probability (typically 1/n²)")
print()

# =============================================================================
# SECTION 2: GAUSSIAN MECHANISM IMPLEMENTATION
# =============================================================================
# The GAUSSIAN MECHANISM adds zero-mean Gaussian noise to a function's output.
#
# For a function f with L2-sensitivity Δf:
#   Noise standard deviation: σ = sqrt(2·ln(1.25/δ)) · Δf / ε
#
# Sensitivity Δf = max change in f when one data point is added/removed
# For gradient clipping (norm bound C): Δf = C
#
# DP-SGD (Song et al., 2013; Abadi et al., 2016) applies:
#   1. Clip each per-sample gradient to norm C
#   2. Add Gaussian noise N(0, σ²) to the sum of clipped gradients
# =============================================================================

def add_gaussian_noise(gradients, epsilon, delta, sensitivity=1.0):
    """
    Add Gaussian noise to gradients for (epsilon, delta)-differential privacy.
    
    This implements the GAUSSIAN MECHANISM from differential privacy theory.
    
    The noise scale is calibrated so the mechanism satisfies (ε, δ)-DP:
        σ = sqrt(2 · ln(1.25/δ)) · sensitivity / ε
    
    Args:
        gradients (np.ndarray): The gradient vector to protect
        epsilon (float): Privacy budget. Smaller = more private.
                         Typical values: 0.1 (very private) to 10.0 (weak)
        delta (float): Failure probability. Typically 1/n² or 1e-5.
        sensitivity (float): L2-sensitivity of the gradient function.
                             After gradient clipping to norm C, sensitivity = C.
    
    Returns:
        noisy_gradients (np.ndarray): Privacy-protected gradient
        sigma (float): The noise standard deviation used
    
    ⚠️  Educational demo — real DP requires per-sample gradient clipping!
    """
    # Noise standard deviation from the Gaussian mechanism formula
    sigma = np.sqrt(2 * np.log(1.25 / delta)) * sensitivity / epsilon
    
    # Sample zero-mean Gaussian noise
    noise = np.random.normal(loc=0.0, scale=sigma, size=gradients.shape)
    
    # Add noise to gradients (this is what the client sends to server)
    noisy_gradients = gradients + noise
    
    return noisy_gradients, sigma


def clip_gradient(gradient, clip_norm=1.0):
    """
    Clip gradient to have L2-norm ≤ clip_norm.
    
    This BOUNDS the sensitivity of the gradient, which is required
    before adding calibrated noise. Without clipping, a single
    extreme data point could dominate the gradient → sensitivity → ∞.
    
    In DP-SGD:
        g̃ = g / max(1, ||g||₂ / C)    where C = clip_norm
    """
    current_norm = np.linalg.norm(gradient)
    if current_norm > clip_norm:
        gradient = gradient * (clip_norm / current_norm)
    return gradient

# =============================================================================
# SECTION 3: DATASET AND BASELINE MODEL
# =============================================================================

print("📊 SECTION 2: Dataset Generation and Baseline")
print("-" * 50)

N_SAMPLES  = 500
N_FEATURES = 10
N_CLASSES  = 3

X, y = make_classification(
    n_samples=N_SAMPLES, n_features=N_FEATURES,
    n_informative=6, n_redundant=2,
    n_classes=N_CLASSES, n_clusters_per_class=1, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

# Train a non-private baseline model
baseline_model = LogisticRegression(max_iter=1000, random_state=42,
                                    solver='lbfgs', multi_class='auto')
baseline_model.fit(X_train_s, y_train)
baseline_acc = accuracy_score(y_test, baseline_model.predict(X_test_s))
baseline_grad = baseline_model.coef_.flatten()

print(f"   Baseline (No DP) Test Accuracy: {baseline_acc:.4f}")
print(f"   Gradient shape: {baseline_model.coef_.shape} → flattened: {baseline_grad.shape}")
print(f"   Gradient L2-norm: {np.linalg.norm(baseline_grad):.4f}")
print()

# =============================================================================
# SECTION 4: EXTRACT GRADIENTS VIA PERTURBATION SIMULATION
# =============================================================================
# We simulate gradient extraction by comparing model coefficients
# before and after a single optimization step (gradient approximation).
# In real DP-SGD, gradients are computed per-sample via backprop.

def get_simulated_gradient(X, y, model):
    """
    Approximate gradient as the model's coefficient vector.
    (Simplified: treats coefficients as the gradient for demonstration.)
    In practice: gradient = ∂L/∂w computed via backpropagation.
    """
    gradient = model.coef_.flatten()
    # Clip gradient before adding noise (standard DP-SGD step)
    gradient = clip_gradient(gradient, clip_norm=1.0)
    return gradient

gradient_clean = get_simulated_gradient(X_train_s, y_train, baseline_model)
print(f"   Clipped gradient norm: {np.linalg.norm(gradient_clean):.4f} (≤ 1.0)")
print()

# =============================================================================
# SECTION 5: EPSILON SWEEP — PRIVACY-UTILITY TRADEOFF
# =============================================================================

print("=" * 65)
print("🔐 SECTION 3: Epsilon Sweep — Privacy vs Utility Tradeoff")
print("=" * 65)
print()

EPSILON_VALUES = [0.1, 0.5, 1.0, 2.0, 5.0]
DELTA          = 1e-5       # Common choice: 1/n² ≈ 1e-5 for 500 samples
SENSITIVITY    = 1.0        # Guaranteed by gradient clipping to norm=1
N_TRIALS       = 10         # Average over multiple noise realizations for stability

print(f"{'Epsilon':>8} | {'Sigma (σ)':>10} | {'Avg Accuracy':>13} | {'Acc Drop':>10} | {'Privacy Level':>15}")
print("-" * 65)

epsilon_results = {}

for epsilon in EPSILON_VALUES:
    trial_accs = []
    
    for trial in range(N_TRIALS):
        # Add DP noise to gradient
        noisy_grad, sigma = add_gaussian_noise(
            gradient_clean, epsilon, DELTA, SENSITIVITY
        )
        
        # Reshape noisy gradient back to coefficient matrix shape
        noisy_coef = noisy_grad.reshape(baseline_model.coef_.shape)
        
        # Build a model using the noisy coefficients
        dp_model = LogisticRegression(max_iter=1000, random_state=42,
                                      solver='lbfgs', multi_class='auto')
        # Initialize sklearn model structure
        dp_model.fit(X_train_s[:20], y_train[:20])
        dp_model.coef_      = noisy_coef.copy()
        dp_model.intercept_ = baseline_model.intercept_.copy()
        
        # Evaluate on test set
        acc = accuracy_score(y_test, dp_model.predict(X_test_s))
        trial_accs.append(acc)
    
    avg_acc   = np.mean(trial_accs)
    acc_drop  = baseline_acc - avg_acc
    
    # Qualitative privacy rating
    if epsilon < 0.3:
        privacy_level = "🟢 Very Strong"
    elif epsilon < 1.0:
        privacy_level = "🟡 Strong"
    elif epsilon < 3.0:
        privacy_level = "🟠 Moderate"
    else:
        privacy_level = "🔴 Weak"
    
    epsilon_results[epsilon] = {
        'sigma': sigma, 'avg_acc': avg_acc, 'acc_drop': acc_drop,
        'privacy_level': privacy_level
    }
    
    print(f"{epsilon:>8.1f} | {sigma:>10.4f} | {avg_acc:>13.4f} | {-acc_drop:>+10.4f} | {privacy_level:>15}")

print()
print(f"   Baseline (No DP, ε=∞): {baseline_acc:.4f}")
print()

# =============================================================================
# SECTION 6: VISUALIZATIONS
# =============================================================================

print("🎨 SECTION 4: Generating Visualizations")
print("-" * 50)

fig = plt.figure(figsize=(18, 11))
fig.suptitle(
    "Differential Privacy in Federated Learning — REVA University FDP",
    fontsize=13, fontweight='bold'
)

gs = gridspec.GridSpec(2, 3, figure=fig, hspace=0.45, wspace=0.35)

epsilons   = EPSILON_VALUES + [float('inf')]
accuracies = [epsilon_results[e]['avg_acc'] for e in EPSILON_VALUES] + [baseline_acc]
sigmas     = [epsilon_results[e]['sigma'] for e in EPSILON_VALUES] + [0.0]

# ---- Plot 1: Epsilon vs Accuracy (Privacy-Utility Tradeoff) ----
ax1 = fig.add_subplot(gs[0, :2])
ax1.plot(EPSILON_VALUES, [epsilon_results[e]['avg_acc'] for e in EPSILON_VALUES],
         'o-', color='steelblue', linewidth=2.5, markersize=8, label='DP Model Accuracy')
ax1.axhline(y=baseline_acc, color='tomato', linestyle='--', linewidth=2,
            label=f'No DP Baseline ({baseline_acc:.3f})')
ax1.fill_between([0, 1], 0, 1, alpha=0.08, color='green',
                 transform=ax1.get_xaxis_transform(), label='Strong Privacy (ε<1)')
ax1.fill_between([1, 3], 0, 1, alpha=0.08, color='orange',
                 transform=ax1.get_xaxis_transform(), label='Moderate Privacy (1<ε<3)')
ax1.fill_between([3, max(EPSILON_VALUES)+0.5], 0, 1, alpha=0.08, color='red',
                 transform=ax1.get_xaxis_transform(), label='Weak Privacy (ε>3)')
ax1.set_xlabel("Privacy Budget (ε — Epsilon)", fontsize=11)
ax1.set_ylabel("Test Accuracy", fontsize=11)
ax1.set_title("Privacy-Utility Tradeoff\nSmall ε = Better Privacy, Lower Accuracy", fontsize=11, fontweight='bold')
ax1.legend(fontsize=9, loc='lower right')
ax1.grid(True, alpha=0.3)
ax1.set_xlim([0, max(EPSILON_VALUES) + 0.3])
ax1.set_ylim([0, 1.05])

# ---- Plot 2: Sigma vs Epsilon ----
ax2 = fig.add_subplot(gs[0, 2])
ax2.plot(EPSILON_VALUES, [epsilon_results[e]['sigma'] for e in EPSILON_VALUES],
         's-', color='purple', linewidth=2.5, markersize=8)
ax2.set_xlabel("Privacy Budget (ε)", fontsize=11)
ax2.set_ylabel("Noise Std (σ)", fontsize=11)
ax2.set_title("Noise Scale vs Epsilon\nSmaller ε → More Noise Added", fontsize=11, fontweight='bold')
ax2.grid(True, alpha=0.3)
ax2.fill_between(EPSILON_VALUES, [epsilon_results[e]['sigma'] for e in EPSILON_VALUES],
                 alpha=0.2, color='purple')

# ---- Plot 3: Gradient Comparison for ε=0.5 ----
ax3 = fig.add_subplot(gs[1, 0])
show_n = 15  # Show first 15 gradient components
grad_slice = gradient_clean[:show_n]
noisy_05, _ = add_gaussian_noise(gradient_clean, 0.5, DELTA, SENSITIVITY)
noisy_20, _ = add_gaussian_noise(gradient_clean, 2.0, DELTA, SENSITIVITY)
x_idx = np.arange(show_n)
width = 0.25
ax3.bar(x_idx - width, grad_slice, width, label='Original', color='steelblue', alpha=0.8)
ax3.bar(x_idx, noisy_05[:show_n], width, label='ε=0.5 (Strong DP)', color='tomato', alpha=0.8)
ax3.bar(x_idx + width, noisy_20[:show_n], width, label='ε=2.0 (Moderate DP)', color='green', alpha=0.8)
ax3.set_xlabel("Gradient Component Index", fontsize=10)
ax3.set_ylabel("Gradient Value", fontsize=10)
ax3.set_title("Original vs Noisy Gradients\n(First 15 components)", fontsize=10, fontweight='bold')
ax3.legend(fontsize=8)
ax3.grid(True, alpha=0.3, axis='y')

# ---- Plot 4: Accuracy Bar Chart per Epsilon ----
ax4 = fig.add_subplot(gs[1, 1])
all_labels = [f'ε={e}' for e in EPSILON_VALUES] + ['No DP\n(ε=∞)']
all_accs   = [epsilon_results[e]['avg_acc'] for e in EPSILON_VALUES] + [baseline_acc]
bar_colors = ['#2ECC71', '#27AE60', '#F39C12', '#E67E22', '#E74C3C', '#8E44AD']
bars = ax4.bar(all_labels, all_accs, color=bar_colors, edgecolor='white')
ax4.set_ylabel("Test Accuracy", fontsize=10)
ax4.set_title("Accuracy at Different\nPrivacy Budgets (ε)", fontsize=10, fontweight='bold')
ax4.set_ylim([0, 1.1])
for bar, val in zip(bars, all_accs):
    ax4.text(bar.get_x() + bar.get_width()/2, val + 0.015,
             f'{val:.3f}', ha='center', va='bottom', fontweight='bold', fontsize=9)
ax4.grid(True, alpha=0.3, axis='y')

# ---- Plot 5: Privacy Score vs Utility Score (Pareto) ----
ax5 = fig.add_subplot(gs[1, 2])
# Normalize privacy score: higher for smaller epsilon
max_eps       = max(EPSILON_VALUES)
privacy_scores = [1 - (e / (max_eps + 1)) for e in EPSILON_VALUES]
utility_scores = [epsilon_results[e]['avg_acc'] / baseline_acc for e in EPSILON_VALUES]
scatter = ax5.scatter(privacy_scores, utility_scores,
                      c=EPSILON_VALUES, cmap='RdYlGn_r', s=200,
                      edgecolors='black', linewidth=1.5, zorder=5)
for i, (ps, us, eps) in enumerate(zip(privacy_scores, utility_scores, EPSILON_VALUES)):
    ax5.annotate(f'ε={eps}', (ps, us), textcoords='offset points',
                 xytext=(8, 5), fontsize=9, fontweight='bold')
ax5.set_xlabel("Privacy Score (Higher = More Private)", fontsize=10)
ax5.set_ylabel("Utility Score (Acc / Baseline Acc)", fontsize=10)
ax5.set_title("Privacy Score vs Utility Score\n(Pareto Frontier)", fontsize=10, fontweight='bold')
ax5.grid(True, alpha=0.3)
plt.colorbar(scatter, ax=ax5, label='Epsilon (ε)')

plt.savefig("04_differential_privacy_plots.png", dpi=150, bbox_inches='tight')
print("   ✅ Plot saved as '04_differential_privacy_plots.png'")
plt.show()
print()

# =============================================================================
# SECTION 7: KEY INSIGHTS AND WARNINGS
# =============================================================================

print("=" * 65)
print("💡 SECTION 5: Key Insights & Important Warnings")
print("=" * 65)
print()
print("MATHEMATICAL RELATIONSHIP:")
print(f"   σ = sqrt(2·ln(1.25/δ)) · Δf / ε")
print(f"   With δ={DELTA}, Δf={SENSITIVITY}:")
for eps in EPSILON_VALUES:
    sigma = np.sqrt(2 * np.log(1.25 / DELTA)) * SENSITIVITY / eps
    print(f"   ε={eps:.1f} → σ = {sigma:.4f}")
print()
print("PRACTICAL EPSILON GUIDELINES:")
print("   ε < 1   : Strong privacy (recommended for sensitive medical data)")
print("   1 ≤ ε < 10 : Moderate privacy (common in industry deployments)")
print("   ε ≥ 10  : Weak privacy (often not considered 'truly private')")
print("   ε = ∞   : No privacy (standard ML — no DP noise)")
print()
print("⚠️  CRITICAL WARNINGS (Educational Demo Limitations):")
print("   1. We apply noise to AGGREGATE gradients, not per-sample gradients.")
print("      Real DP-SGD clips and noises PER-SAMPLE gradients.")
print("   2. Privacy accounting (moments accountant, Rényi DP) not implemented.")
print("      Total privacy loss across many rounds must be tracked carefully.")
print("   3. The sensitivity bound Δf=1.0 is assumed — not computed rigorously.")
print("   4. Real deployments use libraries: TensorFlow Privacy, Opacus (PyTorch).")
print()
print("RECOMMENDED READING:")
print("   • Dwork et al. (2006): 'Calibrating Noise to Sensitivity in Private Data Analysis'")
print("   • Abadi et al. (2016): 'Deep Learning with Differential Privacy' (DP-SGD)")
print("   • McMahan et al. (2018): 'Learning Differentially Private Recurrent Language Models'")
print()
print("  → See 05_secure_aggregation_demo.py for complementary privacy technique")
print("=" * 65)
