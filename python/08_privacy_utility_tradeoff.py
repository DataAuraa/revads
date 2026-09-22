# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 08_privacy_utility_tradeoff.py
# Topic: Privacy-Utility Tradeoff Analysis in Federated Learning
# Description: Comprehensive sweep of epsilon values showing accuracy vs privacy
#
# Requirements: numpy, scikit-learn, matplotlib
# Google Colab: !pip install numpy scikit-learn matplotlib
# =============================================================================

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

np.random.seed(42)
print("=" * 65)
print("PRIVACY-UTILITY TRADEOFF ANALYSIS")
print("Federated Learning + Differential Privacy")
print("REVA University FDP 2026 | Prof. (Dr.) Anjit Raja R")
print("=" * 65)

# ===== DATASET SETUP =====
X, y = make_classification(n_samples=2000, n_features=20, n_classes=3,
                            n_informative=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
NUM_CLIENTS, NUM_ROUNDS = 5, 12

# ===== DP MECHANISM =====
def gaussian_noise(gradient, epsilon, delta=1e-5, sensitivity=1.0):
    """Add Gaussian noise calibrated to (epsilon, delta)-DP"""
    sigma = np.sqrt(2 * np.log(1.25 / delta)) * sensitivity / epsilon
    return gradient + np.random.normal(0, sigma, gradient.shape)

def privacy_score(epsilon):
    """Normalized privacy score: higher = more private"""
    return min(100, 100 * (1.0 / max(0.01, epsilon)) * 0.5)

def run_fl_epsilon(epsilon, use_dp=True):
    """Run FL simulation with given privacy budget epsilon"""
    chunk = len(X_train) // NUM_CLIENTS
    clients = [{'X': X_train[i*chunk:(i+1)*chunk], 'y': y_train[i*chunk:(i+1)*chunk]}
               for i in range(NUM_CLIENTS)]
    # Initialize global model
    global_coef = None
    global_intercept = None
    for r in range(NUM_ROUNDS):
        client_coefs, client_intercepts, sizes = [], [], []
        for c in clients:
            lm = LogisticRegression(max_iter=300, solver='lbfgs', multi_class='auto', random_state=r)
            lm.fit(c['X'], c['y'])
            coef      = lm.coef_
            intercept = lm.intercept_
            if use_dp and epsilon < 100:
                coef      = gaussian_noise(coef,      epsilon)
                intercept = gaussian_noise(intercept, epsilon)
            client_coefs.append(coef)
            client_intercepts.append(intercept)
            sizes.append(len(c['X']))
        total = sum(sizes)
        global_coef      = sum(c * (s/total) for c, s in zip(client_coefs, sizes))
        global_intercept = sum(i * (s/total) for i, s in zip(client_intercepts, sizes))
    # Evaluate
    global_model = LogisticRegression(max_iter=1, solver='lbfgs', multi_class='auto')
    global_model.fit(X_train[:30], y_train[:30])  # set classes_
    global_model.coef_      = global_coef
    global_model.intercept_ = global_intercept
    return accuracy_score(y_test, global_model.predict(X_test))

# ===== MAIN SWEEP =====
epsilons = [0.05, 0.1, 0.3, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0]
accuracies, privacy_scores = [], []

print(f"\n{'Epsilon':>10} | {'Accuracy':>10} | {'Privacy Score':>14} | {'Recommendation':>20}")
print("-" * 65)

for eps in epsilons:
    acc   = run_fl_epsilon(eps)
    priv  = privacy_score(eps)
    accuracies.append(acc)
    privacy_scores.append(priv)
    if eps < 0.3:
        rec = "🔴 Very strong, low utility"
    elif eps < 1.0:
        rec = "🟡 Strong privacy"
    elif eps < 5.0:
        rec = "🟢 Balanced (recommended)"
    elif eps < 10.0:
        rec = "🟡 Moderate privacy"
    else:
        rec = "🔴 Weak privacy"
    print(f"{eps:>10.2f} | {acc:>10.4f} | {priv:>14.1f} | {rec}")

no_dp_acc = run_fl_epsilon(1000, use_dp=False)
print(f"\n{'No DP':>10} | {no_dp_acc:>10.4f} | {'0.0':>14} | {'No privacy protection':>20}")
print(f"{'Centralized':>10} | {'(run 01_.py)':>10} | {'N/A':>14} | {'Baseline reference':>20}")

# ===== OPTIMAL EPSILON ANALYSIS =====
# Define utility as normalized accuracy, privacy as score
utility_scores = [acc / no_dp_acc for acc in accuracies]
pareto_scores  = [(u + p/100) / 2 for u, p in zip(utility_scores, privacy_scores)]
best_idx = np.argmax(pareto_scores)
best_eps = epsilons[best_idx]
print(f"\n✨ Recommended ε (Pareto optimal): {best_eps}")
print(f"   Accuracy: {accuracies[best_idx]:.4f} | Privacy Score: {privacy_scores[best_idx]:.1f}")

# ===== HEATMAP DATA: epsilon × rounds → accuracy =====
print("\nGenerating heatmap (epsilon × rounds)...")
epsilon_range = [0.5, 1.0, 2.0, 5.0]
rounds_range  = [3, 6, 9, 12]
heatmap = np.zeros((len(epsilon_range), len(rounds_range)))
for i, eps in enumerate(epsilon_range):
    for j, rds in enumerate(rounds_range):
        chunk = len(X_train) // NUM_CLIENTS
        clients = [{'X': X_train[k*chunk:(k+1)*chunk], 'y': y_train[k*chunk:(k+1)*chunk]}
                   for k in range(NUM_CLIENTS)]
        coef_acc = []
        for r in range(rds):
            cc, ci, ss = [], [], []
            for c in clients:
                lm = LogisticRegression(max_iter=200, solver='lbfgs', multi_class='auto', random_state=r)
                lm.fit(c['X'], c['y'])
                c_coef = gaussian_noise(lm.coef_, eps)
                c_int  = gaussian_noise(lm.intercept_, eps)
                cc.append(c_coef); ci.append(c_int); ss.append(len(c['X']))
            total = sum(ss)
            g_coef = sum(c*(s/total) for c,s in zip(cc,ss))
            g_int  = sum(c*(s/total) for c,s in zip(ci,ss))
        gm = LogisticRegression(max_iter=1, solver='lbfgs', multi_class='auto')
        gm.fit(X_train[:30], y_train[:30])
        gm.coef_ = g_coef; gm.intercept_ = g_int
        heatmap[i, j] = accuracy_score(y_test, gm.predict(X_test))
print("Heatmap (rows=epsilon, cols=rounds):")
print("       " + "  ".join(f"R={r}" for r in rounds_range))
for i, eps in enumerate(epsilon_range):
    vals = "  ".join(f"{heatmap[i,j]:.3f}" for j in range(len(rounds_range)))
    print(f"ε={eps:<4}: {vals}")

# ===== VISUALIZATION =====
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Privacy-Utility Tradeoff Analysis in FL\nREVA University FDP 2026 | Prof. (Dr.) Anjit Raja R',
             fontsize=13, fontweight='bold')

