# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 01_centralized_baseline.py
# Topic: Centralized Machine Learning Baseline
# Description: Demonstrates traditional centralized ML training as a baseline
#              before introducing Federated Learning. Covers data generation,
#              model training, evaluation, and privacy implications discussion.
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

# ===== STANDARD LIBRARY IMPORTS =====
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import warnings
warnings.filterwarnings('ignore')  # Suppress convergence warnings for cleaner output

# ===== SCIKIT-LEARN IMPORTS =====
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, learning_curve
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, ConfusionMatrixDisplay)
from sklearn.preprocessing import StandardScaler

# ===== NUMPY RANDOM SEED FOR REPRODUCIBILITY =====
np.random.seed(42)

print("=" * 65)
print("  REVA UNIVERSITY - FDP on Federated Learning")
print("  Module 1: Centralized Machine Learning Baseline")
print("=" * 65)
print()

# =============================================================================
# SECTION 1: WHAT IS CENTRALIZED MACHINE LEARNING?
# =============================================================================
# In traditional (centralized) ML:
#   - ALL data from ALL sources is collected into ONE central server
#   - The model is trained on this aggregated dataset
#   - This gives the BEST possible model performance
#   - BUT: it requires sharing raw, sensitive data (huge privacy risk!)
#
# Example: Training a disease-detection model
#   - Hospitals A, B, C all send patient records to a central data lake
#   - Central server trains one big model
#   - Problem: patient data leaves the hospital — violates HIPAA, GDPR, etc.
#
# Federated Learning solves this by keeping data LOCAL.
# But first, let's see what centralized ML looks like as our BASELINE.
# =============================================================================

print("📚 SECTION 1: Understanding Centralized ML")
print("-" * 50)
print("In centralized ML, ALL data is collected at ONE server.")
print("This achieves the best accuracy but raises serious privacy concerns.")
print()

# =============================================================================
# SECTION 2: GENERATE SYNTHETIC CLASSIFICATION DATASET
# =============================================================================
# We use make_classification to create a realistic synthetic dataset.
# Parameters:
#   n_samples    = 500  → Total number of data points
#   n_features   = 10   → Each sample has 10 features (e.g., medical measurements)
#   n_informative= 6    → 6 features are actually useful for prediction
#   n_redundant  = 2    → 2 features are linear combinations of informative ones
#   n_classes    = 3    → 3 target categories (e.g., disease stages: mild/moderate/severe)
# =============================================================================

print("📊 SECTION 2: Generating Synthetic Dataset")
print("-" * 50)

N_SAMPLES    = 500   # Total data points
N_FEATURES   = 10    # Feature dimensions
N_INFORMATIVE = 6    # Informative features
N_REDUNDANT  = 2     # Redundant features
N_CLASSES    = 3     # Number of output classes
RANDOM_STATE = 42    # For reproducibility

X, y = make_classification(
    n_samples=N_SAMPLES,
    n_features=N_FEATURES,
    n_informative=N_INFORMATIVE,
    n_redundant=N_REDUNDANT,
    n_classes=N_CLASSES,
    n_clusters_per_class=1,
    random_state=RANDOM_STATE
)

print(f"✅ Dataset created successfully!")
print(f"   Total samples : {X.shape[0]}")
print(f"   Features      : {X.shape[1]}")
print(f"   Classes       : {np.unique(y)} (labels: {N_CLASSES} classes)")
print(f"   Class distribution: {dict(zip(*np.unique(y, return_counts=True)))}")
print()

# =============================================================================
# SECTION 3: TRAIN/TEST SPLIT AND PREPROCESSING
# =============================================================================
# Split: 80% training, 20% testing
# StandardScaler: Normalize features to zero mean, unit variance.
# This is important for Logistic Regression to converge well.
# =============================================================================

print("🔀 SECTION 3: Train/Test Split and Preprocessing")
print("-" * 50)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
)

# Feature Scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # Fit on train, transform train
X_test_scaled  = scaler.transform(X_test)        # Transform test using SAME scaler

print(f"   Training samples : {X_train.shape[0]} ({100*len(X_train)//N_SAMPLES}%)")
print(f"   Test samples     : {X_test.shape[0]}  ({100*len(X_test)//N_SAMPLES}%)")
print(f"   Features scaled  : ✅ (StandardScaler applied)")
print()

