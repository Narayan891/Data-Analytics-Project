import os
import logging
import pandas as pd
import jwt
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, Body, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine

# ML functions
from model import predict_risk, generate_alerts, simulate_impact, get_ml_stats, get_ml_predictions

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("zoo-analytics")

app = FastAPI()

# ==============================
# AUTH & CONFIG
# ==============================
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# ==============================
# CORS
# ==============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# AUTHENTICATION
# ==============================
# Config moved to top

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login_user(req: LoginRequest):
    if req.username == "Narayan" and req.password == "1234":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expire = datetime.utcnow() + access_token_expires
        to_encode = {"sub": req.username, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": encoded_jwt, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

# ==============================
# LOAD DATA
# ==============================
def load_data():
    logger.info("Loading zoo data from SQLite")
    try:
        df = pd.read_sql('SELECT * FROM zoo_data', engine)
    except Exception as e:
        logger.error(f"Failed to load data: {e}")
        return pd.DataFrame()

    # Normalize columns: strip, replace spaces/dashes with underscores, lower, and merge underscores
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
# STATE RISK
# ==============================
@app.get("/state-risk")
def state_risk():
    df = load_data()

    # ✅ AUTO DETECT columns safely
    death_col = "total_death" if "total_death" in df.columns else "deaths"
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"

    if death_col not in df.columns or stock_col not in df.columns:
        return []

    data = df.groupby("state").agg({
        death_col: "sum",
        stock_col: "sum"
    }).reset_index()

    # Relative Statistical Risk Mapping
    data["mortality_rate"] = (data[death_col] / (data[death_col] + data[stock_col])).fillna(0)
    
    # Use Median as dynamic baseline for varied visual representation
    dynamic_avg = data["mortality_rate"].median() or 0.63
    data["predicted_risk"] = (data["mortality_rate"] > dynamic_avg).astype(int)

    return data.to_dict(orient="records")

@app.get("/mortality-details")
def mortality_details():
    df = load_data()

    death_col = "total_death" if "total_death" in df.columns else "deaths"
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"

    if death_col not in df.columns or stock_col not in df.columns:
        return []

    df = df.fillna("")
    return df.to_dict(orient="records")


# ==============================
# ENDANGERED & CONSERVATION
# ==============================
@app.get("/endangered")
def endangered():
    df = load_data()
    
    # Pillar 2: Conservation Priority
    # Filter for endangered species manually flagged or by low stock
    if "is_endangered" in df.columns:
        endangered_df = df[df["is_endangered"] == 1]
    else:
        stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"
        endangered_df = df[df[stock_col] < 50]

    return endangered_df.to_dict(orient="records")

# ==============================
# STRATEGIC INSIGHTS HUB (Actionable 5 Pillars)
# ==============================
@app.get("/strategic-insights")
def strategic_insights():
    df = load_data()

    # Column Mapping
    birth_col = "total_birth" if "total_birth" in df.columns else "births"
    death_col = "total_death" if "total_death" in df.columns else "deaths"
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"
    acq_col = "total_acquisition" if "total_acquisition" in df.columns else "acquisitions"
    disp_col = "total_disposal" if "total_disposal" in df.columns else "disposals"

    # 1. National Baselines (Averages)
    national_stats = df.agg({
        death_col: "sum",
        birth_col: "sum",
        stock_col: "sum"
    })
    
    avg_mortality = national_stats[death_col] / (national_stats[death_col] + national_stats[stock_col]) if (national_stats[death_col] + national_stats[stock_col]) > 0 else 0
    avg_birth = national_stats[birth_col] / (national_stats[birth_col] + national_stats[stock_col]) if (national_stats[birth_col] + national_stats[stock_col]) > 0 else 0

    # 2. Zoo-Specific Aggregation
    zoo_data = df.groupby(["zoo_name", "state"]).agg({
        death_col: "sum",
        birth_col: "sum",
        stock_col: "sum",
        acq_col: "sum",
        disp_col: "sum",
        "species_name": "nunique"
    }).reset_index()

    # Calculations (Using denominator protection)
    zoo_data["mortality_rate"] = (zoo_data[death_col] / (zoo_data[death_col] + zoo_data[stock_col])).fillna(0)
    zoo_data["birth_rate"] = (zoo_data[birth_col] / (zoo_data[birth_col] + zoo_data[stock_col])).fillna(0)
    zoo_data["net_growth_index"] = (zoo_data[birth_col] + zoo_data[acq_col] - zoo_data[death_col] - zoo_data[disp_col])
    
    # Pillar 1 & 5: Actionable Filters (Sensitivity tuned to 1.1x national avg due to high baseline)
    high_mortality_outliers = zoo_data[zoo_data["mortality_rate"] > (avg_mortality * 1.1)].sort_values(by="mortality_rate", ascending=False).head(5)
    breeding_leaders = zoo_data[zoo_data["birth_rate"] > avg_birth].sort_values(by="birth_rate", ascending=False).head(5)
    declining_populations = zoo_data[zoo_data["net_growth_index"] < 0].sort_values(by="net_growth_index").head(5)

    # Pillar 2: Conservation Priority (Top 5 Zoos by Endangered Species Density)
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"
    # Fallback to low-balance species if explicit endangered flag is missing
    endangered_df = df[df["is_endangered"] == 1] if "is_endangered" in df.columns else df[df[stock_col] < 50]
    
    # If still empty (safe guard), grab anything with closing stock < 10
    if endangered_df.empty:
        endangered_df = df[df[stock_col] < 10]

    cp_agg = endangered_df.groupby(["zoo_name", "state"]).size().reset_index(name="species_count")
    conservation_priority = cp_agg.sort_values(by="species_count", ascending=False).head(5)

    # Diversity + Growth - Mortality (Normalized Weighting)
    max_diversity = zoo_data["species_name"].max() or 1
    zoo_data["performance_score"] = (
        (zoo_data["species_name"] / max_diversity * 40) + 
        (zoo_data["net_growth_index"].clip(lower=-50, upper=50) + 50) / 100 * 40 - 
        (zoo_data["mortality_rate"] * 20)
    ).round(2)

    return {
        "national_averages": {
            "mortality": round(avg_mortality, 4),
            "birth": round(avg_birth, 4)
        },
        "insights": {
            "high_mortality": high_mortality_outliers.to_dict(orient="records"),
            "conservation_priority": conservation_priority.to_dict(orient="records"),
            "breeding_leaders": breeding_leaders.to_dict(orient="records"),
            "declining": declining_populations.to_dict(orient="records"),
            "overall_performance": zoo_data.sort_values(by="performance_score", ascending=False).head(10).to_dict(orient="records")
        }
    }


# ==============================
# PERFORMANCE
# ==============================
@app.get("/performance")
def performance():
    df = load_data()

    death_col = "total_death" if "total_death" in df.columns else "deaths"
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"

    state_col = "state" if "state" in df.columns else None

    groupby_cols = ["zoo_name", state_col] if state_col else ["zoo_name"]

    data = df.groupby(groupby_cols).agg({
        stock_col: "sum",
        death_col: "sum"
    }).reset_index()

    data["score"] = data[stock_col] - data[death_col]
    data["total_capacity"] = data[stock_col] + data[death_col]
    data["survival_rate"] = (data[stock_col] / data["total_capacity"] * 100).fillna(0).round(2)

    return data.to_dict(orient="records")


# ==============================
# PREDICTIONS (TREND)
# ==============================

@app.get("/predictions")
def predictions():
    return get_ml_predictions()


# ==============================
# ML STATS (RF)
# ==============================

@app.get("/ml-stats")
def ml_stats():
    return get_ml_stats()


# ==============================
# COMPARATIVE ANALYSIS
# ==============================
@app.get("/comparative-analysis")
def comparative_analysis():
    df = load_data()

    # Column Mapping
    death_col = "total_death" if "total_death" in df.columns else "deaths"
    stock_col = "closing_balance_total" if "closing_balance_total" in df.columns else "closing_stock"
    
    # Category and Class columns
    category_col = "zoo_size" if "zoo_size" in df.columns else "zoo_category"
    class_col = "species_class"

    if death_col not in df.columns or stock_col not in df.columns:
        return []

    # 1. Group by Category (Size)
    category_stats = df.groupby(category_col).agg({
        death_col: "sum",
        stock_col: "sum"
    }).reset_index()
    category_stats["mortality_rate"] = (category_stats[death_col] / (category_stats[death_col] + category_stats[stock_col]) * 100).fillna(0).round(2)

    # 2. Group by Species Class
    class_stats = df.groupby(class_col).agg({
        death_col: "sum",
        stock_col: "sum"
    }).reset_index()
    class_stats["mortality_rate"] = (class_stats[death_col] / (class_stats[death_col] + class_stats[stock_col]) * 100).fillna(0).round(2)

    return {
        "by_category": category_stats.to_dict(orient="records"),
        "by_class": class_stats.to_dict(orient="records")
    }

# ==============================
# ALERTS
# ==============================
@app.get("/alerts")
def alerts():
    return generate_alerts()


# ==============================
# ML PREDICTION (REAL API)
# ==============================
@app.post("/predict")
def predict(data: dict = Body(...)):
    deaths = data.get("deaths", 0)
    stock = data.get("stock", 0)

    return predict_risk(deaths, stock)

# ==============================
# ECOSYSTEM SIMULATION
# ==============================
@app.post("/simulate-ecosystem")
def simulate(data: dict = Body(...)):
    mortality_multiplier = data.get("mortality_multiplier", 1.0)
    birth_multiplier = data.get("birth_multiplier", 1.0)
    
    logger.info(f"Simulating impact: Mortality x{mortality_multiplier}, Birth x{birth_multiplier}")
    return simulate_impact(mortality_multiplier, birth_multiplier)


# ==============================
# HEALTH CHECK
# ==============================
@app.get("/")
def home():
    return {"message": "Zoo Analytics API Running 🚀"}