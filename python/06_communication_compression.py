# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 06_communication_compression.py
# Topic: Communication-Efficient Federated Learning
# Description: Demonstrates gradient compression techniques (Top-K sparsification,
#              quantization, random sparsification) to reduce communication cost
#              in FL. Measures compression ratio, reconstruction error, and
#              cumulative savings over multiple rounds.
#
# Requirements: numpy, matplotlib
# Optional: None
#
# For Google Colab:
# !pip install numpy matplotlib
# =============================================================================

# ===== GOOGLE COLAB SETUP =====
# !pip install numpy matplotlib --quiet

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import sys
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

print("=" * 70)
print("  REVA UNIVERSITY - FDP on Federated Learning")
print("  Module 6: Communication-Efficient Federated Learning")
print("=" * 70)
print()

# =============================================================================
# SECTION 1: COMMUNICATION BOTTLENECK IN FEDERATED LEARNING
# =============================================================================
# In large-scale FL deployments, communication is often the PRIMARY bottleneck:
#
# SCALE OF THE PROBLEM:
#   • GPT-3: ~175 billion parameters × 4 bytes (float32) = 700 GB per update!
#   • ResNet-50: ~25 million parameters × 4 bytes = 100 MB per round
#   • Mobile FL (1,000 clients × 100 rounds × 100 MB) = 10 TB total transfer
#
# CONSTRAINT: FL clients are often on mobile/edge devices with:
#   • Limited bandwidth (3G/4G connections)
#   • High upload/download costs
#   • Battery constraints
#   • Metered data plans
#
# GOAL: Reduce the amount of data transmitted per round WITHOUT
#       significantly hurting model accuracy.
#
# THREE MAIN COMPRESSION STRATEGIES:
#   1. SPARSIFICATION: Transmit only the LARGEST gradients (zero out small ones)
#   2. QUANTIZATION: Reduce numerical precision (float32 → int8 or even 1-bit)
#   3. SKETCHING/RANDOM PROJECTION: Project gradients to lower dimension
#
# Key references:
#   • Lin et al. (2018): "Deep Gradient Compression" — 270-600× compression!
#   • Konečný et al. (2016): "Federated Learning: Strategies for Improving..."
#   • Alistarh et al. (2017): "QSGD — Communication-Efficient SGD via Randomized Quantization"
# =============================================================================

print("📚 SECTION 1: Communication Bottleneck in FL")
print("-" * 60)

# Simulate model sizes for context
model_params = {
    'Logistic Regression (10 features)': 30,
    'Small NN (this demo)': 10_000,
    'ResNet-50': 25_000_000,
    'BERT-Large': 340_000_000,
}

print("  Typical model sizes and their transmission costs:")
print(f"  {'Model':<40} {'Params':>12} {'Size (MB)':>12}")
print(f"  {'-'*65}")
for name, params in model_params.items():
    size_mb = params * 4 / (1024**2)
    print(f"  {name:<40} {params:>12,} {size_mb:>12.4f}")
print()

# =============================================================================
# SECTION 2: SIMULATE A LARGE GRADIENT VECTOR
# =============================================================================
# We simulate a gradient vector with 10,000 parameters (small NN equivalent)
# This allows us to demonstrate compression techniques meaningfully.

N_PARAMS = 10_000  # Simulated number of model parameters

print("📊 SECTION 2: Simulating a Large Gradient Vector")
print("-" * 60)

# Realistic gradient distribution: mostly small values, few large spikes
# This follows the empirical distribution seen in real DNN gradients
gradient_original = np.concatenate([
    np.random.normal(0, 0.01, int(N_PARAMS * 0.9)),    # 90%: small gradients
    np.random.normal(0, 0.3,  int(N_PARAMS * 0.08)),   # 8%: medium gradients
    np.random.normal(0, 2.0,  int(N_PARAMS * 0.02)),   # 2%: large spikes
])
np.random.shuffle(gradient_original)

original_size_bytes  = gradient_original.nbytes  # float64 = 8 bytes per value
original_size_bytes4 = N_PARAMS * 4              # float32 = 4 bytes per value

print(f"   Gradient vector size: {N_PARAMS:,} parameters")
print(f"   Storage (float64)   : {original_size_bytes:,} bytes ({original_size_bytes/1024:.1f} KB)")
print(f"   Storage (float32)   : {original_size_bytes4:,} bytes ({original_size_bytes4/1024:.1f} KB)")
print(f"   Gradient L2 norm    : {np.linalg.norm(gradient_original):.4f}")
print(f"   Gradient Linf norm  : {np.max(np.abs(gradient_original)):.4f}")
print(f"   Sparsity (|g|<0.001): {np.mean(np.abs(gradient_original) < 0.001):.2%}")
print()

