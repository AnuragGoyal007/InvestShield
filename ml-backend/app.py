from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import os
import threading
import time

app = Flask(__name__)
CORS(app)

# Load datasets
mf_data_path = 'mutual_funds_india.csv'
market_data_path = 'historical_index_data.csv'

# Globals for ML models
mf_df = None
knn_model = None
scaler = None
market_stats = {}

# ═══ Shoonya API Integration ═══
shoonya_api = None
shoonya_connected = False
live_indices_cache = {
    'nifty': {'value': 24850.00, 'change': 0.00},
    'sensex': {'value': 81600.00, 'change': 0.00},
    'bankNifty': {'value': 55200.00, 'change': 0.00},
    'source': 'fallback',
    'timestamp': None
}

def initialize_shoonya():
    """Connect to Shoonya API using environment variables for credentials."""
    global shoonya_api, shoonya_connected

    user_id = os.environ.get('SHOONYA_USER')
    password = os.environ.get('SHOONYA_PWD')
    totp_secret = os.environ.get('SHOONYA_TOTP_SECRET')
    vendor_code = os.environ.get('SHOONYA_VENDOR_CODE')
    api_secret = os.environ.get('SHOONYA_API_SECRET')
    imei = os.environ.get('SHOONYA_IMEI', 'abc1234')

    if not all([user_id, password, vendor_code, api_secret]):
        print("⚠️  Shoonya credentials not configured. Using fallback market data.")
        print("   Set SHOONYA_USER, SHOONYA_PWD, SHOONYA_VENDOR_CODE, SHOONYA_API_SECRET env vars to enable live data.")
        return

    try:
        from NorenRestApiPy.NorenApi import NorenApi

        class ShoonyaApiHelper(NorenApi):
            def __init__(self):
                NorenApi.__init__(self, host='https://api.shoonya.com/NorenWClientTP/',
                                 websocket='wss://api.shoonya.com/NorenWSTP/')

        shoonya_api = ShoonyaApiHelper()

        # Generate TOTP if secret is provided
        factor2 = None
        if totp_secret:
            import pyotp
            factor2 = pyotp.TOTP(totp_secret).now()
        else:
            factor2 = os.environ.get('SHOONYA_2FA', '')

        ret = shoonya_api.login(
            userid=user_id,
            password=password,
            twoFA=factor2,
            vendor_code=vendor_code,
            api_secret=api_secret,
            imei=imei
        )

        if ret and ret.get('stat') == 'Ok':
            shoonya_connected = True
            print(f"✅ Shoonya API connected successfully! User: {user_id}")
            # Fetch initial data immediately
            fetch_live_indices()
        else:
            error_msg = ret.get('emsg', 'Unknown error') if ret else 'No response'
            print(f"❌ Shoonya login failed: {error_msg}")

    except ImportError:
        print("⚠️  NorenRestApiPy not installed. Run: pip install NorenRestApiPy")
    except Exception as e:
        print(f"❌ Shoonya connection error: {e}")


