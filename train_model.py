"""Reproducible heart disease classification workflow for Week 4 capstone."""

from pathlib import Path
import json

import joblib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    RocCurveDisplay,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier


ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "heart_disease_uci.csv"
OUT = ROOT / "results"
FIGURES = OUT / "figures"
TARGET = "has_disease"
RANDOM_STATE = 42


def build_pipeline(model):
    numeric = ["age", "trestbps", "chol", "thalch", "oldpeak", "ca"]
    categorical = ["sex", "cp", "fbs", "restecg", "exang", "slope", "thal"]

    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median", add_indicator=True)),
        ("scaler", StandardScaler()),
    ])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    prep = ColumnTransformer([
        ("numeric", numeric_pipe, numeric),
        ("categorical", categorical_pipe, categorical),
    ])
    return Pipeline([("preprocess", prep), ("model", model)])


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    FIGURES.mkdir(parents=True, exist_ok=True)

    data = pd.read_csv(DATA_PATH)
    # UCI's num field is 0 for absence and 1-4 for presence/severity.
    y = (data["num"] > 0).astype(int).rename(TARGET)
    # id and dataset are identifiers/source labels, not patient predictors.
    X = data.drop(columns=["id", "dataset", "num"])
    X_trainval, X_test, y_trainval, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=RANDOM_STATE
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_trainval, y_trainval, test_size=0.20, stratify=y_trainval, random_state=RANDOM_STATE
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=2000, class_weight="balanced"),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=5, min_samples_leaf=10, class_weight="balanced", random_state=RANDOM_STATE
        ),
    }
    validation_scores = {}
    for name, estimator in models.items():
        selection_pipe = build_pipeline(estimator)
        selection_pipe.fit(X_train, y_train)
        validation_scores[name] = roc_auc_score(y_val, selection_pipe.predict_proba(X_val)[:, 1])

    rows, fitted = [], {}
    for name, estimator in models.items():
        pipe = build_pipeline(estimator)
        # Refit each candidate on the full 80% development split for final test evaluation.
        pipe.fit(X_trainval, y_trainval)
        pred = pipe.predict(X_test)
        score = pipe.predict_proba(X_test)[:, 1]
        rows.append({
            "model": name,
            "accuracy": accuracy_score(y_test, pred),
            "precision": precision_score(y_test, pred, zero_division=0),
            "recall": recall_score(y_test, pred, zero_division=0),
            "f1": f1_score(y_test, pred, zero_division=0),
            "roc_auc": roc_auc_score(y_test, score),
            "validation_roc_auc": validation_scores[name],
        })
        fitted[name] = (pipe, pred, score)

    metrics = pd.DataFrame(rows).sort_values("validation_roc_auc", ascending=False)
    metrics.to_csv(OUT / "model_metrics.csv", index=False)
    # Select by validation ROC AUC; keep the final test split untouched until evaluation.
    best_name = metrics.iloc[0]["model"]
    best_pipe, best_pred, best_score = fitted[best_name]
    joblib.dump(best_pipe, OUT / "heart_disease_pipeline.joblib")

    report = {
        "dataset_rows": int(len(data)),
        "features_used": list(X.columns),
        "positive_definition": "num > 0",
        "positive_count": int(y.sum()),
        "negative_count": int((y == 0).sum()),
        "development_rows": int(len(X_trainval)),
        "selection_train_rows": int(len(X_train)),
        "validation_rows": int(len(X_val)),
        "test_rows": int(len(X_test)),
        "random_state": RANDOM_STATE,
        "best_model_by_validation_roc_auc": best_name,
        "validation_roc_auc_by_model": validation_scores,
        "best_model_test_metrics": metrics.iloc[0].to_dict(),
        "classification_report": classification_report(
            y_test, best_pred, target_names=["No disease", "Disease"], output_dict=True, zero_division=0
        ),
        "confusion_matrix_labels": ["No disease", "Disease"],
        "confusion_matrix": confusion_matrix(y_test, best_pred).tolist(),
    }
    (OUT / "evaluation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    fig, ax = plt.subplots(figsize=(5.4, 4.6))
    ConfusionMatrixDisplay.from_predictions(
        y_test, best_pred, display_labels=["No disease", "Disease"],
        cmap="Blues", colorbar=False, ax=ax
    )
    ax.set_title(f"Confusion Matrix: {best_name}")
    fig.tight_layout()
    fig.savefig(FIGURES / "confusion_matrix.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(5.4, 4.6))
    for name, (pipe, _, _) in fitted.items():
        RocCurveDisplay.from_estimator(pipe, X_test, y_test, name=name, ax=ax)
    ax.plot([0, 1], [0, 1], linestyle="--", color="#888888", linewidth=1)
    ax.set_title("ROC Curves on Held-out Test Set")
    fig.tight_layout()
    fig.savefig(FIGURES / "roc_curves.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    print(metrics.to_string(index=False, float_format=lambda value: f"{value:.3f}"))
    print(f"Selected by validation ROC AUC: {best_name}")
    print(f"Confusion matrix [[TN, FP], [FN, TP]]: {report['confusion_matrix']}")
    print(f"Outputs saved under: {OUT}")


if __name__ == "__main__":
    main()