# =============================================================================
# SECTION 3: COMPRESSION TECHNIQUE 1 — TOP-K SPARSIFICATION
# =============================================================================

def top_k_sparsification(gradient, k_percent):
    """
    Keep only the TOP k% of gradient values by ABSOLUTE MAGNITUDE.
    Set all other values to zero.
    
    INTUITION: Most gradient components are near zero and contribute
    little to the model update. By transmitting only the LARGEST components,
    we can approximate the full gradient with far less data.
    
    In practice: Only non-zero indices AND values need to be transmitted
    (sparse format), giving significant communication savings.
    
    Args:
        gradient (np.ndarray): Full gradient vector
        k_percent (float): Percentage of values to keep (e.g., 10.0 = top 10%)
    
    Returns:
        sparse_gradient (np.ndarray): Gradient with small values zeroed out
        
    Compression ratio ≈ 100 / k_percent
    Transmission: (index, value) pairs → 2 × k_percent × 8 bytes
    """
    k = max(1, int(len(gradient) * k_percent / 100))
    # Find the threshold magnitude (k-th largest absolute value)
    threshold = np.sort(np.abs(gradient))[-k]
    sparse = gradient.copy()
    sparse[np.abs(sparse) < threshold] = 0.0
    return sparse


def compressed_size_topk(gradient, k_percent):
    """
    Calculate transmission size for Top-K sparse gradient.
    Format: (int32 index, float32 value) pairs → 8 bytes per non-zero entry
    """
    k = max(1, int(len(gradient) * k_percent / 100))
    return k * (4 + 4)  # 4 bytes index + 4 bytes value per element

# =============================================================================
# SECTION 4: COMPRESSION TECHNIQUE 2 — QUANTIZATION
# =============================================================================

def quantize_gradient(gradient, bits=8):
    """
    Simulate gradient quantization to lower bit-width.
    
    Standard gradients use float32 (32 bits per value).
    Quantization maps these to low-bit integers (e.g., int8 = 8 bits),
    reducing storage by 4× compared to float32.
    
    The quantization process:
        1. Find the max absolute value (scale factor)
        2. Scale gradient to fit in [-127, 127] (for int8)
        3. Round to nearest integer
        4. Transmit integers + the scale factor
    
    Dequantization (at server):
        gradient ≈ quantized_int × scale
    
    Args:
        gradient (np.ndarray): Float32 gradient to quantize
        bits (int): Target bit width (8 → int8, 4 → int4)
    
    Returns:
        quantized (np.ndarray): Integer-valued approximation
        scale (float): Scale factor needed for reconstruction
        
    ⚠️  This simulates quantization. True int8 saves 4× vs float32.
    """
    max_val = np.max(np.abs(gradient))
    if max_val == 0:
        return np.zeros_like(gradient, dtype=np.int8), 1.0
    
    # Scale to the integer range: [-2^(bits-1)+1, 2^(bits-1)-1]
    int_max   = 2**(bits - 1) - 1
    scale     = max_val / int_max
    
    # Quantize: scale → round → clip to valid int8 range
    quantized = np.round(gradient / scale).astype(int)
    quantized = np.clip(quantized, -(2**(bits-1)), 2**(bits-1)-1)
    
    if bits == 8:
        quantized = quantized.astype(np.int8)
    else:
        quantized = quantized.astype(np.int16)  # Use int16 for int4 simulation
    
    return quantized, scale


def dequantize_gradient(quantized, scale):
    """Reconstruct approximate gradient from quantized integers."""
    return quantized.astype(np.float64) * scale


