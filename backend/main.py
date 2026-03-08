import numpy as np
import pandas as pd
import joblib
import shap
import lime
import lime.lime_tabular
import os
import sys
import dice_ml

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sklearn.preprocessing import FunctionTransformer

# ------------------------------------------
# Define & Inject Custom Function
# ------------------------------------------

def log_income(X):
    X = X.copy()
    
    if hasattr(X, "columns") and "person_income" in X.columns:
        X["person_income"] = np.log1p(X["person_income"].astype(float))
        
    return X

# Inject into __main__ so joblib can load it
import __main__
setattr(__main__, "log_income", log_income)

# ------------------------------------------
# Initialize FastAPI App
# ------------------------------------------

app = FastAPI(title="Loan Risk Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------
# Load Resources (Pipeline, SHAP, LIME)
# ------------------------------------------

pipeline = None
model = None
shap_explainer = None
lime_explainer = None
feature_names = []

model_path = "loan_pipeline.pkl"
background_data_path = "X_train_transformed.pkl"

print(f"Loading model from: {os.path.abspath(model_path)}")

if os.path.exists(model_path):
    try:
        pipeline = joblib.load(model_path)

        # 1. Initialize DiCE
        train_df = pd.read_csv("loan_data.csv") # Or load from a saved pickle

        d = dice_ml.Data(
            dataframe=train_df,
            continuous_features=[
                'person_age', 
                'person_income', 
                'person_emp_exp', 
                'loan_amnt', 
                'loan_int_rate', 
                'loan_percent_income', 
                'cb_person_cred_hist_length', 
                'credit_score'
            ],
            outcome_name='loan_status'
        )

        # Wrap your sklearn pipeline so DiCE can use it
        m = dice_ml.Model(model=pipeline, backend="sklearn")
        dice_explainer = dice_ml.Dice(d, m, method="random")
        
        # Find the classifier and preprocessor steps
        model = pipeline.named_steps.get("classifier") or pipeline.named_steps.get("xgb") or pipeline.steps[-1][1]
        preprocessor = pipeline.named_steps.get("preprocessor") or pipeline.named_steps.get("columntransformer")
        
        # 1. Initialize SHAP
        shap_explainer = shap.TreeExplainer(model)
        
        # 2. Extract Feature Names
        try:
            feature_names = preprocessor.get_feature_names_out()
            feature_names = [str(n).split("__")[-1] for n in feature_names] # Clean names
        except AttributeError:
            print("Warning: Could not extract feature names from preprocessor.")

        print(f"✅ Pipeline and SHAP loaded successfully!")

        # 3. Initialize LIME
        if os.path.exists(background_data_path):
            X_train_transformed = joblib.load(background_data_path)
            
            # Ensure dense format
            if hasattr(X_train_transformed, "toarray"):
                X_train_transformed = X_train_transformed.toarray()
            elif isinstance(X_train_transformed, pd.DataFrame):
                X_train_transformed = X_train_transformed.values

            lime_explainer = lime.lime_tabular.LimeTabularExplainer(
                training_data=X_train_transformed,
                feature_names=feature_names,
                class_names=['Approved', 'Default'],
                mode='classification'
            )
            print("✅ LIME Explainer loaded successfully!")
        else:
            print(f"⚠️ LIME Disabled: Background data '{background_data_path}' not found.")

    except Exception as e:
        print(f"❌ Error loading pipeline or explainers: {e}")
else:
    print(f"⚠️ Critical: Model file '{model_path}' not found.")

# ------------------------------------------
# Define Input Schema
# ------------------------------------------

class LoanApplication(BaseModel):
    person_age: float
    person_gender: str
    person_education: str
    person_income: float
    person_emp_exp: int
    person_home_ownership: str
    loan_amnt: float
    loan_intent: str
    loan_int_rate: float
    loan_percent_income: float
    cb_person_cred_hist_length: float
    credit_score: int
    previous_loan_defaults_on_file: str

# ------------------------------------------
# Prediction Endpoint
# ------------------------------------------

@app.post("/predict")
async def predict(application: LoanApplication):
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Model pipeline is not loaded.")

    try:
        input_data = application.dict()
        input_df = pd.DataFrame([input_data])

        # ------------------------------------------------
        # 1️⃣ Prediction
        # ------------------------------------------------
        prediction = pipeline.predict(input_df)[0]

        # Class meaning:
        # 0 = Approved
        # 1 = Default / Rejected

        prob_default = float(pipeline.predict_proba(input_df)[0][1])
        prob_approval = float(pipeline.predict_proba(input_df)[0][0])

        loan_status = "Rejected" if prediction == 1 else "Approved"

        # Risk category based on default probability
        if prob_default > 0.6:
            risk_category = "High Risk"
        elif prob_default > 0.3:
            risk_category = "Moderate Risk"
        else:
            risk_category = "Low Risk"

        # ------------------------------------------------
        # 2️⃣ Preprocessing for Explainability
        # ------------------------------------------------
        shap_data = log_income(input_df.copy())

        preprocessor = pipeline.named_steps.get("preprocessor") or \
                       pipeline.named_steps.get("columntransformer")

        processed_data = preprocessor.transform(shap_data)

        if hasattr(processed_data, "toarray"):
            processed_data = processed_data.toarray()
        elif isinstance(processed_data, pd.DataFrame):
            processed_data = processed_data.values

        # ------------------------------------------------
        # 3️⃣ SHAP Explanations
        # ------------------------------------------------
        shap_values = shap_explainer.shap_values(processed_data)

        # For tree models, shap_values[1] corresponds to class 1 (Default)
        if isinstance(shap_values, list):
            shap_instance = shap_values[1][0]  # Explain Default class
        elif len(shap_values.shape) == 3:
            shap_instance = shap_values[0, :, 1]
        else:
            shap_instance = shap_values[0]

        shap_factors = []
        for name, val in zip(feature_names, shap_instance):
            shap_factors.append({
                "feature": name,
                "impact_score": round(float(val), 4),
                "impact_direction": (
                    "Increases Default Risk" if val > 0 else "Supports Approval"
                )
            })

        shap_factors.sort(key=lambda x: abs(x["impact_score"]), reverse=True)

        # ------------------------------------------------
        # 4️⃣ LIME Explanations
        # ------------------------------------------------
        lime_factors = []

        if lime_explainer:
            instance_1d = processed_data[0]

            exp = lime_explainer.explain_instance(
                data_row=instance_1d,
                predict_fn=model.predict_proba,
                num_features=3
            )

            for rule, weight in exp.as_list():
                lime_factors.append({
                    "rule": rule,
                    "weight": round(float(weight), 4),
                    "impact": (
                        "Increases Default Risk" if weight > 0 else "Supports Approval"
                    )
                })

        # ------------------------------------------------
        # 5️⃣ Counterfactuals (Only if Rejected)
        # ------------------------------------------------
        counterfactuals = []

        if prediction == 1:  # Only if rejected
            try:
                dice_exp = dice_explainer.generate_counterfactuals(
                    input_df,
                    total_CFs=2,
                    desired_class=0,  # Want approval
                    features_to_vary=[
                        'loan_amnt',
                        'person_income',
                        'credit_score'
                    ]
                )

                cf_df = dice_exp.cf_examples_list[0].final_cfs_df

                for _, row in cf_df.iterrows():
                    changes = []

                    if row['loan_amnt'] < input_data['loan_amnt']:
                        changes.append(
                            f"Reduce loan amount to ${row['loan_amnt']:,.0f}"
                        )

                    if row['person_income'] > input_data['person_income']:
                        changes.append(
                            f"Increase income to ${row['person_income']:,.0f}"
                        )

                    if row['credit_score'] > input_data['credit_score']:
                        changes.append(
                            f"Improve credit score to {row['credit_score']:.0f}"
                        )

                    if changes:
                        counterfactuals.append(changes)

            except Exception as e:
                print(f"DiCE Error: {e}")

        # ------------------------------------------------
        # 6️⃣ Final Response
        # ------------------------------------------------
        return {
            "loan_status": loan_status,
            "risk_category": risk_category,
            "probability_of_default": f"{prob_default:.2%}",
            "probability_of_approval": f"{prob_approval:.2%}",
            "explanations": {
                "shap_top_factors": shap_factors[:3],
                "lime_rules": lime_factors if lime_factors else "LIME is disabled."
            },
            "action_plan": counterfactuals
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)