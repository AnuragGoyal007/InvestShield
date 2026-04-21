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
        print("[WARN] Shoonya credentials not configured. Using fallback market data.")
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
            print(f"[OK] Shoonya API connected successfully! User: {user_id}")
            # Fetch initial data immediately
            fetch_live_indices()
        else:
            error_msg = ret.get('emsg', 'Unknown error') if ret else 'No response'
            print(f"[ERR] Shoonya login failed: {error_msg}")

    except ImportError:
        print("[WARN] NorenRestApiPy not installed. Run: pip install NorenRestApiPy")
    except Exception as e:
        print(f"[ERR] Shoonya connection error: {e}")


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
        print(f"[DATA] Live indices updated: NIFTY={live_indices_cache['nifty']['value']}")

    except Exception as e:
        print(f"[WARN] Error fetching live indices: {e}")
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

# ═══ Stock Market Data Endpoints (Yahoo Finance) ═══
import yfinance as yf
from functools import lru_cache
import json

# In-memory cache for stock data
stock_cache = {}
CACHE_TTL = 60  # seconds

def get_cached(key, fetch_fn, ttl=CACHE_TTL):
    """Simple TTL cache for stock data."""
    now = time.time()
    if key in stock_cache:
        data, ts = stock_cache[key]
        if now - ts < ttl:
            return data
    data = fetch_fn()
    stock_cache[key] = (data, now)
    return data

