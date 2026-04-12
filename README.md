# InvestShield AI

![InvestShield AI Banner](https://img.shields.io/badge/Platform-InvestShield_AI-0a0a0a?style=for-the-badge&logo=react&logoColor=00e5ff)
![Hackathon](https://img.shields.io/badge/Built_For-EvolveAI_Hackathon-10b981?style=for-the-badge)

**Better Data. Scalable AI.**

InvestShield AI is a state-of-the-art financial projection orchestrator designed with an ultra-premium, dark-editorial interface. Instead of relying on static, generic financial calculators, InvestShield utilizes an integrated **3-Tier AI Stack**: Monte Carlo branch simulations executing via Node.js, combined with K-Nearest Neighbors (KNN) algorithms processing through a dedicated Python/Scikit-Learn microservice to vector-match users with highly-ranked mutual funds.

## ✨ Core Technology Implementations

*   **Portfolio Auditor & CSV Export:** 
    Users can drop their raw portfolio holding CSVs directly into the platform. A proprietary AI heuristic engine analyzes sector concentrations and outputs a balanced, low-risk target allocation matrix. Users can generate both **PDF Reports** and export the raw target matrix via **CSV Download**.
*   **Persistent & Secure Auth (SQLite & JWT):** 
    Features a completely custom "Login-on-Demand" architecture. The platform is open for anonymous exploration. When saving portfolios, an integrated auth layer (bcrypt hashing + JWT tokens securely stored in a zero-config SQLite db) instantly converts anonymous users to authenticated profiles.
*   **Knowledge Hub & Education Dashboard:** 
    A fully responsive, filtering-enabled learning grid loaded with highly-distilled financial knowledge (Basics of Investing, ETFs vs Mutual Funds, Asset Allocation) to train beginners into confident market participants.
*   **Institutional Stochastic Engine:** 
    A native Javascript backend running thousands of probabilistic Monte Carlo timeline projections against a user's target financial objectives in real-time.
*   **Machine Learning Microservice (Python):** 
    Utilizes `Scikit-Learn` clustering on a custom Indian Mutual Fund dataset. Maps risk horizons and inputs into N-Dimensional space to route the optimal financial instruments.
*   **Dynamic Predictive Analytics Dashboard:** 
    Interactive, chart-driven feedback that provides success yield percentages, percentile floors (Worst Case), and algorithmic "Step-up" strategy corrections if a financial goal mathematically flags as unachievable.
*   **Macroeconomic Telemetry & Live Ticker:** 
    Dynamically fetches live RSS proxy feeds into a Bloomberg-inspired UI, overlayed with simulated real-time index widgets (NIFTY 50, SENSEX) reacting to market volatility constraints.
*   **Scale AI Inspired Interface:**
    Engineered with pure vanilla CSS and standard integrations to mimic a high-end SaaS data platform: featuring deep `#0a0a0a` grids, staggered cascade animations, pure glassmorphism, and neon electric cyan vectors.

## 🏗 System Architecture

The ecosystem relies on an asynchronous 3-tier architecture handling logic across microservices to isolate Data Science arrays from UI mapping schemas.

```text
evolveai_hackathon/
├── frontend/              # View layer (React JS + Vite/Tailwind ecosystem)
│   ├── src/components/    # Glassmorphic UI components, UI Modals, Learning Grids
│   └── src/data/          # Scalable static configurations (education data)
├── backend/               # Processing layer (Node.js + Express JS)
│   ├── server.js          # REST API & Monte Carlo mathematics orchestrator 
│   ├── auth.js            # JWT verification & Identity orchestration
│   └── db.js              # Embedded SQLite driver 
└── ml-backend/            # AI Layer (Flask + Scikit-Learn Python logic)
    ├── app.py             # KNN nearest-fund content router
    └── mutual_funds_india.csv # Vector datastore
```

## 🚀 Getting Started (Run the Sandbox)

To boot up the complete pipeline locally on your machine, you must initialize all three ecosystem nodes simultaneously across three separate terminal instances.

### 1. Initialize the Python Machine Learning Cluster
```bash
cd ml-backend
# Optional: Activate your virtual environment first
pip install flask flask-cors pandas scikit-learn
python app.py
```
*(Runs securely on default port `8000`)*

### 2. Initialize the Monte Carlo Node.js Engine
```bash
cd backend
npm install
node server.js
```
*(Runs securely on default port `5000`)*

### 3. Deploy the Real-Time React Frontend
```bash
cd frontend
npm install
npm start
```
*(Runs securely on default port `3000`)*

Load `http://localhost:3000` in your Chromium/Webkit browser to access the finalized UI environment. 


## ⚖️ License
Proprietary prediction engine mock-up built exclusively for the conceptual presentation phase of the **EvolveAI Hackathon**. Not financial advice. All operations and logic flows are structurally simulated demonstrations.