def fetch_live_indices():
    """Fetch live NIFTY 50, SENSEX, and BANK NIFTY data from Shoonya."""
    global live_indices_cache

    if not shoonya_connected or not shoonya_api:
        return

    try:
        # NIFTY 50 (NSE, token 26000)
        nifty = shoonya_api.get_quotes(exchange='NSE', token='26000')
        # SENSEX (BSE, token 1)
        sensex = shoonya_api.get_quotes(exchange='BSE', token='1')
        # BANK NIFTY (NSE, token 26009)
        bank_nifty = shoonya_api.get_quotes(exchange='NSE', token='26009')

        if nifty and nifty.get('stat') == 'Ok':
            lp = float(nifty.get('lp', 0))
            c = float(nifty.get('c', lp))  # previous close
            live_indices_cache['nifty'] = {
                'value': lp,
                'change': round(lp - c, 2)
            }

        if sensex and sensex.get('stat') == 'Ok':
            lp = float(sensex.get('lp', 0))
            c = float(sensex.get('c', lp))
            live_indices_cache['sensex'] = {
                'value': lp,
                'change': round(lp - c, 2)
            }

        if bank_nifty and bank_nifty.get('stat') == 'Ok':
            lp = float(bank_nifty.get('lp', 0))
            c = float(bank_nifty.get('c', lp))
            live_indices_cache['bankNifty'] = {
                'value': lp,
                'change': round(lp - c, 2)
            }

        live_indices_cache['source'] = 'shoonya_live'
        live_indices_cache['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"📊 Live indices updated: NIFTY={live_indices_cache['nifty']['value']}")

    except Exception as e:
        print(f"⚠️  Error fetching live indices: {e}")
        live_indices_cache['source'] = 'fallback'


def background_index_updater():
    """Background thread that refreshes live index data every 30 seconds."""
    while True:
        time.sleep(30)
        if shoonya_connected:
            fetch_live_indices()


def initialize_models():
    global mf_df, knn_model, scaler, market_stats
    print("Loading datasets and initializing ML models...")
    
    # 1. Market Data Analysis (Time-Series stats)
    if os.path.exists(market_data_path):
        market_df = pd.read_csv(market_data_path)
        # Calculate daily returns
        market_df['Return'] = market_df['Close'].pct_change()
        # Annualized mean return (assuming 252 trading days)
        annual_mean = market_df['Return'].mean() * 252 * 100
        # Annualized volatility
        annual_vol = market_df['Return'].std() * np.sqrt(252)
        
        market_stats = {
            'expected_return': round(annual_mean, 2),
            'volatility': round(annual_vol, 4)
        }
    else:
        market_stats = {'expected_return': 12.0, 'volatility': 0.15}
        print("Market data not found, using defaults.")

    # 2. Mutual Fund Recommendation System (KNN)
    if os.path.exists(mf_data_path):
        mf_df = pd.read_csv(mf_data_path)
        
        # Mapping risk to numeric for KNN
        risk_map = {'Low': 1, 'Moderate': 2, 'Moderately High': 3, 'High': 4, 'Very High': 5}
        mf_df['Risk_Numeric'] = mf_df['Risk_Level'].map(risk_map).fillna(3)
        
        # Features for KNN: Risk, Returns (3Y), Volatility
        features = mf_df[['Risk_Numeric', 'Return_3Y', 'Volatility']]
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(features)
        
        # Train KNN
        knn_model = NearestNeighbors(n_neighbors=5, metric='cosine')
        knn_model.fit(X_scaled)
        print("ML Models Initialized Successfully!")
    else:
        print("Mutual fund data not found.")

@app.route('/api/market-conditions', methods=['GET'])
def get_market_conditions():
    """Returns dynamic Monte Carlo simulation parameters based on historical data"""
    return jsonify(market_stats)

@app.route('/api/live-indices', methods=['GET'])
def get_live_indices():
    """Returns live NIFTY 50, SENSEX, BANK NIFTY data from Shoonya API.
    Falls back to static values if Shoonya is not connected."""
    return jsonify(live_indices_cache)

@app.route('/api/recommend-funds', methods=['POST'])
def recommend_funds():
    """Suggests mutual funds using K-Nearest Neighbors based on user profile"""
    data = request.json
    risk_preference = data.get('riskPreference', 'medium')
    required_return = data.get('requiredReturn', 12.0)
    
    # Map user risk preference to target features
    target_risk = {'low': 1.5, 'medium': 3.0, 'high': 4.5}[risk_preference.lower()]
    target_volatility = {'low': 0.05, 'medium': 0.12, 'high': 0.20}[risk_preference.lower()]
    
    # Create the target user vector
    user_vector = pd.DataFrame([{
        'Risk_Numeric': target_risk,
        'Return_3Y': required_return,
        'Volatility': target_volatility
    }])
    
    # Scale and predict
    user_scaled = scaler.transform(user_vector)
    distances, indices = knn_model.kneighbors(user_scaled)
    
    # Fetch results
    recommended_indices = indices[0]
    recommendations = []
    
    allocations = ['Primary', 'Growth Booster', 'Stability']
    for i, idx in enumerate(recommended_indices[:3]):
        fund = mf_df.iloc[idx]
        recommendations.append({
            'name': fund['Fund_Name'],
            'category': fund['Category'],
            'expectedReturn': f"{fund['Return_3Y']}%",
            'risk': fund['Risk_Level'],
            'description': f"{fund['AMC']} AMC - Rating: {fund['Rating']} Stars",
            'allocation': allocations[i] if i < len(allocations) else 'Diversification'
        })
        
    return jsonify({'funds': recommendations})

if __name__ == '__main__':
    initialize_models()
    initialize_shoonya()
    
    # Start background thread to keep indices fresh
    if shoonya_connected:
        updater = threading.Thread(target=background_index_updater, daemon=True)
        updater.start()
    
    app.run(port=8000, debug=True)

