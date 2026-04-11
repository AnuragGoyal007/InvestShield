import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

def generate_mutual_funds():
    print("Generating mutual_funds_india.csv...")
    
    amcs = ['SBI', 'HDFC', 'ICICI Prudential', 'Axis', 'Kotak', 'Nippon India', 'UTI', 'Mirae Asset', 'Parag Parikh', 'DSP', 'Tata', 'Quant']
    categories = ['Equity - Large Cap', 'Equity - Mid Cap', 'Equity - Small Cap', 'Equity - Flexi Cap', 
                  'Debt - Liquid', 'Debt - Short Duration', 'Debt - Gilt', 'Debt - Corporate Bond',
                  'Hybrid - Aggressive', 'Hybrid - Balanced Advantage']
    
    data = []
    
    # Generate 300 realistic mutual funds
    for i in range(300):
        amc = random.choice(amcs)
        category = random.choice(categories)
        fund_name = f"{amc} {category.split(' - ')[1]} Fund"
        
        # Risk and returns based on category
        if 'Equity' in category:
            risk = 'Very High' if 'Small' in category else ('High' if 'Mid' in category else 'Moderately High')
            base_return = random.uniform(12.0, 24.0)
            volatility = random.uniform(0.15, 0.25)
        elif 'Debt' in category:
            risk = 'Low' if 'Liquid' in category else 'Moderate'
            base_return = random.uniform(5.0, 8.5)
            volatility = random.uniform(0.02, 0.05)
        else:
            risk = 'High'
            base_return = random.uniform(9.0, 15.0)
            volatility = random.uniform(0.08, 0.14)
            
        # Variation
        return_1y = round(base_return + random.uniform(-4, 6), 2)
        return_3y = round(base_return + random.uniform(-2, 3), 2)
        return_5y = round(base_return + random.uniform(-1, 2), 2)
        expense_ratio = round(random.uniform(0.1, 1.5), 2)
        rating = random.choice([3, 4, 4, 5, 5])
        
        data.append({
            'Fund_Name': f"{fund_name} - Regular Plan {i}",
            'Category': category,
            'AMC': amc,
            'Risk_Level': risk,
            'Rating': rating,
            'Return_1Y': return_1y,
            'Return_3Y': return_3y,
            'Return_5Y': return_5y,
            'Expense_Ratio': expense_ratio,
            'Min_SIP': random.choice([100, 500, 1000]),
            'Volatility': round(volatility, 3)
        })
        
    df = pd.DataFrame(data)
    df.to_csv('mutual_funds_india.csv', index=False)
    print("✓ Created mutual_funds_india.csv (300 funds)")

def generate_market_data():
    print("Generating historical_index_data.csv...")
    
    # Generate 5 years of daily market data (simulating NIFTY 50)
    dates = pd.date_range(end=datetime.today(), periods=1250, freq='B') # Business days
    
    # Random walk with positive drift to simulate stock market
    drift = 0.0004 # Slight daily upward drift (roughly 10% annual)
    volatility = 0.012 # Daily volatility
    
    returns = np.random.normal(drift, volatility, len(dates))
    
    # Start at 10,000 index value
    price_series = [10000]
    for r in returns[1:]:
        # Apply return to previous price
        price_series.append(price_series[-1] * (1 + r))
        
    df = pd.DataFrame({
        'Date': dates,
        'Close': price_series
    })
    
    df.to_csv('historical_index_data.csv', index=False)
    print("✓ Created historical_index_data.csv (5 years of daily data)")

if __name__ == "__main__":
    print("--- Hackathon ML Dataset Generator ---")
    generate_mutual_funds()
    generate_market_data()
    print("--- Done! ---")
