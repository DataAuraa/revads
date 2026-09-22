# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 05_secure_aggregation_demo.py
# Topic: Secure Aggregation Educational Toy Demonstration
# Description: Demonstrates the concept of Secure Aggregation using additive
#              secret sharing. Shows how the server can sum client gradients
#              without learning individual client contributions.
#
# Requirements: numpy, matplotlib
# Optional: None
#
# For Google Colab:
# !pip install numpy matplotlib
#
# ⚠️  WARNING: This is a TOY DEMONSTRATION for educational purposes only.
#     Real Secure Aggregation (Bonawitz et al., CCS 2017) uses cryptographic
#     primitives (Diffie-Hellman key agreement, secret sharing over finite
#     fields, PRGs) and is far more complex than shown here.
# =============================================================================

# ===== GOOGLE COLAB SETUP =====
# !pip install numpy matplotlib --quiet

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

print("=" * 70)
print("  REVA UNIVERSITY - FDP on Federated Learning")
print("  Module 5: Secure Aggregation — Educational Toy Demonstration")
print("=" * 70)
print()

# =============================================================================
# SECTION 1: WHY SECURE AGGREGATION?
# =============================================================================
# In basic FL:
#   Each client sends their model update (gradient) to the server.
#   The server aggregates all updates and returns the new global model.
#
# PROBLEM: The server sees INDIVIDUAL client updates!
#   - Even without raw data, model updates can LEAK information about
#     individual training samples (via gradient inversion attacks).
#   - A compromised or malicious server can reconstruct private data.
#   - Example: Zhu et al. (2019) "Deep Leakage from Gradients" showed
#     that raw images can be reconstructed from gradients with high fidelity!
#
# SOLUTION: Secure Aggregation
#   - Clients MASK their updates before sending to server
#   - Masks are designed to CANCEL OUT when all updates are summed
#   - Server sees only the AGGREGATE sum, never individual updates
#   - This provides privacy even against a semi-honest (honest-but-curious) server
#
# TWO KEY PROTOCOLS:
#   A) Pairwise Masking (Bonawitz et al., 2017): Clients generate pairwise
#      random masks using Diffie-Hellman key exchange. Masks cancel in pairs.
#   B) Secret Sharing: Each client splits their update into shares,
#      sends one share to each other client. Server gets masked updates.
#
# This demo shows the CORE IDEA using simple additive masks.
# =============================================================================

print("📚 SECTION 1: Why Secure Aggregation?")
print("-" * 60)
print("Problem: Server sees individual gradient updates → privacy risk!")
print("Solution: Clients add masks that CANCEL when summed.")
print("Result  : Server learns ONLY the aggregate, not individual updates.")
print()

# =============================================================================
# SECTION 2: SETUP — THREE CLIENTS WITH PRIVATE GRADIENTS
# =============================================================================
# Setup:
#   - 3 clients (hospitals), each with a private gradient vector
#   - Gradient vector has 5 components (e.g., model parameters)
#   - Goal: Server wants sum(g1 + g2 + g3) without seeing g1, g2, g3 individually

N_CLIENTS   = 3   # Number of FL participants
GRAD_SIZE   = 5   # Size of each gradient vector (5 model parameters)

print("🔧 SECTION 2: Setup — Private Client Gradients")
print("-" * 60)

# Simulate private gradient vectors for each client
# In real FL, these would be the result of local training
true_gradients = {
    'Client_1': np.array([1.5, -0.8,  2.3, 0.4, -1.1]),
    'Client_2': np.array([0.7,  1.2, -0.5, 1.8,  0.3]),
    'Client_3': np.array([-0.3, 0.5, 1.1, -0.7,  0.9]),
}

print("  Private gradients (visible ONLY to each client — NOT to server):")
print()
for client, grad in true_gradients.items():
    print(f"  {client}: {np.array2string(grad, precision=4, separator=', ')}")
print()