def compressed_size_quantized(n_params, bits=8):
    """
    Calculate transmission size for quantized gradient.
    Bytes = n_params × (bits/8) + 4 bytes for the scale factor
    """
    return n_params * (bits // 8) + 4  # +4 for the float32 scale

# =============================================================================
# SECTION 5: COMPRESSION TECHNIQUE 3 — RANDOM SPARSIFICATION
# =============================================================================

def random_sparsification(gradient, k_percent):
    """
    Keep a RANDOM k% subset of gradient values (unbiased estimator).
    
    Unlike Top-K, this randomly selects which values to transmit.
    While Top-K selects the MOST IMPORTANT values, random sparsification
    is an UNBIASED estimator: E[g̃] = g.
    
    This matters for convergence analysis: Top-K is biased,
    random sparsification is unbiased.
    
    In practice: The non-zero values are scaled by 1/(k_percent/100)
    to maintain the correct expected value (importance sampling).
    
    Args:
        gradient: Full gradient vector
        k_percent: Percentage of values to keep
    
    Returns:
        sparse (np.ndarray): Randomly sparsified gradient (unbiased)
    """
    k = max(1, int(len(gradient) * k_percent / 100))
    sparse = np.zeros_like(gradient)
    
    # Randomly select k indices to keep
    selected_indices = np.random.choice(len(gradient), k, replace=False)
    
    # Scale the selected values by 1/p to maintain unbiasedness
    # E[sparse] = (k/n) × (n/k) × g = g ✓
    p = k / len(gradient)
    sparse[selected_indices] = gradient[selected_indices] / p
    
    return sparse

# =============================================================================
# SECTION 6: COMPARE ALL COMPRESSION METHODS
# =============================================================================

print("=" * 70)
print("⚡ SECTION 3: Compression Techniques Comparison")
print("=" * 70)
print()

K_PERCENTAGES = [1, 5, 10, 20, 50]  # Top-k% values to test
BITS_VALUES   = [8, 4]               # Quantization bit-widths

results = []

# --- Baseline (No Compression) ---
baseline_bytes = original_size_bytes4  # float32 baseline
print(f"  {'Method':<30} {'Compressed (B)':>15} {'Ratio':>8} {'MSE':>12} {'PSNR':>8}")
print(f"  {'-'*75}")
print(f"  {'Original (float32)':<30} {baseline_bytes:>15,} {'1.00×':>8} {'0.0000':>12} {'∞':>8}")

for k in K_PERCENTAGES:
    # Top-K
    sparse_topk = top_k_sparsification(gradient_original, k)
    topk_bytes  = compressed_size_topk(gradient_original, k)
    mse_topk    = np.mean((gradient_original - sparse_topk)**2)
    ratio_topk  = baseline_bytes / topk_bytes
    psnr_topk   = 10 * np.log10(np.max(gradient_original**2) / mse_topk) if mse_topk > 0 else float('inf')
    results.append({
        'method': f'Top-{k}% Sparsify', 'bytes': topk_bytes,
        'ratio': ratio_topk, 'mse': mse_topk, 'psnr': psnr_topk, 'k': k
    })
    print(f"  {'Top-' + str(k) + '% Sparsification':<30} {topk_bytes:>15,} {ratio_topk:>7.1f}× {mse_topk:>12.6f} {psnr_topk:>8.2f}")

for bits in BITS_VALUES:
    # Quantization
    q, scale     = quantize_gradient(gradient_original, bits=bits)
    dq           = dequantize_gradient(q, scale)
    quant_bytes  = compressed_size_quantized(N_PARAMS, bits)
    mse_quant    = np.mean((gradient_original - dq)**2)
    ratio_quant  = baseline_bytes / quant_bytes
    psnr_quant   = 10 * np.log10(np.max(gradient_original**2) / mse_quant) if mse_quant > 0 else float('inf')
    results.append({
        'method': f'Quantization (int{bits})', 'bytes': quant_bytes,
        'ratio': ratio_quant, 'mse': mse_quant, 'psnr': psnr_quant, 'k': bits
    })
    print(f"  {'Quantization (int' + str(bits) + ')':<30} {quant_bytes:>15,} {ratio_quant:>7.1f}× {mse_quant:>12.6f} {psnr_quant:>8.2f}")

# Random Sparsification for k=10%
sparse_rand  = random_sparsification(gradient_original, 10)
rand_bytes   = compressed_size_topk(gradient_original, 10)
mse_rand     = np.mean((gradient_original - sparse_rand)**2)
ratio_rand   = baseline_bytes / rand_bytes
psnr_rand    = 10 * np.log10(np.max(gradient_original**2) / mse_rand) if mse_rand > 0 else float('inf')
results.append({
    'method': 'Random Sparse (10%)', 'bytes': rand_bytes,
    'ratio': ratio_rand, 'mse': mse_rand, 'psnr': psnr_rand, 'k': 10
})
print(f"  {'Random Sparse (10%)':<30} {rand_bytes:>15,} {ratio_rand:>7.1f}× {mse_rand:>12.6f} {psnr_rand:>8.2f}")

print()

# =============================================================================
# SECTION 7: CUMULATIVE COMMUNICATION COST OVER FL ROUNDS
# =============================================================================

print("=" * 70)
print("📡 SECTION 4: Cumulative Communication Cost Over 50 FL Rounds")
print("=" * 70)
print()

N_ROUNDS  = 50
N_CLIENTS = 100

# Methods to compare for cumulative analysis
cumulative_methods = {
    'No Compression': {'bytes_per_round': baseline_bytes},
    'Top-10% Sparse': {'bytes_per_round': compressed_size_topk(gradient_original, 10)},
    'Top-1% Sparse' : {'bytes_per_round': compressed_size_topk(gradient_original, 1)},
    'Quantize int8' : {'bytes_per_round': compressed_size_quantized(N_PARAMS, 8)},
    'Quantize int4' : {'bytes_per_round': compressed_size_quantized(N_PARAMS, 4)},
}

print(f"  Clients: {N_CLIENTS}, Rounds: {N_ROUNDS}, Gradient size: {N_PARAMS:,} params")
print()
print(f"  {'Method':<20} {'Per Round (MB)':>15} {'Total 50R (GB)':>15} {'Savings vs None':>15}")
print(f"  {'-'*67}")

baseline_total = N_CLIENTS * N_ROUNDS * cumulative_methods['No Compression']['bytes_per_round']

cum_data = {}
for method, info in cumulative_methods.items():
    total = N_CLIENTS * N_ROUNDS * info['bytes_per_round']
    per_round_mb = (N_CLIENTS * info['bytes_per_round']) / (1024**2)
    total_gb     = total / (1024**3)
    savings_pct  = (1 - total / baseline_total) * 100
    cum_data[method] = {
        'per_round_mb': per_round_mb, 'total_gb': total_gb,
        'savings_pct': savings_pct, 'bytes_per_round': info['bytes_per_round']
    }
    print(f"  {method:<20} {per_round_mb:>15.2f} {total_gb:>15.3f} {savings_pct:>14.1f}%")

print()

# =============================================================================
# SECTION 8: VISUALIZATIONS
# =============================================================================

print("🎨 SECTION 5: Generating Visualizations")
print("-" * 60)

fig = plt.figure(figsize=(20, 12))
fig.suptitle(
    "Communication-Efficient FL — REVA University FDP on Federated Learning",
    fontsize=13, fontweight='bold'
)

gs = gridspec.GridSpec(2, 3, figure=fig, hspace=0.45, wspace=0.38)

# ---- Plot 1: Gradient Distribution ----
ax1 = fig.add_subplot(gs[0, 0])
ax1.hist(gradient_original, bins=100, color='steelblue', alpha=0.8, edgecolor='none')
ax1.set_xlabel("Gradient Value", fontsize=10)
ax1.set_ylabel("Count", fontsize=10)
ax1.set_title("Original Gradient Distribution\n(Heavy-tailed — most values near zero)", fontsize=10, fontweight='bold')
ax1.axvline(0, color='red', linewidth=1.5, linestyle='--')
ax1.grid(True, alpha=0.3)
ax1.set_yscale('log')

# ---- Plot 2: Compression Ratio Bar Chart ----
ax2 = fig.add_subplot(gs[0, 1])
method_names = [r['method'] for r in results]
ratios       = [r['ratio'] for r in results]
bar_colors   = plt.cm.RdYlGn(np.linspace(0.2, 0.8, len(results)))
bars = ax2.barh(method_names, ratios, color=bar_colors, edgecolor='white')
ax2.set_xlabel("Compression Ratio (×)", fontsize=10)
ax2.set_title("Compression Ratios\n(vs float32 baseline)", fontsize=10, fontweight='bold')
ax2.axvline(1, color='red', linewidth=1.5, linestyle='--', label='No compression')
for bar, ratio in zip(bars, ratios):
    ax2.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height()/2,
             f'{ratio:.1f}×', va='center', fontsize=9, fontweight='bold')
