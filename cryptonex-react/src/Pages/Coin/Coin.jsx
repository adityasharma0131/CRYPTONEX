import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AmbientBg from "../../Components/AmbientBg";
import Ticker from "../../Components/Ticker";
import ThemeToggle from "../../Components/ThemeToggle";
import { fetchSingleCoin } from "../../hooks/useCoinData";
import { formatPrice, formatCompact, formatPct } from "../../utils/formatters";
import "../../styles/global.css";
import "./Coin.css";

const GITHUB_GPT_TOKEN =
  (typeof window !== "undefined" && window.__ENV__?.GITHUB_GPT_TOKEN) || null;
const GITHUB_MODELS_ENDPOINT =
  "https://models.inference.ai.azure.com/chat/completions";
const GPT_MODEL = "gpt-4o";

export default function Coin() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const symbol = params.get("symbol") || "BTC";
  const coinName = params.get("name") || "Bitcoin";
  const image = params.get("image") || "";
  const urlPrice = parseFloat(params.get("price")) || 0;
  const urlChange = parseFloat(params.get("change")) || 0;
  const urlMcap = parseFloat(params.get("mcap")) || 0;

  const [marketData, setMarketData] = useState({
    price: urlPrice,
    change: urlChange,
    mcap: urlMcap,
    volume: 0,
    high24h: 0,
    low24h: 0,
    source: "url",
    lastFetch: null,
    fetchError: null,
  });
  const [dataStatus, setDataStatus] = useState("loading");
  const [coinImage, setCoinImage] = useState(image);
  const [aiState, setAiState] = useState("idle");
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiTimestamp, setAiTimestamp] = useState(null);
  const [loadingSteps, setLoadingSteps] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const chartRef = useRef(null);
  const chartBuilt = useRef(false);
  const refreshTimer = useRef(null);
  const tvSym = `BINANCE:${symbol}USDT`;

  // Fetch live market data
  const fetchLive = useCallback(async () => {
    setDataStatus("fetching");
    try {
      const coin = await fetchSingleCoin(symbol);
      setMarketData({
        price:
          typeof coin.current_price === "number"
            ? coin.current_price
            : urlPrice,
        change:
          typeof coin.price_change_percentage_24h === "number"
            ? coin.price_change_percentage_24h
            : urlChange,
        mcap: typeof coin.market_cap === "number" ? coin.market_cap : urlMcap,
        volume: typeof coin.total_volume === "number" ? coin.total_volume : 0,
        high24h: typeof coin.high_24h === "number" ? coin.high_24h : 0,
        low24h: typeof coin.low_24h === "number" ? coin.low_24h : 0,
        source: "live",
        lastFetch: new Date(),
        fetchError: null,
      });
      if (coin.image && !image) setCoinImage(coin.image);
      setDataStatus("live");
    } catch (err) {
      setMarketData((prev) => ({
        ...prev,
        source: "url",
        fetchError: err.message,
      }));
      setDataStatus("error");
    }
  }, [symbol, urlPrice, urlChange, urlMcap, image]);

  useEffect(() => {
    fetchLive();
    refreshTimer.current = setInterval(fetchLive, 60000);
    return () => clearInterval(refreshTimer.current);
  }, [fetchLive]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(refreshTimer.current);
      } else {
        fetchLive();
        refreshTimer.current = setInterval(fetchLive, 60000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchLive]);

  // TradingView chart
  useEffect(() => {
    if (!chartRef.current || chartBuilt.current) return;
    chartBuilt.current = true;
    const isDark =
      document.documentElement.getAttribute("data-theme") !== "light";
    const s = document.createElement("script");
    s.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: false,
      interval: "60",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: tvSym,
      theme: isDark ? "dark" : "light",
      timezone: "Etc/UTC",
      backgroundColor: "rgba(0,0,0,0)",
      gridColor: "rgba(255,255,255,0.03)",
      withdateranges: true,
      autosize: true,
    });
    chartRef.current.appendChild(s);
  }, [tvSym]);

  // TradingView widgets
  const widgetsRef = useRef(null);
  const widgetsBuilt = useRef(false);
  useEffect(() => {
    if (!widgetsRef.current || widgetsBuilt.current) return;
    widgetsBuilt.current = true;
    const isDark =
      document.documentElement.getAttribute("data-theme") !== "light";
    const wTheme = isDark ? "dark" : "light";
    const widgetConfigs = [
      {
        src: "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js",
        config: {
          colorTheme: wTheme,
          displayMode: "single",
          isTransparent: true,
          locale: "en",
          interval: "1m",
          disableInterval: false,
          width: "100%",
          height: 450,
          symbol: tvSym,
          showIntervalTabs: true,
        },
      },
      {
        src: "https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js",
        config: {
          symbol: tvSym,
          colorTheme: wTheme,
          isTransparent: true,
          locale: "en",
          width: "100%",
          height: 450,
        },
      },
      {
        src: "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js",
        config: {
          displayMode: "regular",
          feedMode: "symbol",
          symbol: tvSym,
          colorTheme: wTheme,
          isTransparent: true,
          locale: "en",
          width: "100%",
          height: 450,
        },
      },
    ];
    widgetConfigs.forEach(({ src, config }) => {
      const card = document.createElement("div");
      card.className = "widget-card";
      const wrap = document.createElement("div");
      wrap.className = "tradingview-widget-container";
      wrap.style.height = "100%";
      const inner = document.createElement("div");
      inner.className = "tradingview-widget-container__widget";
      inner.style.height = "100%";
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.src = src;
      s.async = true;
      s.textContent = JSON.stringify(config);
      wrap.appendChild(inner);
      wrap.appendChild(s);
      card.appendChild(wrap);
      widgetsRef.current.appendChild(card);
    });
  }, [tvSym]);

  document.title = `CryptoNex — ${coinName}`;

  const { price, change, mcap, volume, source, lastFetch } = marketData;

  const priceDisplay = price > 0 ? formatPrice(price) : null;
  const changeClass = change > 0.05 ? "up" : change < -0.05 ? "dn" : "flat";
  const changeArrow = change > 0.05 ? "▲" : change < -0.05 ? "▼" : "→";
  const changeSign = change >= 0 ? "+" : "";

  return (
    <div style={{ paddingBottom: 80 }}>
      <AmbientBg variant="coin" />
      <Ticker
        currentSymbol={symbol}
        currentPrice={price}
        currentChange={change}
      />

      <header className="coin-header">
        <div className="logo-wrap">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="logo-text-wrap">
            <span className="logo-text">CryptoNex</span>
            <span className="logo-tagline">Market Intelligence</span>
          </div>
          <span className="logo-badge">
            <span className="live-dot"></span>LIVE
          </span>
        </div>
        <div className="header-right">
          <div className={`data-status-badge ${dataStatus}`}>
            <span className="data-status-dot"></span>
            <span>
              {{
                loading: "LOADING",
                fetching: "FETCHING",
                live: "LIVE DATA",
                error: "FALLBACK",
              }[dataStatus] || dataStatus.toUpperCase()}
            </span>
          </div>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M5 12l7 7M5 12l7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Dashboard
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="coin-page">
        {/* Freshness banner */}
        {dataStatus === "live" && (
          <div className="data-freshness-bar live">
            ✓ Live market data loaded · Updated{" "}
            {lastFetch?.toLocaleTimeString()} · Auto-refreshes every 60s
          </div>
        )}
        {dataStatus === "error" && (
          <div className="data-freshness-bar stale">
            ⚡ Live fetch failed — using URL params as fallback.
            <button onClick={fetchLive} className="retry-btn">
              RETRY
            </button>
          </div>
        )}

        {/* Coin header */}
        <div className="coin-page-header">
          <div className="coin-identity">
            <div className="coin-img-wrap">
              <img src={coinImage} alt={`${coinName} logo`} />
            </div>
            <div className="coin-name-group">
              <h1>{coinName}</h1>
              <div className="coin-meta">
                <span className="coin-sym-pill">{symbol} / USDT</span>
                <span className="coin-exchange-pill">BINANCE</span>
                {lastFetch && (
                  <span className="coin-exchange-pill">
                    ⟳ {source === "live" ? "Live" : "Cached"} ·{" "}
                    {lastFetch.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="coin-stats">
            <div className="coin-stat-item">
              <div className="coin-stat-label">Current Price</div>
              <div className="coin-stat-value">
                {priceDisplay ? (
                  priceDisplay
                ) : (
                  <span className="stat-skeleton"></span>
                )}
              </div>
            </div>
            <div className="coin-stat-item">
              <div className="coin-stat-label">24h Change</div>
              <div className={`coin-stat-change ${changeClass}`}>
                {price > 0
                  ? `${changeArrow} ${changeSign}${change.toFixed(2)}%`
                  : "—"}
              </div>
            </div>
            <div className="coin-stat-item">
              <div className="coin-stat-label">Market Cap</div>
              <div className="coin-stat-value" style={{ fontSize: 18 }}>
                {mcap > 0 ? (
                  formatCompact(mcap)
                ) : (
                  <span
                    className="stat-skeleton"
                    style={{ width: 80, height: 18 }}
                  ></span>
                )}
              </div>
            </div>
            <div className="coin-stat-item">
              <div className="coin-stat-label">24h Volume</div>
              <div className="coin-stat-value" style={{ fontSize: 18 }}>
                {volume > 0 ? (
                  formatCompact(volume)
                ) : (
                  <span
                    className="stat-skeleton"
                    style={{ width: 80, height: 18 }}
                  ></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-card">
          <div ref={chartRef} style={{ height: "100%", width: "100%" }}></div>
        </div>

        {/* AI Analysis */}
        <div className="ai-section">
          <div className="ai-section-header">
            <div>
              <div className="section-eyebrow">⬡ Powered by GPT-4o</div>
              <div className="section-title-disp">AI Market Analysis</div>
            </div>
          </div>
          <div className="ai-card">
            {!GITHUB_GPT_TOKEN && (
              <div className="ai-token-warn">
                ⚠ <strong>GITHUB_GPT_TOKEN not configured.</strong>&nbsp; Add it
                to config.js → <code>window.__ENV__.GITHUB_GPT_TOKEN</code> to
                enable AI analysis.
              </div>
            )}
            {source !== "live" && price > 0 && (
              <div className="ai-data-warn">
                ⚡ <strong>Using URL params as fallback.</strong>&nbsp; Live
                market data fetch failed — AI analysis may be less accurate.
              </div>
            )}
            <div className="ai-topbar">
              <div className="ai-topbar-left">
                <div className="ai-model-badge">
                  <span className="ai-model-dot"></span>GPT-4o · GITHUB MODELS
                </div>
                <span className="ai-topbar-title">
                  {coinName} ({symbol})
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  className={`ai-data-info ${source === "live" && price > 0 ? "ready" : price > 0 ? "stale" : ""}`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8v4M12 16h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>
                    {source === "live" && price > 0
                      ? `✓ Live data · ${formatPrice(price)} · ${lastFetch?.toLocaleTimeString()}`
                      : price > 0
                        ? `⚡ Fallback data · ${formatPrice(price)}`
                        : "Waiting for market data…"}
                  </span>
                </div>
                <button
                  className={`ai-refresh-btn${aiState === "loading" ? " loading" : ""}`}
                  onClick={() =>
                    runAnalysis(
                      marketData,
                      symbol,
                      coinName,
                      setAiState,
                      setAiResult,
                      setAiError,
                      setAiTimestamp,
                      setLoadingSteps,
                      fetchLive,
                    )
                  }
                  disabled={aiState === "loading" || price <= 0}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={
                      aiState === "loading"
                        ? { animation: "spin 0.8s linear infinite" }
                        : {}
                    }
                  >
                    <path
                      d="M23 4v6h-6M1 20v-6h6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {aiState === "loading"
                    ? "Analysing…"
                    : aiState === "done"
                      ? "Re-analyse"
                      : "Analyse"}
                </button>
              </div>
            </div>

            <AiContent
              state={aiState}
              result={aiResult}
              error={aiError}
              coinName={coinName}
              symbol={symbol}
              marketData={marketData}
              loadingSteps={loadingSteps}
            />

            {aiTimestamp && (
              <div className="ai-timestamp">
                <span>
                  Last analysis: {aiTimestamp} · Price at analysis:{" "}
                  {formatPrice(price)}
                </span>
                <div className="ai-powered-by">
                  ANALYSIS BY <span>GPT-4o</span> · GITHUB MODELS
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="widgets-grid" ref={widgetsRef}></div>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">CryptoNex</span>
            <span className="footer-sep">·</span>
            <span>
              Data by CoinGecko &amp; TradingView · AI by GitHub Models
            </span>
          </div>
          <div className="footer-right">
            <span className="footer-disclaimer">Not financial advice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── AI Content renderer ───────────────────────────────────────────────────
function AiContent({
  state,
  result,
  error,
  coinName,
  symbol,
  marketData,
  loadingSteps,
}) {
  const stepLabels = [
    "Fetching live market data",
    "Building analysis prompt",
    "Running GPT-4o inference",
    "Computing price predictions",
    "Parsing structured output",
  ];

  if (state === "idle") {
    return (
      <div className="ai-idle-state">
        <div className="ai-idle-emoji">🤖</div>
        <div className="ai-idle-title">Ready to Analyse</div>
        <div className="ai-idle-sub">
          Fetching live market data… Click{" "}
          <strong style={{ color: "var(--accent)" }}>Analyse</strong> once data
          loads.
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="ai-loading-overlay">
        <div className="ai-scan-animation">
          <div className="ai-scan-ring"></div>
          <div className="ai-scan-ring"></div>
          <div className="ai-scan-ring"></div>
          <div className="ai-scan-core">🧠</div>
        </div>
        <div className="ai-loading-title">Analysing {coinName}</div>
        <div className="ai-loading-sub">
          GPT-4o is computing price predictions using{" "}
          <strong
            style={{
              color:
                marketData.source === "live" ? "var(--green)" : "var(--accent)",
            }}
          >
            {marketData.source === "live" ? "live" : "cached"}
          </strong>{" "}
          market data at{" "}
          <strong style={{ color: "var(--accent)" }}>
            {formatPrice(marketData.price)}
          </strong>
          …
        </div>
        <div className="ai-loading-steps">
          {stepLabels.map((label, i) => (
            <div
              key={i}
              className={`ai-loading-step${loadingSteps[i] === "done" ? " done" : loadingSteps[i] === "active" ? " active" : ""}`}
            >
              <div className="step-indicator">
                {loadingSteps[i] === "done"
                  ? "✓"
                  : loadingSteps[i] === "active"
                    ? "▶"
                    : "—"}
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state === "error") {
    const isToken =
      error?.includes("GITHUB_GPT_TOKEN") ||
      error?.includes("401") ||
      error?.includes("403");
    return (
      <div className="ai-error-state">
        <div className="ai-error-icon">⚠️</div>
        <div className="ai-error-title">Analysis Failed</div>
        <div className="ai-error-desc">{error}</div>
        {isToken && (
          <div className="ai-error-hint">
            Set GITHUB_GPT_TOKEN in config.js → window.__ENV__.GITHUB_GPT_TOKEN
          </div>
        )}
      </div>
    );
  }

  if (state === "done" && result) {
    return (
      <AiDashboard
        analysis={result}
        marketData={marketData}
        coinName={coinName}
        symbol={symbol}
      />
    );
  }
  return null;
}

// ─── AI Dashboard ──────────────────────────────────────────────────────────
function AiDashboard({ analysis: a, marketData, coinName, symbol }) {
  const summaryRef = useRef(null);
  const confBarRef = useRef(null);
  const volatBarRef = useRef(null);

  useEffect(() => {
    if (!summaryRef.current || !a.summary) return;
    const el = summaryRef.current;
    el.innerHTML = "";
    const cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";
    el.appendChild(cursor);
    let i = 0,
      lastTime = 0;
    const CHAR_DELAY = 18;
    function step(ts) {
      if (ts - lastTime >= CHAR_DELAY) {
        if (i < a.summary.length) {
          el.insertBefore(document.createTextNode(a.summary[i++]), cursor);
          lastTime = ts;
        } else {
          cursor.remove();
          return;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [a.summary]);

  useEffect(() => {
    setTimeout(() => {
      if (confBarRef.current)
        confBarRef.current.style.width = (a.confidence || 0) + "%";
      if (volatBarRef.current)
        volatBarRef.current.style.width = (a.volatility_score || 50) + "%";
      document
        .querySelectorAll(".indicator-bar-fill[data-target]")
        .forEach((el) => {
          el.style.width = el.getAttribute("data-target");
        });
      document
        .querySelectorAll(".pred-conf-fill[data-target]")
        .forEach((el) => {
          el.style.width = el.getAttribute("data-target");
        });
    }, 120);
  }, [a]);

  const sentClass = (a.sentiment || "hold").toLowerCase();
  const riskClass = (a.risk_level || "medium").toLowerCase();
  const trendClass = (a.trend || "sideways").toLowerCase();
  const sentIcon = { buy: "📈", hold: "⏸", sell: "📉" }[sentClass] || "❓";
  const volClass =
    (a.volatility_score || 50) < 35
      ? "low-v"
      : (a.volatility_score || 50) < 65
        ? "medium-v"
        : "high-v";
  const lp = marketData.price;
  const distR =
    !isNaN(parseFloat(a.resistance)) && lp > 0
      ? formatPct(((parseFloat(a.resistance) - lp) / lp) * 100)
      : "—";
  const distS =
    !isNaN(parseFloat(a.support)) && lp > 0
      ? formatPct(((parseFloat(a.support) - lp) / lp) * 100)
      : "—";
  const p = a.predictions || {};

  function changeClass(pct) {
    const v = parseFloat(pct);
    return v > 0.5 ? "up" : v < -0.5 ? "down" : "flat";
  }

  return (
    <div className="ai-dashboard">
      {/* Row 1: Signal | Confidence | Risk | Momentum */}
      <div className="ai-row-top">
        <div>
          <div className="ai-cell-label">SIGNAL</div>
          <div className="sentiment-display">
            <div className={`sentiment-icon ${sentClass}`}>{sentIcon}</div>
            <div>
              <div className={`sentiment-label ${sentClass}`}>
                {a.sentiment || "—"}
              </div>
              <div className="sentiment-sub">
                {coinName} · {symbol}/USDT
              </div>
              <div className={`trend-pill ${trendClass}`}>
                {trendClass === "bullish"
                  ? "▲"
                  : trendClass === "bearish"
                    ? "▼"
                    : "→"}{" "}
                {(a.trend || "sideways").toUpperCase()} TREND
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="ai-cell-label">CONFIDENCE</div>
          <div className="confidence-wrap">
            <div className="confidence-pct">{a.confidence || 0}%</div>
            <div className="confidence-sub">
              Model certainty ·{" "}
              {marketData.source === "live" ? (
                <span style={{ color: "var(--green)" }}>● Live</span>
              ) : (
                <span style={{ color: "var(--accent)" }}>⚡ Fallback</span>
              )}
            </div>
            <div className="confidence-bar-track">
              <div
                className="confidence-bar-fill"
                ref={confBarRef}
                style={{ width: 0 }}
              ></div>
            </div>
          </div>
        </div>
        <div>
          <div className="ai-cell-label">RISK LEVEL</div>
          <div className="risk-wrap">
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div className="risk-value">{a.risk_level || "—"}</div>
              <div className={`risk-pill ${riskClass}`}>
                Score {a.risk_score || "—"}/5
              </div>
            </div>
            <div className="risk-meter">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`risk-bar-seg seg-${i}${i <= (a.risk_score || 3) ? " active" : ""}`}
                ></div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="ai-cell-label" style={{ marginBottom: 4 }}>
                VOLATILITY
              </div>
              <div className="volatility-score">
                {a.volatility_score || "—"}
                <span
                  style={{
                    fontSize: 16,
                    fontFamily: "var(--font-body)",
                    color: "var(--text-muted)",
                  }}
                >
                  /100
                </span>
              </div>
              <div className="volatility-bar-track">
                <div
                  className={`volatility-bar-fill ${volClass}`}
                  ref={volatBarRef}
                  style={{ width: 0 }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="ai-cell-label">MOMENTUM</div>
          <div className="momentum-wrap">
            <MomentumGauge momentum={a.momentum} />
          </div>
        </div>
      </div>

      {/* Row 2: Price Predictions */}
      <div className="ai-row-predictions">
        {["short", "mid", "long"].map((h) => {
          const pred = p[h] || {};
          const label = { short: "24 Hours", mid: "7 Days", long: "30 Days" }[
            h
          ];
          const cc = changeClass(pred.change_pct);
          const arrow = cc === "up" ? "▲" : cc === "down" ? "▼" : "→";
          return (
            <div key={h}>
              <div className={`pred-card-bg ${h}`}></div>
              <div className={`pred-horizon ${h}`}>◈ {label}</div>
              <div className="pred-range">
                <div className="pred-range-row">
                  <span className="pred-range-label">TARGET</span>
                  <span className="pred-price target">
                    {formatPrice(pred.price_target)}
                  </span>
                </div>
                <div className="pred-range-row">
                  <span className="pred-range-label">LOW</span>
                  <span
                    className="pred-price"
                    style={{ fontSize: 14, color: "var(--red)" }}
                  >
                    {formatPrice(pred.price_low)}
                  </span>
                </div>
                <div className="pred-range-row">
                  <span className="pred-range-label">HIGH</span>
                  <span
                    className="pred-price"
                    style={{ fontSize: 14, color: "var(--green)" }}
                  >
                    {formatPrice(pred.price_high)}
                  </span>
                </div>
              </div>
              <div className={`pred-change ${cc}`}>
                {arrow} {formatPct(pred.change_pct)}
              </div>
              <div className="pred-conf">
                CONFIDENCE
                <div className="pred-conf-bar">
                  <div
                    className="pred-conf-fill"
                    data-target={`${pred.confidence || 50}%`}
                    style={{ width: 0 }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 3: Price Chart + S/R */}
      <div className="ai-row-chart">
        <div>
          <div className="ai-cell-label">PRICE PREDICTION CHART</div>
          <PriceChart
            currentPrice={lp}
            predictions={p}
            changePercent={marketData.change}
          />
        </div>
        <div>
          <div className="ai-cell-label">SUPPORT &amp; RESISTANCE</div>
          <div className="sr-list">
            <div className="sr-item resistance">
              <div>
                <div className="sr-label">Resistance</div>
                <div className="sr-price">{formatPrice(a.resistance)}</div>
              </div>
              <div className="sr-dist">{distR}</div>
            </div>
            <div
              className="sr-item"
              style={{
                background: "var(--accent-subtle)",
                borderColor: "var(--accent-border)",
              }}
            >
              <div>
                <div className="sr-label" style={{ color: "var(--accent)" }}>
                  Current
                </div>
                <div className="sr-price">{formatPrice(lp)}</div>
              </div>
              <div className="sr-dist" style={{ color: "var(--accent)" }}>
                NOW
              </div>
            </div>
            <div className="sr-item support">
              <div>
                <div className="sr-label">Support</div>
                <div className="sr-price">{formatPrice(a.support)}</div>
              </div>
              <div className="sr-dist">{distS}</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="ai-cell-label">QUICK INDICATORS</div>
            <div className="indicators-grid">
              {(a.key_indicators || []).map((ind, i) => (
                <div
                  key={i}
                  className={`indicator-chip ${ind.signal || "neutral"}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  title={ind.note || ""}
                >
                  <span className="chip-dot"></span>
                  {ind.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Indicator Bars + Summary */}
      <div className="ai-row-indicators">
        <div>
          <div className="ai-cell-label">INDICATOR STRENGTH</div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "var(--text-muted)",
              marginBottom: 12,
              letterSpacing: ".06em",
            }}
          >
            BEARISH ←——— CENTER ———→ BULLISH · HOVER FOR DETAILS
          </div>
          <div className="indicator-bar-list">
            {(a.key_indicators || []).map((ind, i) => {
              const sig = (ind.signal || "neutral").toLowerCase();
              const strength = Math.max(0, Math.min(100, ind.strength || 50));
              let barPct;
              if (sig === "bullish")
                barPct = (((strength - 50) / 50) * 50).toFixed(1);
              else if (sig === "bearish")
                barPct = (((50 - strength) / 50) * 50).toFixed(1);
              else barPct = "4";
              return (
                <div key={i} className="indicator-bar-item">
                  <div className="indicator-bar-header">
                    <span className="indicator-bar-name">{ind.label}</span>
                    <span className={`indicator-bar-signal ${sig}`}>
                      {sig.toUpperCase()}
                    </span>
                  </div>
                  <div className="indicator-bar-track" title={ind.note || ""}>
                    <div className="indicator-bar-center"></div>
                    <div
                      className={`indicator-bar-fill ${sig}`}
                      data-target={`${barPct}%`}
                      style={{ width: 0 }}
                    ></div>
                  </div>
                  <div className="indicator-bar-tooltip">{ind.note || ""}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="ai-cell-label">AI SUMMARY</div>
          <div className="ai-summary-text" ref={summaryRef}></div>
        </div>
      </div>
    </div>
  );
}

function MomentumGauge({ momentum }) {
  const m = Math.max(0, Math.min(100, momentum || 50));
  const angle = (m / 100) * 180 - 90;
  const color =
    m >= 60 ? "var(--green)" : m <= 40 ? "var(--red)" : "var(--accent)";
  const label = m >= 65 ? "BULLISH" : m <= 35 ? "BEARISH" : "NEUTRAL";
  const arcLen = Math.PI * 36;
  const fillLen = (m / 100) * arcLen;
  const gapLen = arcLen - fillLen;
  return (
    <div className="momentum-wrap">
      <svg
        className="momentum-gauge"
        viewBox="0 0 100 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--red)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--green)" />
          </linearGradient>
        </defs>
        <path
          d="M 14 50 A 36 36 0 0 1 86 50"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 14 50 A 36 36 0 0 1 86 50"
          fill="none"
          stroke="url(#mgGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${fillLen.toFixed(1)} ${gapLen.toFixed(1)}`}
          pathLength={arcLen.toFixed(1)}
        />
        <g transform={`translate(50,50) rotate(${angle})`}>
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-30"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <circle cx="50" cy="50" r="4" fill={color} />
        <text
          x="6"
          y="57"
          fontSize="7"
          fill="var(--red)"
          fontFamily="Space Mono,monospace"
          textAnchor="middle"
        >
          B
        </text>
        <text
          x="94"
          y="57"
          fontSize="7"
          fill="var(--green)"
          fontFamily="Space Mono,monospace"
          textAnchor="middle"
        >
          B
        </text>
      </svg>
      <div className="momentum-value" style={{ color }}>
        {label}
      </div>
      <div className="momentum-sub">{m}/100</div>
    </div>
  );
}

function PriceChart({ currentPrice, predictions, changePercent }) {
  const current = parseFloat(currentPrice) || 50000;
  const ch24 = changePercent || 0;
  const p = predictions || {};
  const histCount = 8;
  const priceAtDayAgo = current / (1 + ch24 / 100);
  const histPoints = [];
  for (let i = 0; i < histCount; i++) {
    const frac = i / (histCount - 1);
    const jitter = Math.sin(i * 2.4) * 0.007 + Math.cos(i * 1.7) * 0.005;
    histPoints.push(
      priceAtDayAgo + (current - priceAtDayAgo) * frac + current * jitter,
    );
  }
  histPoints[histCount - 1] = current;
  const t24 = p.short?.price_target || current * 1.02;
  const t7d = p.mid?.price_target || current * 1.05;
  const t30d = p.long?.price_target || current * 1.1;
  const predPoints = [current, t24, t7d, t30d];
  const allPrices = [...histPoints, t24, t7d, t30d];
  const minP = Math.min(...allPrices) * 0.996;
  const maxP = Math.max(...allPrices) * 1.004;
  const range = maxP - minP || 1;
  const W = 560,
    H = 160,
    PAD_L = 4,
    PAD_R = 56,
    PAD_T = 14,
    PAD_B = 20;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const splitX = PAD_L + plotW * 0.55;
  const histX = (i) => PAD_L + (i / (histCount - 1)) * plotW * 0.55;
  const predX = (i) => splitX + (i / (predPoints.length - 1)) * plotW * 0.45;
  const yOf = (pv) => PAD_T + plotH - ((pv - minP) / range) * plotH;
  const histCoords = histPoints
    .map((pv, i) => `${histX(i)},${yOf(pv)}`)
    .join(" ");
  const predCoords = predPoints
    .map((pv, i) => `${predX(i)},${yOf(pv)}`)
    .join(" ");
  const histArea = `${PAD_L},${PAD_T + plotH} ${histCoords} ${splitX},${PAD_T + plotH}`;
  const predArea = `${splitX},${PAD_T + plotH} ${predCoords} ${PAD_L + plotW},${PAD_T + plotH}`;
  const isBull = t30d >= current;
  const predColor = isBull ? "var(--green)" : "var(--red)";
  const predFill = isBull ? "rgba(34,197,94,0.07)" : "rgba(248,113,113,0.07)";
  const midP = (minP + maxP) / 2;
  const yLabels = [
    { price: maxP, y: PAD_T + 8 },
    { price: midP, y: PAD_T + plotH / 2 + 4 },
    { price: minP, y: PAD_T + plotH - 2 },
  ];
  const dotData = [
    { x: splitX, y: yOf(current), label: "NOW", color: "var(--accent)" },
    { x: predX(1), y: yOf(t24), label: "24H", color: "var(--blue)" },
    { x: predX(2), y: yOf(t7d), label: "7D", color: "var(--accent)" },
    { x: predX(3), y: yOf(t30d), label: "30D", color: predColor },
  ];
  return (
    <div className="price-chart-wrap">
      <svg
        className="price-chart-svg"
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points={histArea} fill="rgba(168,150,111,0.07)" />
        <polygon points={predArea} fill={predFill} />
        <line
          x1={splitX}
          y1={PAD_T}
          x2={splitX}
          y2={PAD_T + plotH}
          className="chart-now-line"
        />
        <polyline
          points={histCoords}
          className="chart-line chart-line-history"
        />
        <polyline
          points={predCoords}
          className="chart-line chart-line-predict"
          stroke={predColor}
        />
        {dotData.map((d, i) => (
          <g key={i}>
            <circle
              cx={d.x.toFixed(1)}
              cy={d.y.toFixed(1)}
              r="4"
              fill={d.color}
              stroke="var(--bg-base)"
              strokeWidth="1.5"
            />
            <text
              x={d.x.toFixed(1)}
              y={(d.y - 9).toFixed(1)}
              fontFamily="Space Mono,monospace"
              fontSize="8"
              fill={d.color}
              textAnchor="middle"
            >
              {d.label}
            </text>
          </g>
        ))}
        {yLabels.map((l, i) => (
          <text
            key={i}
            x={W - 2}
            y={l.y}
            fontFamily="Space Mono,monospace"
            fontSize="8"
            fill="var(--text-muted)"
            textAnchor="end"
          >
            {formatPrice(l.price)}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        <div className="chart-legend-item">
          <div
            style={{
              width: 16,
              height: 2,
              borderRadius: 1,
              background: "var(--text-muted)",
            }}
          ></div>
          HISTORICAL (24H TREND)
        </div>
        <div className="chart-legend-item">
          <div
            style={{
              width: 16,
              height: 0,
              borderTop: `2px dashed ${predColor}`,
            }}
          ></div>
          AI PREDICTED
        </div>
      </div>
    </div>
  );
}

// ─── Run Analysis ──────────────────────────────────────────────────────────
async function runAnalysis(
  marketData,
  symbol,
  coinName,
  setAiState,
  setAiResult,
  setAiError,
  setAiTimestamp,
  setLoadingSteps,
  fetchLive,
) {
  if (!GITHUB_GPT_TOKEN) {
    setAiState("error");
    setAiError(
      "GITHUB_GPT_TOKEN is not configured. Add it to config.js as window.__ENV__.GITHUB_GPT_TOKEN.",
    );
    return;
  }
  setAiState("loading");
  setLoadingSteps(["active", false, false, false, false]);
  const advanceStep = (i) => {
    setLoadingSteps((prev) =>
      prev.map((s, idx) => (idx < i ? "done" : idx === i ? "active" : false)),
    );
  };
  try {
    await fetchLive();
    advanceStep(1);
    if (marketData.price <= 0)
      throw new Error("Market price data is unavailable.");
    const prompt = buildPrompt(marketData, symbol, coinName);
    advanceStep(2);
    const [response] = await Promise.all([
      fetchAi(prompt),
      new Promise((r) => setTimeout(r, 3600)),
    ]);
    advanceStep(3);
    const parsed = parseAiResponse(response, marketData.price);
    advanceStep(4);
    setAiResult(parsed);
    setAiState("done");
    setAiTimestamp(new Date().toLocaleString());
  } catch (err) {
    setAiState("error");
    setAiError(err.message || "An unexpected error occurred.");
  }
}

function buildPrompt(md, symbol, coinName) {
  return `You are a professional cryptocurrency market analyst with access to real-time market data.
Analyse the asset below and return ONLY a valid JSON object — no markdown, no text outside the JSON.

Asset:
- Name: ${coinName}
- Symbol: ${symbol}
- Current Price: ${md.price} USD
- 24h Change: ${md.change.toFixed(4)}%
- Market Cap: ${md.mcap > 0 ? formatCompact(md.mcap) : "Unknown"}
- 24h Volume: ${md.volume > 0 ? formatCompact(md.volume) : "Unknown"}
- 24h High: ${md.high24h > 0 ? md.high24h + " USD" : "Unknown"}
- 24h Low: ${md.low24h > 0 ? md.low24h + " USD" : "Unknown"}

Return EXACTLY this schema:
{
  "sentiment": "BUY"|"HOLD"|"SELL",
  "confidence": <0-100>,
  "trend": "bullish"|"bearish"|"sideways",
  "momentum": <0-100>,
  "risk_level": "LOW"|"MEDIUM"|"HIGH",
  "risk_score": <1-5>,
  "volatility_score": <0-100>,
  "support": <number below ${md.price}>,
  "resistance": <number above ${md.price}>,
  "summary": "<2-3 sentence analysis>",
  "predictions": {
    "short": { "horizon": "24h", "price_low": <number>, "price_target": <number>, "price_high": <number>, "change_pct": <number>, "confidence": <0-100> },
    "mid":   { "horizon": "7d",  "price_low": <number>, "price_target": <number>, "price_high": <number>, "change_pct": <number>, "confidence": <0-100> },
    "long":  { "horizon": "30d", "price_low": <number>, "price_target": <number>, "price_high": <number>, "change_pct": <number>, "confidence": <0-100> }
  },
  "key_indicators": [
    { "label": "<name>", "signal": "bullish"|"bearish"|"neutral", "strength": <0-100>, "note": "<explanation>" }
  ]
}
Rules: key_indicators must have exactly 6 entries (RSI, MACD, Moving Average, Volume, Bollinger Bands, + 1 contextual). ALL prices must be close to ${md.price} USD.`;
}

async function fetchAi(prompt) {
  const resp = await fetch(GITHUB_MODELS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + GITHUB_GPT_TOKEN,
    },
    body: JSON.stringify({
      model: GPT_MODEL,
      temperature: 0.25,
      max_tokens: 1400,
      messages: [
        {
          role: "system",
          content:
            "You are a professional crypto market analyst. Respond ONLY with valid JSON — no prose, no markdown, no code fences.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(
      "API error " + resp.status + ": " + (errText || resp.statusText),
    );
  }
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || "";
}

function parseAiResponse(raw, currentPrice) {
  const clean = raw.replace(/^```(?:json)?|```$/gim, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error("Failed to parse AI response as JSON.");
  }
  ["short", "mid", "long"].forEach((h) => {
    const pred = parsed.predictions?.[h];
    if (!pred) return;
    ["price_low", "price_target", "price_high"].forEach((k) => {
      const v = parseFloat(pred[k]);
      if (
        isNaN(v) ||
        v <= 0 ||
        v > currentPrice * 10 ||
        v < currentPrice * 0.01
      )
        pred[k] = currentPrice;
    });
  });
  return parsed;
}