# The TRUE aggregate sum (what the server SHOULD receive)
true_sum = sum(true_gradients.values())
print(f"  TRUE SUM (g1+g2+g3): {np.array2string(true_sum, precision=4, separator=', ')}")
print()

# =============================================================================
# SECTION 3: ADDITIVE SECRET SHARING
# =============================================================================
# Secret sharing allows a value to be split into "shares" such that:
#   - Any individual share reveals NOTHING about the original value
#   - Combining ALL shares reconstructs the original value exactly
#
# Simple additive secret sharing for value v into k shares:
#   - Generate (k-1) random values r₁, r₂, ..., r_{k-1}
#   - Last share: r_k = v - r₁ - r₂ - ... - r_{k-1}
#   - Verification: r₁ + r₂ + ... + r_k = v ✓
#
# Security: Each share looks like random noise → no information leakage!

def secret_share(value, num_parties, noise_range=10.0):
    """
    Split a gradient vector into num_parties additive shares.
    
    The shares sum to the original value, but each individual share
    looks like uniformly random noise, revealing nothing about the value.
    
    Args:
        value (np.ndarray): The secret gradient vector to share
        num_parties (int): Number of shares to generate
        noise_range (float): Range of random noise for shares
        
    Returns:
        shares (list of np.ndarray): List of num_parties shares
        
    Verification: sum(shares) == value (exactly, up to float precision)
    """
    shares = []
    
    # Generate (num_parties - 1) random shares
    for _ in range(num_parties - 1):
        random_share = np.random.uniform(-noise_range, noise_range, value.shape)
        shares.append(random_share)
    
    # Last share is computed to ensure shares sum exactly to value
    last_share = value - sum(shares)
    shares.append(last_share)
    
    # Verify correctness
    assert np.allclose(sum(shares), value), "Secret sharing ERROR: shares don't sum to value!"
    
    return shares


def reconstruct_from_shares(shares):
    """
    Reconstruct the original value from all shares.
    Requires ALL shares — partial shares reveal nothing!
    """
    return sum(shares)

# =============================================================================
# SECTION 4: PAIRWISE MASKING PROTOCOL (SIMPLIFIED)
# =============================================================================
# Each client generates pairwise masks with every other client.
# For clients i and j:
#   - Client i adds   mask_ij to their gradient
#   - Client j subtracts mask_ij from their gradient
#   - When server sums all: masks cancel! (+mask_ij) + (-mask_ij) = 0
#
# This is the CORE IDEA behind Bonawitz et al. (2017) SecAgg.

def generate_pairwise_masks(n_clients, grad_size, seed=0):
    """
    Generate pairwise random masks for the secure aggregation protocol.
    
    For each pair (i, j) where i < j:
        mask[i][j] = random vector (client i adds this)
        mask[j][i] = -mask[i][j]  (client j subtracts this)
    
    When all masked gradients are summed:
        Σ_k (g_k + Σ_{j≠k} mask[k][j]) = Σ_k g_k + 0
        (because each mask appears once as + and once as -)
    
    Returns:
        masks (dict): masks[i][j] = mask that client i applies wrt client j
    """
    np.random.seed(seed)
    masks = {i: {} for i in range(n_clients)}
    
    for i in range(n_clients):
        for j in range(i+1, n_clients):
            # Random pairwise mask (normally derived from shared key in real protocol)
            m_ij = np.random.normal(0, 5.0, size=grad_size)
            masks[i][j] = +m_ij   # Client i ADDS this mask
            masks[j][i] = -m_ij   # Client j SUBTRACTS same mask
    
    return masks

# =============================================================================
# SECTION 5: PROTOCOL EXECUTION — STEP BY STEP
# =============================================================================

print("=" * 70)
print("🔐 SECTION 3: Secure Aggregation Protocol Execution")
print("=" * 70)
print()

client_names = list(true_gradients.keys())
n_clients    = len(client_names)

# Step 1: Generate pairwise masks (simulates Diffie-Hellman key exchange)
print("STEP 1: Each pair of clients establishes shared random masks")
print("        (In real protocol: via Diffie-Hellman key exchange + PRG)")
print()