# =============================================================================
# SECTION 4: TRAIN CENTRALIZED LOGISTIC REGRESSION MODEL
# =============================================================================
# Logistic Regression is a simple, interpretable classification model.
# The model learns a weight (coefficient) for each feature.
# Training on the FULL centralized dataset gives us the BEST possible model.
# This is our gold-standard baseline to compare FL against.
# =============================================================================

print("🏋️  SECTION 4: Training Centralized Logistic Regression")
print("-" * 50)

# max_iter=1000 ensures convergence on this multi-class problem
centralized_model = LogisticRegression(
    max_iter=1000,
    random_state=RANDOM_STATE,
    solver='lbfgs',         # Efficient for small-to-medium datasets
    multi_class='auto'      # Handles multi-class automatically
)

centralized_model.fit(X_train_scaled, y_train)

# Evaluate on test set
y_pred  = centralized_model.predict(X_test_scaled)
test_acc = accuracy_score(y_test, y_pred)
train_acc = accuracy_score(y_train, centralized_model.predict(X_train_scaled))

print(f"   Model           : Logistic Regression (solver=lbfgs)")
print(f"   Training Accuracy : {train_acc:.4f} ({train_acc*100:.2f}%)")
print(f"   Test Accuracy     : {test_acc:.4f}  ({test_acc*100:.2f}%)")
print()
print("📋 Classification Report:")
print(classification_report(y_test, y_pred,
      target_names=['Class 0', 'Class 1', 'Class 2']))

# =============================================================================
# SECTION 5: SIMULATE TRAINING CURVE (Accuracy vs Training Size)
# =============================================================================
# We simulate "rounds" by progressively increasing training data size.
# This shows how the centralized model improves with more data.
# In FL, we'll see how distributing data across clients affects this.
# =============================================================================

print("📈 SECTION 5: Simulating Learning Curve")
print("-" * 50)

# Use sklearn's learning_curve to get accuracy at different training sizes
train_sizes_abs, train_scores, val_scores = learning_curve(
    LogisticRegression(max_iter=1000, random_state=RANDOM_STATE, solver='lbfgs'),
    X_train_scaled, y_train,
    train_sizes=np.linspace(0.1, 1.0, 10),  # 10% to 100% of training data
    cv=5,           # 5-fold cross-validation
    scoring='accuracy',
    n_jobs=-1       # Use all CPU cores
)

# Calculate mean and std for plotting
train_mean = np.mean(train_scores, axis=1)
train_std  = np.std(train_scores, axis=1)
val_mean   = np.mean(val_scores, axis=1)
val_std    = np.std(val_scores, axis=1)

print("   Training sizes and corresponding validation accuracy:")
for size, acc in zip(train_sizes_abs, val_mean):
    bar = "█" * int(acc * 20)
    print(f"   Samples={size:3d} | Acc={acc:.4f} | {bar}")
print()

# =============================================================================
# SECTION 6: PLOTTING
# =============================================================================

print("🎨 SECTION 6: Generating Visualizations")
print("-" * 50)

fig = plt.figure(figsize=(16, 10))
fig.suptitle(
    "Centralized ML Baseline — REVA University FDP on Federated Learning",
    fontsize=14, fontweight='bold', y=0.98
)

gs = gridspec.GridSpec(2, 2, figure=fig, hspace=0.4, wspace=0.35)

# --- Plot 1: Learning Curve ---
ax1 = fig.add_subplot(gs[0, 0])
ax1.plot(train_sizes_abs, train_mean, 'o-', color='steelblue', label='Training Accuracy')
ax1.fill_between(train_sizes_abs, train_mean - train_std, train_mean + train_std,
                 alpha=0.2, color='steelblue')
ax1.plot(train_sizes_abs, val_mean, 's--', color='tomato', label='Validation Accuracy')
ax1.fill_between(train_sizes_abs, val_mean - val_std, val_mean + val_std,
                 alpha=0.2, color='tomato')
ax1.set_xlabel("Number of Training Samples", fontsize=11)
ax1.set_ylabel("Accuracy", fontsize=11)
ax1.set_title("Learning Curve\n(Centralized Model)", fontsize=12, fontweight='bold')
ax1.legend(fontsize=9)
ax1.grid(True, alpha=0.3)
ax1.set_ylim([0.5, 1.05])

