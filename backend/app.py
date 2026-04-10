from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

def simulate_sip(monthly_investment, months, step_up):
    simulations = 1000
    results = []

    for _ in range(simulations):
        value = 0
        sip = monthly_investment

        for m in range(months):
            monthly_return = np.random.normal(0.01, 0.05)
            value = (value + sip) * (1 + monthly_return)

            if (m + 1) % 12 == 0:
                sip += step_up

        results.append(value)

    return results

@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.json

    sip = int(data["sip"])
    years = int(data["years"])
    goal = int(data["goal"])
    step_up = int(data["step_up"])

    months = years * 12
    results = simulate_sip(sip, months, step_up)

    avg = int(np.mean(results))
    prob = int((sum(1 for r in results if r >= goal) / len(results)) * 100)

    return jsonify({
        "average": avg,
        "probability": prob
    })

if __name__ == "__main__":
    app.run(debug=True)