# Popular Indian stocks for search and trending
INDIAN_STOCKS = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE"},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd", "exchange": "NSE"},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "exchange": "NSE"},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "exchange": "NSE"},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "exchange": "NSE"},
    {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd", "exchange": "NSE"},
    {"symbol": "SBIN.NS", "name": "State Bank of India", "exchange": "NSE"},
    {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd", "exchange": "NSE"},
    {"symbol": "ITC.NS", "name": "ITC Ltd", "exchange": "NSE"},
    {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank Ltd", "exchange": "NSE"},
    {"symbol": "LT.NS", "name": "Larsen & Toubro Ltd", "exchange": "NSE"},
    {"symbol": "AXISBANK.NS", "name": "Axis Bank Ltd", "exchange": "NSE"},
    {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance Ltd", "exchange": "NSE"},
    {"symbol": "MARUTI.NS", "name": "Maruti Suzuki India Ltd", "exchange": "NSE"},
    {"symbol": "TITAN.NS", "name": "Titan Company Ltd", "exchange": "NSE"},
    {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical Industries", "exchange": "NSE"},
    {"symbol": "TATAMOTORS.NS", "name": "Tata Motors Ltd", "exchange": "NSE"},
    {"symbol": "WIPRO.NS", "name": "Wipro Ltd", "exchange": "NSE"},
    {"symbol": "HCLTECH.NS", "name": "HCL Technologies Ltd", "exchange": "NSE"},
    {"symbol": "ADANIENT.NS", "name": "Adani Enterprises Ltd", "exchange": "NSE"},
    {"symbol": "TATASTEEL.NS", "name": "Tata Steel Ltd", "exchange": "NSE"},
    {"symbol": "NTPC.NS", "name": "NTPC Ltd", "exchange": "NSE"},
    {"symbol": "POWERGRID.NS", "name": "Power Grid Corporation", "exchange": "NSE"},
    {"symbol": "ONGC.NS", "name": "Oil and Natural Gas Corporation", "exchange": "NSE"},
    {"symbol": "COALINDIA.NS", "name": "Coal India Ltd", "exchange": "NSE"},
    {"symbol": "DRREDDY.NS", "name": "Dr. Reddy's Laboratories", "exchange": "NSE"},
    {"symbol": "CIPLA.NS", "name": "Cipla Ltd", "exchange": "NSE"},
    {"symbol": "TECHM.NS", "name": "Tech Mahindra Ltd", "exchange": "NSE"},
    {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement Ltd", "exchange": "NSE"},
    {"symbol": "NESTLEIND.NS", "name": "Nestle India Ltd", "exchange": "NSE"},
    {"symbol": "BAJAJFINSV.NS", "name": "Bajaj Finserv Ltd", "exchange": "NSE"},
    {"symbol": "ASIANPAINT.NS", "name": "Asian Paints Ltd", "exchange": "NSE"},
    {"symbol": "JSWSTEEL.NS", "name": "JSW Steel Ltd", "exchange": "NSE"},
    {"symbol": "M&M.NS", "name": "Mahindra & Mahindra Ltd", "exchange": "NSE"},
    {"symbol": "DIVISLAB.NS", "name": "Divi's Laboratories Ltd", "exchange": "NSE"},
    {"symbol": "HEROMOTOCO.NS", "name": "Hero MotoCorp Ltd", "exchange": "NSE"},
    {"symbol": "EICHERMOT.NS", "name": "Eicher Motors Ltd", "exchange": "NSE"},
    {"symbol": "BPCL.NS", "name": "Bharat Petroleum Corporation", "exchange": "NSE"},
    {"symbol": "BRITANNIA.NS", "name": "Britannia Industries Ltd", "exchange": "NSE"},
    {"symbol": "INDUSINDBK.NS", "name": "IndusInd Bank Ltd", "exchange": "NSE"},
    {"symbol": "RELIANCE.BO", "name": "Reliance Industries Ltd", "exchange": "BSE"},
    {"symbol": "TCS.BO", "name": "Tata Consultancy Services Ltd", "exchange": "BSE"},
    {"symbol": "INFY.BO", "name": "Infosys Ltd", "exchange": "BSE"},
]

@app.route('/api/stock/search', methods=['GET'])
def search_stocks():
    """Search for stocks by name or symbol."""
    query = request.args.get('q', '').strip().upper()
    if not query or len(query) < 1:
        return jsonify({'results': []})
    
    results = []
    for stock in INDIAN_STOCKS:
        if query in stock['symbol'].upper() or query in stock['name'].upper():
            results.append(stock)
    
    return jsonify({'results': results[:10]})

@app.route('/api/stock/quote', methods=['GET'])
def get_stock_quote():
    """Fetch live quote for a stock symbol."""
    symbol = request.args.get('symbol', '').strip()
    if not symbol:
        return jsonify({'error': 'Symbol required'}), 400
    
    # Add .NS suffix if not present (default to NSE)
    if '.' not in symbol:
        symbol = f"{symbol}.NS"
    
    def fetch_quote():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Get fast_info for the most reliable price data
            fast = ticker.fast_info
            
            current_price = info.get('currentPrice') or info.get('regularMarketPrice') or fast.get('lastPrice', 0)
            prev_close = info.get('previousClose') or info.get('regularMarketPreviousClose') or fast.get('previousClose', current_price)
            
            change = round(current_price - prev_close, 2) if current_price and prev_close else 0
            change_pct = round((change / prev_close) * 100, 2) if prev_close else 0
            
            return {
                'symbol': symbol,
                'name': info.get('longName') or info.get('shortName', symbol),
                'currentPrice': round(current_price, 2),
                'previousClose': round(prev_close, 2),
                'change': change,
                'changePercent': change_pct,
                'dayHigh': info.get('dayHigh', 0),
                'dayLow': info.get('dayLow', 0),
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh', 0),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow', 0),
                'volume': info.get('volume') or info.get('regularMarketVolume', 0),
                'marketCap': info.get('marketCap', 0),
                'pe': info.get('trailingPE', 0),
                'eps': info.get('trailingEps', 0),
                'dividend': info.get('dividendYield', 0),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'exchange': info.get('exchange', 'NSE'),
                'currency': info.get('currency', 'INR'),
                'marketState': info.get('marketState', 'CLOSED'),
                'source': 'yahoo_finance'
            }
        except Exception as e:
            print(f"Error fetching quote for {symbol}: {e}")
            return {'error': str(e), 'symbol': symbol}
    
    result = get_cached(f"quote_{symbol}", fetch_quote, ttl=30)
    return jsonify(result)

@app.route('/api/stock/history', methods=['GET'])
def get_stock_history():
    """Fetch historical price data for charting."""
    symbol = request.args.get('symbol', '').strip()
    period = request.args.get('period', '1mo')  # 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y
    interval = request.args.get('interval', '')
    
    if not symbol:
        return jsonify({'error': 'Symbol required'}), 400
    
    if '.' not in symbol:
        symbol = f"{symbol}.NS"
    
    # Auto-select interval based on period
    if not interval:
        interval_map = {
            '1d': '5m', '5d': '15m', '1mo': '1d',
            '3mo': '1d', '6mo': '1d', '1y': '1wk', '5y': '1mo'
        }
        interval = interval_map.get(period, '1d')
    
    def fetch_history():
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period, interval=interval)
            
            if hist.empty:
                return {'error': 'No data found', 'symbol': symbol, 'data': []}
            
            data = []
            for idx, row in hist.iterrows():
                data.append({
                    'date': idx.strftime('%Y-%m-%d %H:%M') if interval in ['5m', '15m', '30m', '1h'] else idx.strftime('%Y-%m-%d'),
                    'open': round(row['Open'], 2),
                    'high': round(row['High'], 2),
                    'low': round(row['Low'], 2),
                    'close': round(row['Close'], 2),
                    'volume': int(row['Volume'])
                })
            
            return {
                'symbol': symbol,
                'period': period,
                'interval': interval,
                'data': data,
                'source': 'yahoo_finance'
            }
        except Exception as e:
            print(f"Error fetching history for {symbol}: {e}")
            return {'error': str(e), 'symbol': symbol, 'data': []}
    
    ttl = 300 if period in ['1y', '5y'] else 60
    result = get_cached(f"history_{symbol}_{period}_{interval}", fetch_history, ttl=ttl)
    return jsonify(result)

@app.route('/api/stock/trending', methods=['GET'])
def get_trending_stocks():
    """Fetch data for trending Indian stocks (top 10 NIFTY components)."""
    trending_symbols = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'BHARTIARTL.NS', 'SBIN.NS', 'ITC.NS', 'KOTAKBANK.NS', 'LT.NS',
        'BAJFINANCE.NS', 'TATAMOTORS.NS'
    ]
    
    def fetch_trending():
        results = []
        for sym in trending_symbols:
            try:
                ticker = yf.Ticker(sym)
                fast = ticker.fast_info
                info = ticker.info
                
                current = info.get('currentPrice') or info.get('regularMarketPrice', 0)
                prev = info.get('previousClose', current)
                change = round(current - prev, 2) if current and prev else 0
                change_pct = round((change / prev) * 100, 2) if prev else 0
                
                results.append({
                    'symbol': sym,
                    'name': info.get('shortName', sym.replace('.NS', '')),
                    'price': round(current, 2),
                    'change': change,
                    'changePercent': change_pct,
                    'volume': info.get('volume', 0),
                    'marketCap': info.get('marketCap', 0)
                })
            except Exception as e:
                print(f"Skipping {sym}: {e}")
                continue
        return results
    
    result = get_cached('trending_stocks', fetch_trending, ttl=120)
    return jsonify({'stocks': result})

if __name__ == '__main__':
    initialize_models()
    initialize_shoonya()
    
    # Start background thread to keep indices fresh
    if shoonya_connected:
        updater = threading.Thread(target=background_index_updater, daemon=True)
        updater.start()
    
    app.run(port=8000, debug=True)

