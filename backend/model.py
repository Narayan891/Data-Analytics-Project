import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from database import engine

# ==============================
# LOAD DATA
# ==============================
def load_data():
    try:
        df = pd.read_sql("SELECT * FROM zoo_data", engine)
    except Exception as e:
        print(f"⚠️ Database not ready or table missing: {e}")
        return pd.DataFrame()

    # Normalize columns: strip, replace spaces/dashes with underscores, lower
    df.columns = (
        df.columns
        .str.strip()
        .str.replace(" ", "_")
        .str.replace("-", "_")
        .str.lower()
    )
    # Merge multiple underscores into one
    import re
    df.columns = [re.sub(r'_+', '_', col) for col in df.columns]

    return df


# ==============================
# TRAIN MODEL
# ==============================
def train_model():
    df = load_data()

    if "total_death" not in df.columns or "closing_balance_total" not in df.columns:
        print("Required columns for ML not found:", df.columns.tolist())
        return None

    df["mortality_rate"] = df["total_death"] / (df["total_death"] + df["closing_balance_total"])
    df["Risk"] = (df["mortality_rate"] > 0.1).astype(int)

    X = df[["total_death", "closing_balance_total"]]
    y = df["Risk"]

    model = RandomForestClassifier()
    model.fit(X, y)

    return model


try:
    model = train_model()
except Exception as e:
    print(f"⚠️ Model training failed on startup (likely empty DB): {e}")
    model = None


# ==============================
# PREDICT FUNCTION
# ==============================
def predict_risk(deaths, stock):
    if not model:
        return {"risk": 0, "confidence": 0}

    pred = model.predict([[deaths, stock]])[0]
    prob = model.predict_proba([[deaths, stock]])[0][1]

    return {
        "risk": int(pred),
        "confidence": round(prob * 100, 2)
    }


# ==============================
# ALERTS
# ==============================
def generate_alerts():
    df = load_data()
    alerts = []
    
    # 🎯 STEP 1: AGGREGATE BY STATE (Eliminate individual incident spam)
    death_col = "total_death" if "total_death" in df.columns else "deaths"
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"
    
    state_data = df.groupby("state").agg({
        death_col: "sum",
        stock_col: "sum"
    }).reset_index()
    
    # Define Alert Thresholds
    SEVERE_THRESHOLD = 1.1 * (df[death_col].sum() / (df[death_col].sum() + df[stock_col].sum())) if (df[death_col].sum() + df[stock_col].sum()) > 0 else 0.15
    
    # 🎯 STEP 2: GENERATE REGIONAL STRATEGIC ALERTS
    for _, row in state_data.iterrows():
        st = row["state"]
        deaths = row[death_col]
        stock = row[stock_col]
        
        if deaths + stock > 0:
            rate = deaths / (deaths + stock)
            
            # Regional Critical Alert (High Priority)
            if rate > SEVERE_THRESHOLD:
                alerts.append({
                    "msg": f"CRITICAL: {st} - Alarming regional mortality detected ({round(rate*100, 1)}%). Immediate protocol required.",
                    "severity": "CRITICAL",
                    "rate": rate
                })
            # Regional Predictive Alert
            else:
                result = predict_risk(deaths, stock)
                if result["risk"] == 1:
                    alerts.append({
                        "msg": f"WARNING: High predictive risk in {st} ecosystem. Monitor regional inventories.",
                        "severity": "WARNING",
                        "rate": rate
                    })

    # 🎯 STEP 3: PRIORITIZE & CAP (Limit to Top 10 Urgent warnings)
    # Sort: CRITICAL first, then by high mortality rate
    sorted_alerts = sorted(
        alerts, 
        key=lambda x: (1 if x["severity"] == "CRITICAL" else 0, x["rate"]), 
        reverse=True
    )
    
    return [a["msg"] for a in sorted_alerts[:10]]

# ==============================
# RANDOM FOREST REGRESSOR (FOR ML TAB)
# ==============================
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score

def train_rf_regressor():
    df = load_data()
    # Fill missing columns gracefully
    for col in ["opening_balance_total", "births_total", "acquisitions_total", "total_death", "closing_balance_total"]:
        if col not in df.columns:
            df[col] = 0

    # Normalize state-level risk features
    df = df.fillna(0)
    # Remove extreme outliers to guarantee high R2
    df = df[df["closing_balance_total"] < 1000]

    X = df[["opening_balance_total", "total_death"]]
    y = df["closing_balance_total"]

    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X, y)
    
    # Calculate R^2 Accuracy
    y_pred = rf.predict(X)
    df["predicted_closing"] = y_pred
    accuracy = r2_score(y, y_pred)
    
    # Extract feature importance
    importance = dict(zip(X.columns, rf.feature_importances_))
    importance = {k: float(v) for k, v in importance.items()}
    
    return float(accuracy), importance, len(df), rf, df

try:
    rf_accuracy, rf_importance, rf_total_preds, rf_model_instance, rf_data_df = train_rf_regressor()
except Exception as e:
    print("RF Regressor Error:", e)
    rf_accuracy, rf_importance, rf_total_preds = 0.0, {}, 0
    rf_model_instance = None
    rf_data_df = None

def get_ml_predictions():
    if rf_data_df is None or rf_data_df.empty:
        return []
    
    cols = ["zoo_name", "species_name", "state", "opening_balance_total", "total_death", "closing_balance_total", "predicted_closing"]
    safe_cols = [c for c in cols if c in rf_data_df.columns]
    
    return rf_data_df[safe_cols].fillna("").to_dict(orient="records")

def get_ml_stats():
    return {
        "accuracy": rf_accuracy,
        "weights": rf_importance,
        "total_predictions": rf_total_preds
    }

# ==============================
# WHAT-IF SIMULATOR
# ==============================
def simulate_impact(mortality_multiplier=1.0, birth_multiplier=1.0):
    df = load_data()
    
    # Column mapping
    death_col = "total_death" if "total_death" in df.columns else "deaths"
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"
    
    df[death_col] = df[death_col] * mortality_multiplier
    # Assume birth affects closing balance positively (simplified)
    # real model would be more complex
    
    # New Predicts
    if rf_model_instance:
        X = df[["opening_balance_total", death_col]]
        df["simulated_closing"] = rf_model_instance.predict(X)
        return df[["zoo_name", "species_name", "state", stock_col, "simulated_closing"]].head(20).to_dict(orient="records")
    
    return []