masks = generate_pairwise_masks(n_clients, GRAD_SIZE)

for i in range(n_clients):
    for j in range(n_clients):
        if i != j:
            print(f"   mask[{client_names[i]} → {client_names[j]}]: "
                  f"{np.array2string(masks[i][j], precision=3, separator=', ')}")
print()

# Step 2: Each client masks their gradient
print("STEP 2: Each client computes MASKED gradient = gradient + Σ masks")
print()

masked_gradients = {}

for idx, (client, gradient) in enumerate(true_gradients.items()):
    # Sum all outgoing masks for this client
    mask_sum = np.sum([masks[idx][j] for j in range(n_clients) if j != idx], axis=0)
    masked_grad = gradient + mask_sum
    masked_gradients[client] = masked_grad
    
    print(f"  {client}:")
    print(f"    Private gradient  : {np.array2string(gradient, precision=3, separator=', ')}")
    print(f"    Sum of masks      : {np.array2string(mask_sum, precision=3, separator=', ')}")
    print(f"    MASKED (sent to server): {np.array2string(masked_grad, precision=3, separator=', ')}")
    print()

# Step 3: Server aggregates masked gradients
print("STEP 3: Server sums ALL masked gradients")
print("        (Server sees ONLY these masked values — not the private gradients!)")
print()

server_sum = sum(masked_gradients.values())

print(f"  Server computes: sum of masked gradients =")
print(f"    {np.array2string(server_sum, precision=4, separator=', ')}")
print()

# Step 4: Verify masks cancel
print("STEP 4: Verification — do masks cancel out?")
total_mask_sum = np.zeros(GRAD_SIZE)
for i in range(n_clients):
    for j in range(n_clients):
        if i != j:
            total_mask_sum += masks[i][j]

print(f"  Total sum of all masks: {np.array2string(total_mask_sum, precision=6, separator=', ')}")
print(f"  ≈ Zero vector? {np.allclose(total_mask_sum, 0)}")
print()

# Verify: server_sum should equal true_sum
print("STEP 5: Final Verification")
print()
print(f"  True sum (g1+g2+g3)    : {np.array2string(true_sum, precision=4, separator=', ')}")
print(f"  Server received sum     : {np.array2string(server_sum, precision=4, separator=', ')}")
match = np.allclose(true_sum, server_sum, atol=1e-10)
print(f"  Sums match?             : {'✅ YES — Protocol CORRECT!' if match else '❌ NO — Protocol ERROR!'}")
print()

# =============================================================================
# SECTION 6: DEMONSTRATE SECRET SHARING (ALTERNATE APPROACH)
# =============================================================================

print("=" * 70)
print("🔒 SECTION 4: Additive Secret Sharing Demo")
print("=" * 70)
print()
print("Alternative approach: Client 1 splits its gradient into 3 shares")
print("and sends one share to each participant (including server).")
print()

client1_grad = true_gradients['Client_1']
shares = secret_share(client1_grad, N_CLIENTS, noise_range=10.0)

print(f"  Client 1's TRUE gradient: {np.array2string(client1_grad, precision=4, separator=', ')}")
print()
print("  Secret shares (each looks like random noise to the server):")
for i, share in enumerate(shares):
    print(f"    Share {i+1}: {np.array2string(share, precision=4, separator=', ')}")
print()

reconstructed = reconstruct_from_shares(shares)
print(f"  Reconstructed (Sum of all shares):")
print(f"    {np.array2string(reconstructed, precision=4, separator=', ')}")
print(f"  Reconstruction correct? {np.allclose(client1_grad, reconstructed)}")
print()

# =============================================================================
# SECTION 7: VISUALIZATION
# =============================================================================

print("🎨 SECTION 5: Generating Visualizations")
print("-" * 60)

fig, axes = plt.subplots(2, 3, figsize=(18, 10))
fig.suptitle(
    "Secure Aggregation — REVA University FDP on Federated Learning",
    fontsize=13, fontweight='bold'
)