# --- Plot 2: Confusion Matrix ---
ax2 = fig.add_subplot(gs[0, 1])
cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm,
                              display_labels=['Class 0', 'Class 1', 'Class 2'])
disp.plot(ax=ax2, colorbar=False, cmap='Blues')
ax2.set_title("Confusion Matrix\n(Centralized Model on Test Set)", fontsize=12, fontweight='bold')

# --- Plot 3: Class Distribution (Pie Chart) ---
ax3 = fig.add_subplot(gs[1, 0])
class_counts = np.bincount(y)
colors_pie   = ['#4CAF50', '#2196F3', '#FF9800']
ax3.pie(class_counts, labels=['Class 0', 'Class 1', 'Class 2'],
        autopct='%1.1f%%', colors=colors_pie, startangle=90,
        wedgeprops={'edgecolor': 'white', 'linewidth': 1.5})
ax3.set_title("Dataset Class Distribution\n(All 500 Samples)", fontsize=12, fontweight='bold')

# --- Plot 4: Accuracy Comparison Bar ---
ax4 = fig.add_subplot(gs[1, 1])
scenarios  = ['Centralized\n(Full Data)', 'Random Guess\n(Baseline)']
accuracies = [test_acc, 1.0 / N_CLASSES]
bar_colors = ['steelblue', 'lightcoral']
bars = ax4.bar(scenarios, accuracies, color=bar_colors, edgecolor='black', width=0.4)
ax4.set_ylim([0, 1.1])
ax4.set_ylabel("Test Accuracy", fontsize=11)
ax4.set_title("Centralized Model vs\nRandom Guess Baseline", fontsize=12, fontweight='bold')
ax4.axhline(y=1.0/N_CLASSES, color='red', linestyle='--', alpha=0.5, label='Random Baseline')
for bar, acc in zip(bars, accuracies):
    ax4.text(bar.get_x() + bar.get_width()/2, acc + 0.02,
             f'{acc:.3f}', ha='center', va='bottom', fontweight='bold', fontsize=11)
ax4.grid(True, alpha=0.3, axis='y')

plt.savefig("01_centralized_baseline_plots.png", dpi=150, bbox_inches='tight')
print("   ✅ Plot saved as '01_centralized_baseline_plots.png'")
plt.show()
print()

# =============================================================================
# SECTION 7: PRIVACY IMPLICATIONS DISCUSSION
# =============================================================================

print("=" * 65)
print("🔒 SECTION 7: Privacy Implications of Centralized ML")
print("=" * 65)
print()
print("In centralized ML, the following privacy risks exist:")
print()
print("  1. DATA EXPOSURE: All raw data is sent to the central server.")
print("     Example: Patient medical records, financial transactions,")
print("     personal messages — all leave the original device/organization.")
print()
print("  2. SINGLE POINT OF FAILURE: If the central server is breached,")
print("     ALL data from ALL sources is compromised at once.")
print()
print("  3. REGULATORY VIOLATIONS: Sharing raw data may violate:")
print("     • GDPR (General Data Protection Regulation — Europe)")
print("     • HIPAA (Health Insurance Portability Act — USA)")
print("     • DPDP Act (Digital Personal Data Protection Act — India)")
print()
print("  4. DATA OWNERSHIP: Organizations may be legally/ethically")
print("     prohibited from sharing their proprietary datasets.")
print()
print("  5. TRUST ISSUES: Clients may not trust the central aggregator")
print("     to handle their data responsibly.")
print()
print("=" * 65)
print("✅ SOLUTION: FEDERATED LEARNING")
print("=" * 65)
print()
print("  Federated Learning keeps data LOCAL on each client device.")
print("  Only MODEL UPDATES (not raw data) are shared with the server.")
print("  The server aggregates updates using algorithms like FedAvg.")
print()
print(f"  📌 Centralized Model Test Accuracy : {test_acc:.4f}")
print(f"  📌 This is our GOLD STANDARD to beat in FL modules!")
print()
print("  → See 02_fedavg_simulation.py for FL implementation")
print("=" * 65)
