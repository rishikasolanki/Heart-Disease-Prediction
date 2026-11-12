# Heart Disease Prediction - Week 4 Capstone

## Project goal

Build a reproducible binary classifier that estimates whether a record indicates heart disease. This is a learning project using a public, historical dataset. It is not a clinical diagnostic tool.

## Dataset and target

The included `data/heart_disease_uci.csv` has 920 records from four source cohorts (Cleveland, Hungary, Switzerland, and VA Long Beach) and 16 columns. The target source column is `num`: 0 means no disease and values 1-4 indicate disease/severity. The project converts it to `has_disease = (num > 0)`.

The `id` and `dataset` columns are excluded from predictors because they identify a record or cohort rather than patient characteristics. The remaining 13 fields are used as predictors.

## Workflow

1. Load the CSV and inspect the source schema and missingness.
2. Hold out 20% as the final test set (stratified, seed 42); split the remaining 80% into a model-selection training split (80%) and validation split (20%).
3. Impute numeric values with training-set medians and add missingness indicators; standardize numeric features.
4. Impute categorical values with the training-set mode and one-hot encode categories, ignoring categories unseen at prediction time.
5. Compare logistic regression and a depth-limited decision tree using validation ROC AUC. Refit both candidates on the full 80% development split, then report accuracy, precision, recall, F1, and ROC AUC on the untouched test set.
6. Save a confusion matrix and ROC curves, plus the selected fitted pipeline.

All preprocessing is inside scikit-learn pipelines, so imputation, scaling, and category encoding are fit only on each training split. The comparison chooses the model by validation ROC AUC, before the final test set is used. Class weights are balanced to account for the target distribution.

## Held-out results

| Model | Accuracy | Precision | Recall | F1 | ROC AUC |
|---|---:|---:|---:|---:|---:|
| Logistic Regression | 0.832 | 0.838 | 0.863 | 0.850 | 0.908 |
| Decision Tree | 0.810 | 0.853 | 0.794 | 0.822 | 0.882 |

Validation ROC AUC was 0.870 for logistic regression and 0.815 for the decision tree. The selected model was refit on the full development split before the reported test evaluation.

The confusion matrix for the selected logistic regression model is `[[65, 17], [14, 88]]` with rows as actual `[No disease, Disease]` and columns as predicted `[No disease, Disease]`. At the default 0.5 threshold, 14 of 102 positive test records were missed. Threshold selection should be driven by the intended use and reviewed with domain experts.

These metrics come from one random split and should not be interpreted as a validated estimate of real-world clinical performance. The dataset combines cohorts, has substantial missingness in some fields, and may not represent current populations or clinical workflows. A future study should use cohort-aware validation, calibration, confidence intervals, external validation, and fairness checks.

## Run it

From this folder, install the dependencies and run:

```bash
python -m pip install -r requirements.txt
python train_model.py
```

The run writes `results/model_metrics.csv`, `results/evaluation.json`, a fitted `results/heart_disease_pipeline.joblib`, and two PNG figures under `results/figures/`.

To predict on new rows, preserve the 13 predictor columns in the same names and formats as the input data, load the joblib pipeline, then call `predict` or `predict_proba`. Only load model files from trusted sources.

## Project files

- `train_model.py` - complete, reproducible workflow
- `data/heart_disease_uci.csv` - source data copy for portability
- `results/` - evaluation outputs and model artifact
- `presentation.pptx` - project presentation