ax2.grid(True, alpha=0.3, axis='x')
ax2.set_xlim([0, max(ratios) * 1.25])

# ---- Plot 3: MSE vs Compression Ratio ----
ax3 = fig.add_subplot(gs[0, 2])
topk_results = [r for r in results if 'Sparsify' in r['method'] or 'Sparse' in r['method']]
quant_results = [r for r in results if 'Quant' in r['method']]
ax3.scatter([r['ratio'] for r in topk_results], [r['mse'] for r in topk_results],
            s=100, color='steelblue', marker='o', label='Top-K Sparse', zorder=5)
ax3.scatter([r['ratio'] for r in quant_results], [r['mse'] for r in quant_results],
            s=100, color='tomato', marker='s', label='Quantization', zorder=5)
for r in results:
    ax3.annotate(r['method'].replace(' Sparsification', '').replace('ization', '.'),
                 (r['ratio'], r['mse']), textcoords='offset points',
                 xytext=(4, 4), fontsize=7)
ax3.set_xlabel("Compression Ratio (×)", fontsize=10)
ax3.set_ylabel("Reconstruction MSE", fontsize=10)
ax3.set_title("MSE vs Compression Ratio\n(Bottom-left = ideal: high compression, low error)", fontsize=10, fontweight='bold')
ax3.legend(fontsize=9)
ax3.grid(True, alpha=0.3)
ax3.set_yscale('log')