# Plot 1: Accuracy vs Epsilon
ax = axes[0, 0]
ax.plot(epsilons, accuracies, 'b-o', linewidth=2.5, markersize=8, zorder=3)
ax.axhline(no_dp_acc, color='green', linestyle='--', linewidth=2, label=f'No DP ({no_dp_acc:.3f})')
ax.axvspan(0.05, 1.0, alpha=0.08, color='red',   label='High Privacy Zone (ε<1)')
ax.axvspan(1.0,  5.0, alpha=0.08, color='yellow', label='Balanced Zone (1≤ε<5)')
ax.axvspan(5.0,  20.0, alpha=0.08, color='green', label='High Utility Zone (ε≥5)')
ax.axvline(best_eps, color='orange', linestyle=':', linewidth=2, label=f'Recommended ε={best_eps}')
ax.set_xscale('log'); ax.set_xlabel('Privacy Budget ε (log scale)', fontsize=11)
ax.set_ylabel('Global Model Accuracy', fontsize=11)
ax.set_title('(a) Accuracy vs Privacy Budget ε')
ax.legend(fontsize=8); ax.grid(alpha=0.3)

# Plot 2: Privacy-Utility Pareto
ax = axes[0, 1]
sc = ax.scatter(utility_scores, [p/100 for p in privacy_scores],
                c=epsilons, cmap='RdYlGn_r', s=100, zorder=3)