components = [f'Param {i+1}' for i in range(GRAD_SIZE)]
x_idx = np.arange(GRAD_SIZE)
width = 0.25
colors_clients = ['#3498DB', '#E74C3C', '#2ECC71']

# ---- Plot 1: True Private Gradients ----
ax = axes[0, 0]
for i, (client, grad) in enumerate(true_gradients.items()):
    ax.bar(x_idx + i*width, grad, width, label=client,
           color=colors_clients[i], alpha=0.85, edgecolor='white')
ax.set_xticks(x_idx + width)
ax.set_xticklabels(components, fontsize=9)
ax.set_title("Private Gradients\n(ONLY visible to each client)", fontsize=10, fontweight='bold')
ax.set_ylabel("Gradient Value")
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3, axis='y')
ax.axhline(0, color='black', linewidth=0.8)

# ---- Plot 2: Masked Gradients (What Server Sees) ----
ax = axes[0, 1]
for i, (client, mg) in enumerate(masked_gradients.items()):
    ax.bar(x_idx + i*width, mg, width, label=f'{client} (masked)',
           color=colors_clients[i], alpha=0.85, edgecolor='white', hatch='///')
ax.set_xticks(x_idx + width)
ax.set_xticklabels(components, fontsize=9)
ax.set_title("Masked Gradients\n(What the SERVER sees — looks like noise!)", fontsize=10, fontweight='bold')
ax.set_ylabel("Masked Gradient Value")
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3, axis='y')
ax.axhline(0, color='black', linewidth=0.8)

# ---- Plot 3: Aggregated Result Comparison ----
ax = axes[0, 2]
ax.bar(x_idx - width/2, true_sum, width, label='True Sum (g1+g2+g3)',
       color='steelblue', alpha=0.85, edgecolor='white')
ax.bar(x_idx + width/2, server_sum, width, label='Server Computed Sum',
       color='orange', alpha=0.85, edgecolor='white', hatch='...')
ax.set_xticks(x_idx)
ax.set_xticklabels(components, fontsize=9)
ax.set_title("Aggregation Result\n(True Sum vs Server-computed Sum)", fontsize=10, fontweight='bold')
ax.set_ylabel("Gradient Value")
ax.legend(fontsize=9)
ax.grid(True, alpha=0.3, axis='y')
ax.axhline(0, color='black', linewidth=0.8)

# ---- Plot 4: Secret Sharing Visualization ----
ax = axes[1, 0]
ax.bar(x_idx - width, client1_grad, width, label='Original Gradient',
       color='steelblue', alpha=0.85, edgecolor='white')
for i, share in enumerate(shares):
    ax.bar(x_idx + i*width, share, width, label=f'Share {i+1}',
           color=colors_clients[i], alpha=0.7, edgecolor='white', hatch=['///', '...', 'xxx'][i])
ax.set_xticks(x_idx)
ax.set_xticklabels(components, fontsize=9)
ax.set_title("Secret Sharing: Client 1's Gradient\n(Each share looks like noise!)", fontsize=10, fontweight='bold')
ax.set_ylabel("Value")
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3, axis='y')
ax.axhline(0, color='black', linewidth=0.8)

# ---- Plot 5: Mask Cancellation Bar ----
ax = axes[1, 1]
mask_per_client = []
for i in range(n_clients):
    m = np.sum([masks[i][j] for j in range(n_clients) if j != i], axis=0)
    mask_per_client.append(m)
for i, (mask, name) in enumerate(zip(mask_per_client, client_names)):
    ax.bar(x_idx + i*width, mask, width, label=f'{name} mask sum',
           color=colors_clients[i], alpha=0.7, edgecolor='white')
ax.bar(x_idx + n_clients*width, total_mask_sum, width, label='TOTAL mask sum (≈0)',
       color='black', alpha=0.9, edgecolor='red')
