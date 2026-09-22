# =============================================================================
# REVA UNIVERSITY - FACULTY DEVELOPMENT PROGRAMME
# Federated Learning for Secure and Distributed AI Systems
# 22nd - 26th September 2026
# Resource Person: Prof. (Dr.) Anjit Raja R
# School of Computer Science and Engineering, REVA University, Bengaluru
# =============================================================================
# File: 07_flower_intro.py
# Topic: Introduction to Flower (flwr) Federated Learning Framework
# Description: Conceptual walkthrough + actual Flower code (if installed)
#
# Requirements: numpy, scikit-learn, matplotlib
# Optional: pip install flwr
# Google Colab: !pip install flwr scikit-learn numpy
# =============================================================================

import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from typing import List, Tuple, Dict

np.random.seed(42)

print("=" * 65)
print("INTRODUCTION TO FLOWER (flwr) FEDERATED LEARNING FRAMEWORK")
print("REVA University FDP 2026 | Prof. (Dr.) Anjit Raja R")
print("=" * 65)

# =============================================================================
# MODE A: CONCEPTUAL MINI-FLOWER SIMULATION (always runs)
# =============================================================================
print("\n📌 MODE A: Conceptual Mini-Flower Architecture Simulation")
print("-" * 65)
print("""
Flower (flwr) Architecture:
┌─────────────────────────────────────────────────────────┐
│                    FL SERVER                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Strategy (FedAvg / FedMedian / FedYogi / ...)   │  │
│  │  - configure_fit()    → send config to clients   │  │
│  │  - aggregate_fit()    → combine model updates    │  │
│  │  - configure_evaluate()→ send eval config        │  │
│  │  - aggregate_evaluate()→ combine eval metrics    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           ↕ gRPC Communication ↕
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Client 1 │  │ Client 2 │  │ Client 3 │  │ Client N │
│ fit()    │  │ fit()    │  │ fit()    │  │ fit()    │
│evaluate()│  │evaluate()│  │evaluate()│  │evaluate()│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
Each client has PRIVATE LOCAL DATA — never shared with server
""")

# ===== MINI-FLOWER: Conceptual implementation =====
# This mirrors how Flower works internally

class MiniFlowerClient:
    """
    Conceptual equivalent of fl.client.NumPyClient in Flower.
    Each real client would run this independently on their device.
    """
    def __init__(self, client_id: int, X_train, y_train, X_test, y_test):
        self.client_id = client_id
        self.X_train   = X_train
        self.y_train   = y_train
        self.X_test    = X_test
        self.y_test    = y_test
        self.model     = LogisticRegression(max_iter=500, solver='lbfgs',
                                            multi_class='auto', random_state=42)
        print(f"  ✅ Client {client_id} initialized: {len(X_train)} training samples")

    def get_parameters(self) -> List[np.ndarray]:
        """Return model parameters (equivalent to flower's get_parameters)"""
        try:
            return [self.model.coef_.flatten(), self.model.intercept_]
        except AttributeError:
            return []  # model not yet fitted

    def set_parameters(self, parameters: List[np.ndarray]) -> None:
        """Set model parameters from server (equivalent to flower's set_parameters)"""
        if len(parameters) >= 2:
            self.model.coef_      = parameters[0].reshape(self.model.coef_.shape)
            self.model.intercept_ = parameters[1]

    def fit(self, parameters: List[np.ndarray], config: Dict) -> Tuple:
        """
        Local training — equivalent to flower's NumPyClient.fit()
        Returns: (updated_parameters, num_examples, metrics_dict)
        """
        if parameters:
            try:
                self.set_parameters(parameters)
                self.model.warm_start = True
            except Exception:
                pass
        self.model.fit(self.X_train, self.y_train)
        updated_params = [self.model.coef_.flatten(), self.model.intercept_]
        train_acc = accuracy_score(self.y_train, self.model.predict(self.X_train))
        return updated_params, len(self.X_train), {"train_accuracy": train_acc}

    def evaluate(self, parameters: List[np.ndarray], config: Dict) -> Tuple:
        """
        Local evaluation — equivalent to flower's NumPyClient.evaluate()
        Returns: (loss, num_examples, metrics_dict)
        """
        if parameters:
            try:
                self.set_parameters(parameters)
            except Exception:
                pass
        acc  = accuracy_score(self.y_test, self.model.predict(self.X_test))
        loss = 1.0 - acc  # simplified loss
        return loss, len(self.X_test), {"accuracy": acc}


class MiniFlowerStrategy:
    """
    Conceptual equivalent of flwr.server.strategy.FedAvg.
    Server-side strategy for aggregation and configuration.
    """
    def __init__(self, fraction_fit: float = 1.0, min_clients: int = 2):
        self.fraction_fit = fraction_fit
        self.min_clients  = min_clients

    def configure_fit(self, round_num: int, num_clients: int) -> Dict:
        """Send configuration to clients before fit()"""
        return {"round": round_num, "local_epochs": 5}

    def aggregate_fit(self, results: List[Tuple]) -> List[np.ndarray]:
        """
        FedAvg aggregation of client fit() results.
        results = [(params, num_examples, metrics), ...]
        """
        total_examples = sum(n for _, n, _ in results)
        aggregated = []
        # Weighted average of each parameter array
        for param_idx in range(len(results[0][0])):
            weighted = sum(
                result[0][param_idx] * (result[1] / total_examples)
                for result in results
            )
            aggregated.append(weighted)
        return aggregated

    def aggregate_evaluate(self, results: List[Tuple]) -> Tuple[float, Dict]:
        """Aggregate client evaluation results"""
        total = sum(n for _, n, _ in results)
        agg_loss = sum(loss * (n/total) for loss, n, _ in results)
        agg_acc  = sum(m.get("accuracy", 0) * (n/total) for _, n, m in results)
        return agg_loss, {"accuracy": agg_acc}