for i, (u, p, e) in enumerate(zip(utility_scores, privacy_scores, epsilons)):
    ax.annotate(f'ε={e}', (u, p/100), textcoords='offset points',
                xytext=(5, 5), fontsize=7)
plt.colorbar(sc, ax=ax, label='ε value')
ax.set_xlabel('Utility Score (Normalized Accuracy)', fontsize=11)
ax.set_ylabel('Privacy Score (Normalized)', fontsize=11)
ax.set_title('(b) Privacy-Utility Pareto Frontier')
ax.grid(alpha=0.3)
# Ideal corner
ax.annotate('Ideal\n(top-right)', xy=(0.95, 0.9), fontsize=9, color='blue',
            arrowprops=dict(arrowstyle='->', color='blue'),
            xytext=(0.7, 0.7))

# Plot 3: Accuracy comparison bar
ax = axes[1, 0]
colors_bar = ['#e74c3c' if e < 1 else '#f39c12' if e < 5 else '#2ecc71' for e in epsilons]
bars = ax.bar([str(e) for e in epsilons], accuracies, color=colors_bar, edgecolor='white', linewidth=0.5)
ax.axhline(no_dp_acc, color='green', linestyle='--', linewidth=2, label='No DP Baseline')
ax.bar_label(bars, fmt='%.3f', padding=2, fontsize=7)
legend_patches = [mpatches.Patch(color='#e74c3c', label='High Privacy (ε<1)'),
                  mpatches.Patch(color='#f39c12', label='Balanced (1≤ε<5)'),
                  mpatches.Patch(color='#2ecc71', label='High Utility (ε≥5)')]
ax.legend(handles=legend_patches + [plt.Line2D([0],[0],color='green',linestyle='--',label='No DP')], fontsize=8)
ax.set_xlabel('Privacy Budget ε', fontsize=11); ax.set_ylabel('Accuracy', fontsize=11)
ax.set_title('(c) Accuracy at Different ε Values')
ax.set_ylim([0, 1.1]); ax.grid(axis='y', alpha=0.3)

# Plot 4: Heatmap
ax = axes[1, 1]
im = ax.imshow(heatmap, cmap='YlOrRd', aspect='auto', vmin=0.3, vmax=1.0)
ax.set_xticks(range(len(rounds_range))); ax.set_yticks(range(len(epsilon_range)))
ax.set_xticklabels([f'Rounds={r}' for r in rounds_range])
ax.set_yticklabels([f'ε={e}' for e in epsilon_range])
for i in range(len(epsilon_range)):
    for j in range(len(rounds_range)):
        ax.text(j, i, f'{heatmap[i,j]:.3f}', ha='center', va='center',
                color='white' if heatmap[i,j] < 0.6 else 'black', fontsize=9, fontweight='bold')
plt.colorbar(im, ax=ax, label='Accuracy')
ax.set_title('(d) Heatmap: Accuracy vs ε × Rounds')
ax.set_xlabel('Communication Rounds'); ax.set_ylabel('Privacy Budget ε')

plt.tight_layout()
plt.savefig('privacy_utility_tradeoff.png', dpi=150, bbox_inches='tight')
plt.show()

# ===== CONCLUSION =====
print("\n" + "=" * 65)
print("CONCLUSION & RECOMMENDATIONS")
print("=" * 65)
print(f"""
📊 Key Findings:
   • No DP accuracy:         {no_dp_acc:.4f} ({no_dp_acc*100:.2f}%)
   • ε=0.1 (strong privacy): {accuracies[1]:.4f} ({accuracies[1]*100:.2f}%)
   • ε=1.0 (balanced):       {accuracies[4]:.4f} ({accuracies[4]*100:.2f}%)
   • ε=5.0 (high utility):   {accuracies[6]:.4f} ({accuracies[6]*100:.2f}%)

🏆 Recommended ε: {best_eps} (best privacy-utility balance)

📚 Practical Guidelines:
   ε < 1:  Used in high-stakes applications (medical records, finance)
   1≤ε<10: Common in industry deployments (Google, Apple)
   ε > 10: Provides minimal meaningful privacy protection

⚠️  Disclaimer: This is an educational simulation.
   Real DP requires formal privacy accounting (e.g., Rényi DP,
   moments accountant) and domain-specific sensitivity analysis.
""")
