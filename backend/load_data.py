# This file acts as a bridge between Python and database
import pandas as pd
from database import engine
import os

# Use the absolute path if needed, or relative to the project root
csv_path = r"c:\Users\naray\OneDrive\Desktop\zoo-analytics anti\data\Preprocessed Animal Zoo Inventory.csv"

if not os.path.exists(csv_path):
    # Fallback to current directory for local execution
    csv_path = "Preprocessed Animal Zoo Inventory.csv"

df = pd.read_csv(csv_path)

# 1. Extract Species Class (Mammalia, Aves, Reptilia, Amphibia) from Species Name
# These are often header rows in the CZA inventory data.
classes = ['Mammalia', 'Aves', 'Reptilia', 'Amphibia']
df['Species_Class'] = df['Species Name'].apply(lambda x: x if x in classes else None)

# 2. Forward fill the Species_Class so that species under a header get that class
df['Species_Class'] = df['Species_Class'].ffill()

# 3. Remove header rows and summary/aggregate rows (Total, Sub-total, Grand Total)
# Summary rows often have "*" or contain "Total" which causes artificial 3.6 (360%) mortality rates.
exclude_keywords = ['Total', 'Grand Total', 'Sub-total', 'Sub Total']
df = df[~df['Species Name'].isin(classes)].reset_index(drop=True)

# Heavy Filter: Remove anything that looks like a summary row
df = df[~df['Species Name'].str.contains('|'.join(exclude_keywords), case=False, na=False)].reset_index(drop=True)
df = df[~df['Species Name'].str.startswith('*', na=False)].reset_index(drop=True)

# 4. Clean numerical columns (Ensure no NaN or non-numeric skew)
num_cols = ['Opening Balance - Total', 'Arrivals - Total', 'Births - Total', 'Total_Death', 'Closing Balance - Total']
for col in num_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# Filter out empty rows (both stock and deaths are 0) to reduce noise
df = df[(df['Total_Death'] > 0) | (df['Closing Balance - Total'] > 0)].reset_index(drop=True)

# 4. Save to SQL
# For PostgreSQL, we might need a CASCADE drop if there are dependencies
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text("DROP TABLE IF EXISTS zoo_data CASCADE"))
        conn.commit()
    except Exception as e:
        print(f"Note: Could not drop table with CASCADE: {e}")

df.to_sql("zoo_data", engine, if_exists="replace", index=False)

print(f"Data loaded successfully with {len(df)} records and Species_Class extraction.")
