import time
import pandas as pd
import requests
from pathlib import Path
from dotenv import load_dotenv
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

load_dotenv()

BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_KEY")
HEADERS = {"X-API-Key": API_KEY}
OUT = Path(__file__).resolve().parent

# ---------------------------------------------- EXTRACT ----------------------------------------------

def fetch_page(page, page_size):
    resp = requests.get(BASE_URL, headers=HEADERS, params={"page": page, "page_size": page_size})
    return resp


def fetch_all_trades(page_size=5):
    all_rows = []
    page = 1
    while True:
        resp = fetch_page(page, page_size)
        if resp.status_code == 429:
            retry_after = int(resp.headers.get("Retry-After", 1))
            print(f"Rate limited on page {page}, waiting {retry_after}s...")
            time.sleep(retry_after)
            continue  # retry the same page, don't advance
        body = resp.json()
        all_rows.extend(body["data"])
        if page >= body["total_pages"]:
            break
        page += 1
    return all_rows

# ---------------------------------------------- TRANSFORM ----------------------------------------------

def transform(all_trades):
    df = pd.DataFrame(all_trades)
    df = df.drop_duplicates()
    MAPPING = {
        'equity': 'Equity',
        'etf': 'ETF',
        'bond': 'Bond',
        'crypto': 'Crypto'
    }
    df['asset_class'] = df['asset_class'].str.lower().map(MAPPING)
    eq = df.loc[df['asset_class'] == 'Equity', 'quantity']
    q3 = eq.quantile(0.75)
    outliers = df[df['quantity'] > q3 * 5]
    return df

df = transform(fetch_all_trades(5))
print(df)
print('----------------------')
print(df.shape)
print('----------------------')
print(df.head())


def compute_insights(trades_df):
    grouped = trades_df.groupby("advisor")["value"].agg(["count", "sum", "mean"])
    pivoted = trades_df.pivot_table(index = "asset_class", columns = "side", values = "value", aggfunc = "sum", fill_value = 0)
    total_val = trades_df["value"].sum()
    client_total = trades_df["client_id"].nunique()
    return grouped, pivoted, total_val, client_total

def build_charts(trades):
    totals = trades.groupby("asset_class")["value"].mean()
    fig, ax = plt.subplots()
    ax.bar(totals.index, totals.values)
    ax.set_ylim(bottom=0)
    ax.set_title('Average Trade Value by Asset Class')
    ax.set_xlabel("Asset Class")
    ax.set_ylabel("Average Value ($)")
    fig.savefig(OUT / "chart_asset_class.png")
    plt.close(fig) 
    
def print_dashboard(trades):
    shape = trades.shape
    rows = shape[0]
    columns = shape[1]
    grouped, pivoted, total_val, client_total = compute_insights(trades)
    print(f"Data consists of {rows} trades totaling to a value of {total_val} USD across {client_total} clients.")
    build_charts(trades)
    print("See chart_asset_class.png for a view of asset distribution")
    
if __name__ == "__main__":
    pages = fetch_all_trades(5)
    df = transform(pages)
    print_dashboard(df)