class MiniFlowerServer:
    """
    Conceptual equivalent of Flower's internal server loop.
    Orchestrates FL rounds using Strategy and Clients.
    """
    def __init__(self, strategy: MiniFlowerStrategy, num_rounds: int):
        self.strategy   = strategy
        self.num_rounds = num_rounds
        self.clients    = []
        self.history    = {"accuracy": [], "loss": []}

    def add_client(self, client: MiniFlowerClient):
        self.clients.append(client)

    def run(self) -> Dict:
        print(f"\n  🚀 Starting Mini-Flower Server: {len(self.clients)} clients, "
              f"{self.num_rounds} rounds")
        global_params = []
        for round_num in range(1, self.num_rounds + 1):
            # 1. Configure
            config = self.strategy.configure_fit(round_num, len(self.clients))
            # 2. Fit — each client trains locally
            fit_results = []
            for client in self.clients:
                params, n, metrics = client.fit(global_params, config)
                fit_results.append((params, n, metrics))
            # 3. Aggregate
            global_params = self.strategy.aggregate_fit(fit_results)
            # 4. Evaluate
            eval_results = []
            for client in self.clients:
                loss, n, metrics = client.evaluate(global_params, {})
                eval_results.append((loss, n, metrics))
            agg_loss, agg_metrics = self.strategy.aggregate_evaluate(eval_results)
            self.history["accuracy"].append(agg_metrics["accuracy"])
            self.history["loss"].append(agg_loss)
            print(f"  Round {round_num:2d} | Global Accuracy: {agg_metrics['accuracy']:.4f} "
                  f"| Loss: {agg_loss:.4f}")
        return self.history


# ===== RUN MINI-FLOWER SIMULATION =====
print("\nInitializing clients...")
X, y = make_classification(n_samples=1500, n_features=15, n_classes=3, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)

NUM_CLIENTS = 4
chunk = len(X_tr) // NUM_CLIENTS

strategy = MiniFlowerStrategy(fraction_fit=1.0)
server   = MiniFlowerServer(strategy=strategy, num_rounds=8)

for i in range(NUM_CLIENTS):
    Xc = X_tr[i*chunk:(i+1)*chunk]
    yc = y_tr[i*chunk:(i+1)*chunk]
    server.add_client(MiniFlowerClient(i+1, Xc, yc, X_te, y_te))

history = server.run()

print(f"\n  ✅ Final Global Accuracy: {history['accuracy'][-1]:.4f}")

# =============================================================================
# MODE B: ACTUAL FLOWER CODE (runs if flwr is installed)
# =============================================================================
print("\n" + "=" * 65)
print("📌 MODE B: Actual Flower (flwr) Framework")
print("-" * 65)

try:
    import flwr as fl
    print(f"✅ Flower version {fl.__version__} is installed!")
    print("\nActual Flower Client class:")
    print("""
class FlowerClient(fl.client.NumPyClient):
    def __init__(self, model, X_train, y_train, X_test, y_test):
        self.model   = model
        self.X_train = X_train; self.y_train = y_train
        self.X_test  = X_test;  self.y_test  = y_test

    def get_parameters(self, config):
        return [self.model.coef_.flatten(), self.model.intercept_]

    def fit(self, parameters, config):
        self.model.coef_      = parameters[0].reshape(self.model.coef_.shape)
        self.model.intercept_ = parameters[1]
        self.model.fit(self.X_train, self.y_train)
        return self.get_parameters(config={}), len(self.X_train), {}

    def evaluate(self, parameters, config):
        self.model.coef_      = parameters[0].reshape(self.model.coef_.shape)
        self.model.intercept_ = parameters[1]
        acc  = accuracy_score(self.y_test, self.model.predict(self.X_test))
        loss = 1.0 - acc
        return loss, len(self.X_test), {"accuracy": acc}

# To start a client (run in separate terminal):
# fl.client.start_numpy_client(
#     server_address="127.0.0.1:8080",
#     client=FlowerClient(model, X_train, y_train, X_test, y_test)
# )
    """)
    print("\nTo start a Flower server:")
    print("""
import flwr as fl
strategy = fl.server.strategy.FedAvg(
    fraction_fit=1.0,
    min_fit_clients=2,
    min_available_clients=2,
)
fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=5),
    strategy=strategy,
)
    """)

except ImportError:
    print("⚠️  Flower is NOT installed in this environment.")
    print("\nTo install Flower:")
    print("  pip install flwr")
    print("  # or in Colab:")
    print("  !pip install flwr")
    print("\nFlower supports:")
    print("  ✅ PyTorch, TensorFlow, JAX, scikit-learn")
    print("  ✅ Simulation mode (no separate processes needed)")
    print("  ✅ Real distributed training (gRPC)")
    print("  ✅ Privacy (DP, SecAgg) via flower-intelligence")
    print("\nGetting started: https://flower.dev/docs/")

print("\n" + "=" * 65)
print("Summary: Mini-Flower Simulation Accuracy per Round:")
for i, acc in enumerate(history['accuracy'], 1):
    bar = '█' * int(acc * 30)
    print(f"  Round {i:2d}: {bar} {acc:.4f}")
print("=" * 65)