ax.set_xticks(x_idx + width)
ax.set_xticklabels(components, fontsize=9)
ax.set_title("Mask Cancellation\n(Individual masks cancel to ≈ zero)", fontsize=10, fontweight='bold')
ax.set_ylabel("Mask Value")
ax.legend(fontsize=7)
ax.grid(True, alpha=0.3, axis='y')
ax.axhline(0, color='red', linewidth=1.5, linestyle='--', label='Zero line')

# ---- Plot 6: Protocol Diagram (Text-based flow) ----
ax = axes[1, 2]
ax.axis('off')
protocol_text = (
    "SECURE AGGREGATION PROTOCOL\n\n"
    "1. KEY AGREEMENT\n"
    "   Each pair of clients derives\n"
    "   a shared random mask via\n"
    "   Diffie-Hellman key exchange.\n\n"
    "2. MASKING\n"
    "   Client k sends:\n"
    "   g̃_k = g_k + Σ_{j≠k} mask_kj\n\n"
    "3. AGGREGATION\n"
    "   Server computes:\n"
    "   Σ_k g̃_k = Σ_k g_k + 0\n"
    "   (masks cancel pairwise!)\n\n"
    "4. RESULT\n"
    "   Server knows ONLY the sum\n"
    "   of gradients — never individual\n"
    "   client contributions.\n\n"
    "⚠️ TOY DEMO — Real SecAgg uses\n"
    "   Bonawitz et al. (CCS 2017)"
)
ax.text(0.05, 0.95, protocol_text, transform=ax.transAxes,
        fontsize=10, verticalalignment='top', fontfamily='monospace',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='lightyellow', edgecolor='orange', linewidth=2))

plt.tight_layout()
plt.savefig("05_secure_aggregation_plots.png", dpi=150, bbox_inches='tight')
print("   ✅ Plot saved as '05_secure_aggregation_plots.png'")
plt.show()
print()

# =============================================================================
# SECTION 8: LIMITATIONS AND REAL PROTOCOL NOTES
# =============================================================================

print("=" * 70)
print("💡 SECTION 6: Limitations and Real SecAgg Notes")
print("=" * 70)
print()
print("THIS DEMO SIMPLIFICATIONS:")
print("  1. We use floating-point random masks (real: integers mod prime)")
print("  2. Key exchange is simulated (real: Diffie-Hellman + ECDH)")
print("  3. No handling of client dropouts (real: threshold secret sharing)")
print("  4. No authentication of messages (real: digital signatures)")
print("  5. No protection against malicious clients (semi-honest model only)")
print()
print("REAL SECURE AGGREGATION (Bonawitz et al., CCS 2017):")
print("  • Handles DROPOUT: If a client drops, their mask can be recovered")
print("    using threshold secret sharing (Shamir's Secret Sharing)")
print("  • Uses CRYPTOGRAPHIC PSEUDORANDOM GENERATOR (PRG) for masks")
print("  • Communication overhead: O(n²) for n clients")
print("  • Computation overhead: ~constant factor over plain aggregation")
print()
print("ALTERNATIVE APPROACHES:")
print("  • Homomorphic Encryption (HE): Compute on encrypted gradients")
print("    (No need for interaction, but very high computation cost)")
print("  • Trusted Execution Environments (TEE): Intel SGX, ARM TrustZone")
print("  • Multi-Party Computation (MPC): Garbled circuits, SPDZ")
print()
print("WHAT SECAGG DOES NOT PROTECT AGAINST:")
print("  • Inference attacks using the AGGREGATE (see: DP for this!)")
print("  • Collusion between server and some clients")
print("  • Byzantine clients sending malicious updates (see: Byzantine robustness)")
print()
print("KEY TAKEAWAY:")
print("  SecAgg + DP together provide strong privacy guarantees:")
print("  SecAgg: Server can't see individual updates")
print("  DP:     Server can't infer individuals from the aggregate")
print()
print("  → See 06_communication_compression.py for efficiency techniques")
print("=" * 70)