# ---- Plot 4: Cumulative Communication Cost Over Rounds ----
ax4 = fig.add_subplot(gs[1, :2])
rounds_x = np.arange(1, N_ROUNDS + 1)
cum_colors = ['#E74C3C', '#E67E22', '#F1C40F', '#27AE60', '#2980B9']
for i, (method, data) in enumerate(cum_data.items()):
    cum_cost_gb = [r * N_CLIENTS * data['bytes_per_round'] / (1024**3) for r in rounds_x]
    ax4.plot(rounds_x, cum_cost_gb, linewidth=2.5, label=method,
             color=cum_colors[i], marker='o' if i == 0 else None, markersize=3)
ax4.set_xlabel("FL Round", fontsize=11)
ax4.set_ylabel("Cumulative Communication (GB)\n(100 clients)", fontsize=11)
ax4.set_title(f"Cumulative Communication Cost: 100 Clients × {N_ROUNDS} Rounds\n(Compression dramatically reduces total data transfer)", fontsize=10, fontweight='bold')
ax4.legend(fontsize=9)
ax4.grid(True, alpha=0.3)

# ---- Plot 5: Gradient Comparison (Original vs Compressed) ----
ax5 = fig.add_subplot(gs[1, 2])
show_n = 80
x = np.arange(show_n)
g_slice = gradient_original[:show_n]
topk_10 = top_k_sparsification(gradient_original, 10)[:show_n]
topk_01 = top_k_sparsification(gradient_original, 1)[:show_n]
ax5.plot(x, g_slice, 'b-', linewidth=1.2, alpha=0.8, label='Original')
ax5.plot(x, topk_10, 'g--', linewidth=1.2, alpha=0.8, label='Top-10% Sparse')
ax5.plot(x, topk_01, 'r.', linewidth=0.8, alpha=0.7, label='Top-1% Sparse')
ax5.set_xlabel("Parameter Index (first 80)", fontsize=10)
ax5.set_ylabel("Gradient Value", fontsize=10)
ax5.set_title("Gradient Reconstruction\n(Original vs Sparsified)", fontsize=10, fontweight='bold')
ax5.legend(fontsize=9)
ax5.grid(True, alpha=0.3)
ax5.axhline(0, color='black', linewidth=0.8)

plt.savefig("06_communication_compression_plots.png", dpi=150, bbox_inches='tight')
print("   ✅ Plot saved as '06_communication_compression_plots.png'")
plt.show()
print()

# =============================================================================
# SECTION 9: TOTAL SAVINGS SUMMARY TABLE
# =============================================================================

print("=" * 70)
print("💰 SECTION 6: Total Communication Savings Summary")
print("=" * 70)
print()
print(f"  Scenario: 100 clients × 50 rounds × {N_PARAMS:,} parameters")
print()

baseline_gb = N_CLIENTS * N_ROUNDS * baseline_bytes / (1024**3)
print(f"  {'Method':<25} {'Total Cost (GB)':>16} {'Saved (GB)':>12} {'Saving %':>10}")
print(f"  {'-'*65}")

for method, data in cum_data.items():
    total_gb = N_CLIENTS * N_ROUNDS * data['bytes_per_round'] / (1024**3)
    saved_gb = baseline_gb - total_gb
    pct      = data['savings_pct']
    print(f"  {method:<25} {total_gb:>16.3f} {saved_gb:>12.3f} {pct:>9.1f}%")

print()
print("  KEY INSIGHT: Top-1% sparsification alone saves ~98% of communication!")
print("  Real systems combine multiple techniques for best results:")
print("  • Error Feedback: Accumulate 'missed' gradients across rounds")
print("  • Warm-up: Use full gradients in early rounds, compress later")
print("  • Adaptive K: Increase K for important layers (e.g., final layers)")
print()
print("  RESEARCH RESULTS (Lin et al., Deep Gradient Compression, 2018):")
print("  270× to 600× compression with minimal (<0.3%) accuracy loss!")
print()
print("  → See 07_flower_intro.py for the Flower FL Framework")
print("=" * 70)
