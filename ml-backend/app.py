from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import os

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
    app.run(port=8000, debug=True)
