<div align="center">

<img src="https://img.shields.io/badge/CRYPTONEX-Market%20Intelligence-FBB017?style=for-the-badge&logoColor=000000&labelColor=0C0A06" alt="CryptoNex" height="40"/>

# ₿ CRYPTONEX

### _Professional Crypto Market Intelligence — Powered by GPT-4o_

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://cryptonex.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-FBB017?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-22C55E?style=for-the-badge)](CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/Status-Active-22C55E?style=for-the-badge)]()

<br/>

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![GPT-4o](https://img.shields.io/badge/GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

<br/>

> **Real-time data · AI-powered analysis · 100+ coins · TradingView charts · Smart price alerts**

<br/>

---

</div>

## 📖 Overview

**CryptoNex** is a professional-grade cryptocurrency analytics platform that unifies live market data, advanced charting, and AI-powered trading insights into a single, clean, ad-free dashboard. Whether you are a day trader scanning momentum plays or a long-term investor researching fundamentals, CryptoNex gives you institutional-quality intelligence at an accessible price.

> 💡 _The current prototype is built with vanilla HTML / CSS / JS and is actively being migrated to a full **MERN stack** (Vite + React + Express.js + MongoDB)._

<br/>

---

## ✨ Key Features

<br/>

### 📊 Live Market Dashboard

| Feature                     | Description                                                                |
| --------------------------- | -------------------------------------------------------------------------- |
| 🟢 **Live Ticker**          | Real-time prices for 30+ top coins, refreshed every 30 seconds             |
| 🗺️ **Market Heatmap**       | Market-cap weighted colour-coded visualisation of the entire crypto market |
| 📈 **Top Gainers & Losers** | The 5 biggest movers in each direction, updated live                       |
| 🔍 **Instant Search**       | Filter 100+ coins by name or symbol in real time                           |
| 📰 **Live News Feed**       | Latest crypto news per coin via TradingView Timeline                       |

<br/>

### 🪙 Coin Detail Page

Each coin page includes a full analytical breakdown:

- 📉 **Advanced Price Chart** — Full TradingView chart with technical indicators and drawing tools
- 💰 **Current Price** — Live price fetched from CoinGecko, refreshed every 60 seconds
- 📊 **24h Change** — Percentage and direction badge
- 🏦 **Market Capitalisation** — Formatted in T / B / M units
- 🔄 **24h Trading Volume** — Updated alongside price
- 📐 **Technical Analysis** — RSI, MACD, Moving Averages via TradingView
- 🏢 **Coin Profile** — Background, stats, and metadata
- 📰 **Top News & Stories** — Live news timeline specific to the asset

<br/>

### 🤖 AI Market Analysis — _Powered by GPT-4o_

> One click generates a complete institutional-grade market report using live price data.

```
📡  Market Signal      →  BUY / HOLD / SELL
📊  Confidence Score   →  0 – 100%
⚠️  Risk Level         →  LOW / MEDIUM / HIGH  (Score 1–5)
⏱️  Market Momentum    →  Gauge  0 – 100
🎯  Price Predictions  →  24 Hours · 7 Days · 30 Days
📉  Prediction Chart   →  Historical trend + AI forecast line
🔵  Support & Resistance → Key price levels with % distance
🔧  Indicator Strength  →  RSI · MACD · MA · Volume · BB · Custom
💬  AI Summary         →  Typewriter-animated 2–3 sentence analysis
```

<br/>

### 🔔 Smart Price Alerts

- Set **above** or **below** price targets for any coin
- Instant **toast notifications** when your target is hit
- **Persistent history log** across browser sessions (localStorage)
- **Badge counter** on the notification bell for unread alerts

<br/>

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   User visits CryptoNex                 │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │   Landing Page / Auth      │
              │   Register · Login · Plan  │
              └─────────────┬──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │      Live Dashboard        │
              │  Heatmap · Table · Alerts  │
              └─────────────┬──────────────┘
                            │  click any coin
              ┌─────────────▼──────────────┐
              │      Coin Detail Page      │
              │  Chart · Price · News      │
              └─────────────┬──────────────┘
                            │  click Analyse
              ┌─────────────▼──────────────┐
              │    GPT-4o AI Analysis      │
              │  Signal · Predictions · SR │
              └────────────────────────────┘
```

<br/>

---

## 🛠️ Technology Stack

### Frontend

| Technology                                                                                                              | Purpose                                 |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) **Vite + React**          | Production SPA with fast HMR            |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white) **CSS Custom Properties** | Full dark / light theming               |
| **Bebas Neue · Outfit · Space Mono**                                                                                    | Display, body, and monospace typography |

### Backend

| Technology                                                                                                               | Purpose                                    |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) **Node.js**     | Server runtime                             |
| ![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white) **Express.js** | REST API and routing                       |
| ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) **MongoDB**       | User accounts, subscriptions, cloud alerts |

### APIs & Integrations

| Service                                                                                                                         | Usage                                              |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| ![CoinGecko](https://img.shields.io/badge/CoinGecko-8DC647?style=flat-square&logo=coingecko&logoColor=white) **CoinGecko API**  | Live prices, market cap, volume, sparklines        |
| **TradingView Widgets**                                                                                                         | Advanced charts, heatmap, technical analysis, news |
| ![OpenAI](https://img.shields.io/badge/GPT--4o-412991?style=flat-square&logo=openai&logoColor=white) **GPT-4o (GitHub Models)** | AI market analysis and predictions                 |

### Deployment

| Service                                                                                                        | Usage                                   |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) **Vercel** | Frontend hosting + serverless functions |

<br/>

---

## 🖥️ Screens & Feature Walkthrough

<details>
<summary><strong>🏠 Landing Page</strong></summary>
<br/>

- Animated hero with live market stats counter
- Full **AI analysis feature showcase** with interactive demos
- **Live market ticker** with real-time prices
- Sector performance bars, market health gauge, dominance breakdown
- Three-tier **pricing section** (Free · Pro · Institutional) with monthly/annual toggle
- Testimonials and "How It Works" 4-step guide

</details>

<details>
<summary><strong>🔐 Authentication</strong></summary>
<br/>

- **Login** — Email/password with remember-me, OAuth placeholders (Google, GitHub)
- **Register** — Full name, email, password with strength indicator, plan selector at sign-up
- Client-side validation with inline error messages
- Animated success state with redirect to dashboard

</details>

<details>
<summary><strong>📊 Main Dashboard</strong></summary>
<br/>

- **Stats bar** — Tracking count, gainers, losers, total market cap, refresh timer
- **Market heatmap** — TradingView crypto heatmap (market-cap weighted, colour-coded)
- **Mini sparklines** — 7-day charts for BTC, ETH, SOL, BNB
- **Top Gainers / Losers** — Top 5 in each direction with click-through to detail page
- **All Coins table** — 100 coins, searchable, hover tooltips with extended metrics
- **Price alerts panel** — Create, monitor, and clear alerts from the header bell

</details>

<details>
<summary><strong>🪙 Coin Detail Page</strong></summary>
<br/>

- Live data freshness banner (green = live · amber = fallback · error = retry)
- **TradingView advanced chart** — Full interactive chart for COIN/USDT on Binance
- **AI Analysis panel** — Full GPT-4o result dashboard (see above)
- **Technical Analysis widget** — RSI, MACD, MA and more
- **Symbol Profile widget** — Background, metrics, and exchange data
- **News Timeline widget** — Live news relevant to the specific coin

</details>

<br/>

---

## 🚀 Installation Guide

### Prerequisites

```bash
node >= 18.0.0
npm  >= 9.0.0
```

### 1 — Clone the repository

```bash
git clone https://github.com/yourusername/cryptonex.git
cd cryptonex
```

### 2 — Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3 — Configure environment variables

```bash
# client/.env
VITE_COINGECKO_API_KEY=your_coingecko_key
VITE_GITHUB_GPT_TOKEN=your_github_models_token

# server/.env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 4 — Run the development server

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

### 5 — Open in browser

```
http://localhost:5173
```

<br/>

---

## 📱 Usage Guide

```
1.  Visit the landing page and explore features
2.  Click "Get Started Free" to create an account
3.  Open the dashboard — the live table loads immediately
4.  Search for any coin using the header search bar
5.  Click a coin row to open its detail page
6.  Click "Analyse" to run the GPT-4o AI analysis
7.  Use the 🔔 bell icon to set price alerts
8.  Toggle between light and dark mode using the theme button
```

<br/>

---

## 🔮 Future Improvements

| Priority      | Feature                                                      |
| ------------- | ------------------------------------------------------------ |
| 🔴 **High**   | Full MERN stack migration (Vite + React + Express + MongoDB) |
| 🔴 **High**   | JWT authentication + bcrypt password hashing                 |
| 🟡 **Medium** | WebSocket live price streaming (replace 30s polling)         |
| 🟡 **Medium** | Portfolio tracker with P&L and AI rebalancing suggestions    |
| 🟡 **Medium** | Multi-device alert sync via MongoDB                          |
| 🟢 **Low**    | Webhook delivery for Institutional alert triggers            |
| 🟢 **Low**    | Percentage-change alerts (e.g. alert on 5% move in 1 hour)   |
| 🟢 **Low**    | Email and browser push notification delivery                 |
| 🟢 **Low**    | Mobile application (React Native)                            |

<br/>

---

## 🤝 Contributing

Contributions are warmly welcome! Here's how to get started:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature description"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct and contribution guidelines.

<br/>

---

## 📄 License

```
MIT License — Copyright (c) 2025 CryptoNex

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to deal in the Software without restriction.
```

See the full [LICENSE](LICENSE) file for details.

<br/>

---

<div align="center">

**⚠️ Disclaimer**

_CryptoNex is built for informational and educational purposes only._
_Nothing on this platform constitutes financial advice._
_Always do your own research before making any investment decisions._

<br/>

---

Made with ❤️ by the **CryptoNex Team**

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/cryptonex?style=social)](https://github.com/yourusername/cryptonex)
[![Follow](https://img.shields.io/github/followers/yourusername?style=social)](https://github.com/yourusername)

</div>
