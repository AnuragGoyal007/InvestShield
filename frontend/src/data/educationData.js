export const educationCategories = ["All", "Basics of Investing", "Market Fundamentals", "Risk & Strategy"];

export const educationTopics = [
  // --- Basics of Investing ---
  {
    id: "what-is-investing",
    title: "What is Investing?",
    category: "Basics of Investing",
    shortDesc: "The core concept of making your money work for you.",
    difficulty: "Beginner",
    readTime: "2 min",
    content: `Investing is the act of allocating capital (money) with the expectation of generating an income or profit over time. Unlike saving, where your money sits and loses value to inflation, investing puts your money into assets that have the potential to grow.

### Real-Life Example
Imagine you buy a piece of land. Ten years later, a new highway is built nearby, and the land's value doubles. That is the essence of investing—buying an asset today that becomes more valuable tomorrow.

### The Problem With Cash
If you hide ₹10,000 under your mattress, in five years it will still be ₹10,000. However, because of inflation (the rising cost of goods), that same ₹10,000 will buy fewer groceries or fuel than it does today. Investing aims to beat inflation.`,
    whyItMatters: "Without investing, your wealth slowly evaporates due to inflation. Investing is the single most reliable path to long-term financial independence.",
    takeaway: "Savings preserve what you have. Investing builds what you need for the future."
  },
  {
    id: "what-is-sip",
    title: "What is SIP?",
    category: "Basics of Investing",
    shortDesc: "Systematic Investment Plan: The automated way to build wealth.",
    difficulty: "Beginner",
    readTime: "3 min",
    content: `SIP stands for **Systematic Investment Plan**. It is a method of investing a fixed amount of money at regular intervals (like ₹5,000 every month) into a mutual fund. 

### Why is SIP so powerful?
It removes the emotion from investing. You don't have to worry about whether the market is "too high" or "crashing." Because your investment is automated, you buy more units when the market is down and fewer units when the market is up. This concept is called **Rupee Cost Averaging**.

### Example
- Month 1: Market is high. Your ₹5,000 buys 50 units.
- Month 2: Market drops! People panic, but your ₹5,000 automatically buys 80 units because they are "on sale."
- Result: Over 5 years, your average cost per unit ends up being much lower than if you tried to guess the right time to buy.`,
    whyItMatters: "SIPs enforce financial discipline. You pay yourself first, ensuring your wealth grows automatically in the background of your life.",
    takeaway: "Don't try to time the market. Automate your discipline with SIPs."
  },
  {
    id: "power-of-compounding",
    title: "The Magic of Compounding",
    category: "Basics of Investing",
    shortDesc: "How interest earning interest scales your wealth exponentially.",
    difficulty: "Beginner",
    readTime: "3 min",
    content: `Compounding is the process where the returns on your investments start generating their own returns over time. Albert Einstein famously called it the "Eighth Wonder of the World."

### Linear vs. Exponential
If you earn 10% on ₹1,00,000 using simple interest, you earn ₹10,000 a year. After 10 years, you have ₹2,00,000.
But with **compounding**, that first year's ₹10,000 gets added to your total. The next year, you earn 10% on ₹1,10,000. 

Over 20 or 30 years, this snowball effect causes the trajectory of your wealth to curve aggressively upwards.

### Time is Your Biggest Asset
The primary fuel for compounding is *time*. A 25-year-old investing ₹5,000 a month will have vastly more wealth at age 60 than a 35-year-old investing ₹10,000 a month, simply because of the extra 10 years of compounding.`,
    whyItMatters: "Compounding means you don't have to work forever. Eventually, your money will make more money in a day than you can make in a month of working.",
    takeaway: "Start early, be consistent, and never interrupt compounding unnecessarily."
  },

  // --- Market Fundamentals ---
  {
    id: "stocks-vs-mutual-funds",
    title: "Stocks vs Mutual Funds",
    category: "Market Fundamentals",
    shortDesc: "Understanding the difference between direct equities and pooled funds.",
    difficulty: "Beginner",
    readTime: "3 min",
    content: `When you want to invest in companies, you have two primary vehicles: **Direct Stocks** and **Mutual Funds**.

### Direct Stocks
When you buy a stock, you are buying a tiny slice of ownership in a single company (like Reliance or TCS). 
- **Pros**: High potential reward if the company explodes in value. No management fees.
- **Cons**: High risk. If the company fails, your stock goes to zero. Requires intense research and continuous tracking.

### Mutual Funds
A mutual fund pools money from thousands of investors and a professional fund manager buys a diversified basket of stocks on their behalf.
- **Pros**: Instant diversification. Your money is spread across 30-50 companies. If one fails, the others balance it out. Professionally managed.
- **Cons**: You pay an "Expense Ratio" (a small annual fee, usually 0.5% - 1.5%) for the management.

### The Verdict
For 95% of retail investors, Mutual Funds (specifically Index Funds) are the mathematically superior choice because they require no specialized knowledge and are inherently diversified.`,
    whyItMatters: "Picking individual stocks is a full-time job. Mutual funds allow you to piggyback on the growth of the entire economy effortlessly.",
    takeaway: "Use Mutual Funds for core wealth building. Only buy direct stocks with 'play money'."
  },
  {
    id: "understanding-etfs",
    title: "ETFs Explained",
    category: "Market Fundamentals",
    shortDesc: "Exchange Traded Funds: The modern hybrid of stocks and mutual funds.",
    difficulty: "Intermediate",
    readTime: "3 min",
    content: `**ETF** stands for Exchange Traded Fund. Think of an ETF as a mutual fund that trades on the stock market like a regular stock.

### How it Works
Like a mutual fund, an ETF holds a basket of underlying assets. For example, a NIFTY 50 ETF holds the top 50 companies in India. However, unlike a mutual fund where you buy units at the end of the day directly from the fund house, you buy ETF shares on the stock exchange (like NSE) during active trading hours.

### Key Benefits
1. **Low Cost**: ETFs are usually passively managed (they just track an index), meaning their expense ratios are incredibly low (often under 0.1%).
2. **Liquidity**: You can buy and sell them instantly at precisely known prices during market hours.
3. **No Minimum SIPs**: You can buy just one single unit of an ETF if you want.

### Why not use them always?
To buy ETFs, you need a Demat account and a broker, whereas traditional mutual funds can be bought directly from the AMC. Also, automating SIPs into ETFs is slightly more complex than traditional mutual funds.`,
    whyItMatters: "ETFs are the lowest-cost way to own the entire stock market, making them the preferred vehicle for modern, passive investors.",
    takeaway: "ETFs give you the diversification of a mutual fund with the trading ease of a stock."
  },
  {
    id: "market-volatility",
    title: "Taming Market Volatility",
    category: "Market Fundamentals",
    shortDesc: "Why markets crash, and why you shouldn't panic.",
    difficulty: "Intermediate",
    readTime: "4 min",
    content: `**Volatility** refers to how wildly the prices of stocks swing up and down over a short period. 

Many beginners confuse volatility with **risk**. They are not the same thing. 
- **Risk** is the permanent loss of capital (the company goes bankrupt).
- **Volatility** is the temporary fluctuation of prices (the market drops 20% due to a pandemic, but recovers two years later).

### The Market Breathes
Stock markets are driven by human psychology—fear and greed. In the short term, news, wars, and politics cause the market to swing wildly. In the long term, the market acts as a weighing machine that tracks corporate profits, which generally go up as human civilization advances.

### How to use it to your advantage
When markets crash, inexperienced investors panic and sell everything, locking in their losses. Experienced SIP investors smile, because their automated investments are suddenly buying more units at a heavy discount.`,
    whyItMatters: "Panic selling during high volatility destroys more wealth than actual economic recessions.",
    takeaway: "Volatility is the price of admission you pay for long-term compounding. Tolerate the bumps."
  },

  // --- Risk & Strategy ---
  {
    id: "asset-allocation",
    title: "Asset Allocation",
    category: "Risk & Strategy",
    shortDesc: "The secret sauce of successful long-term portfolios.",
    difficulty: "Intermediate",
    readTime: "3 min",
    content: `Studies show that over 90% of your investment returns are determined not by *which* specific stocks you pick, but by your **Asset Allocation**—how you divide your money across different categories.

### The Core Asset Classes
1. **Equity (Stocks/Mutual Funds)**: The growth engine. High volatility, high long-term returns. Beats inflation easily.
2. **Debt (Bonds/FDs/PF)**: The shock absorbers. Low returns (matches inflation), but highly stable. Won't crash when the stock market crashes.
3. **Gold**: The hedge. Usually moves inversely to stocks during extreme panics.

### The Perfect Mix
If you are 25 years old building retirement wealth, a 90% Equity / 10% Debt mix makes sense because you have 35 years to recover from any market crashes.
If you are 55 and retiring soon, a 40% Equity / 60% Debt mix protects your accumulated wealth from a sudden crash right when you need the money.`,
    whyItMatters: "Proper asset allocation ensures that no single economic event can wipe out your financial future.",
    takeaway: "Don't put all your eggs in one basket. Balance growth (equity) with stability (debt)."
  },
  {
    id: "time-horizon",
    title: "Long-term vs Short-term",
    category: "Risk & Strategy",
    shortDesc: "Matching your investments to when you need the cash.",
    difficulty: "Beginner",
    readTime: "2 min",
    content: `The single biggest mistake new investors make is putting short-term money into long-term assets.

### Short-Term Money (< 3 Years)
If you are saving for a downpayment for a house next year, or a wedding, **do not put that money in the stock market**. The market could crash 30% tomorrow, and you wouldn't have time to wait for the recovery. 
- **Use:** Fixed Deposits, Liquid Mutual Funds, Arbitrage Funds.

### Long-Term Money (5+ Years)
If you are saving for retirement 25 years away, **do not put that money in a Fixed Deposit**. After inflation and taxes, FDs generate near zero (or negative) real returns over decades. 
- **Use:** Equity Mutual Funds, Index Funds, ETFs.`,
    whyItMatters: "Your 'Time Horizon' dictates your risk capacity. The longer your money can stay invested without you needing it, the more aggressive you can be.",
    takeaway: "Short term = Stability. Long term = Aggressive Growth."
  }
];
