import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AmbientBg from "../../Components/AmbientBg";
import Ticker from "../../Components/Ticker";
import ThemeToggle from "../../Components/ThemeToggle";
import NotificationPanel from "../../Components/NotificationPanel";
import { fireToast } from "../../Components/ToastStack";
import { useCoinData } from "../../hooks/useCoinData";
import { useAlerts } from "../../hooks/useAlerts";
import {
  formatNumber,
  formatPrice,
  formatChange,
} from "../../utils/formatters";
import "../../styles/global.css";
import "./Dashboard.css";

const MINI_COINS = [
  { sym: "BTC", tvSym: "BINANCE:BTCUSDT" },
  { sym: "ETH", tvSym: "BINANCE:ETHUSDT" },
  { sym: "SOL", tvSym: "BINANCE:SOLUSDT" },
  { sym: "BNB", tvSym: "BINANCE:BNBUSDT" },
];

function sparklineSvg(prices, isUp) {
  if (!prices || prices.length < 2) return null;
  const min = Math.min(...prices),
    max = Math.max(...prices),
    rng = max - min || 1;
  const w = 64,
    h = 24;
  const pts = prices
    .map(
      (p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / rng) * h}`,
    )
    .join(" ");
  const color = isUp ? "#22c55e" : "#f87171";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { coins, loading, error, lastUpdated, refresh } = useCoinData(30000);
  const {
    alerts,
    notifs,
    createAlert,
    deleteAlert,
    deleteNotif,
    clearAll,
    markNotifsRead,
    checkAlerts,
    badgeCount,
  } = useAlerts();
  const [search, setSearch] = useState("");
  const [tooltip, setTooltip] = useState({
    visible: false,
    coin: null,
    x: 0,
    y: 0,
  });
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const miniChartsBuilt = useRef(false);
  const miniGridRef = useRef(null);

  // Check alerts when coins update
  useEffect(() => {
    if (coins.length > 0) {
      checkAlerts(coins, notifPanelOpen, (notif) => fireToast(notif));
    }
  }, [coins, checkAlerts, notifPanelOpen]);

  // Build mini charts (TradingView) - only once
  useEffect(() => {
    if (!miniGridRef.current || coins.length === 0 || miniChartsBuilt.current)
      return;
    miniChartsBuilt.current = true;
    const isDark =
      document.documentElement.getAttribute("data-theme") !== "light";
    const coinMap = {};
    coins.forEach((c) => {
      coinMap[c.symbol.toUpperCase()] = c;
    });
    miniGridRef.current.innerHTML = "";
    MINI_COINS.forEach(({ sym, tvSym }) => {
      const coin = coinMap[sym];
      const change = coin ? (coin.price_change_percentage_24h ?? 0) : 0;
      const { text: chText, cls: chCls } = formatChange(change);
      const card = document.createElement("div");
      card.className = "mini-chart-card";
      card.id = `miniCard_${sym}`;
      if (coin)
        card.onclick = () =>
          navigate(
            `/coin?symbol=${sym}&name=${encodeURIComponent(coin.name)}&image=${encodeURIComponent(coin.image)}&price=${coin.current_price}&change=${change}&mcap=${coin.market_cap}`,
          );
      card.innerHTML = `
        <div class="mini-chart-top">
          <div class="mini-chart-coin">
            ${coin ? `<img class="mini-chart-img" src="${coin.image}" alt="${sym}" loading="lazy"/>` : ""}
            <span class="mini-chart-sym">${sym}</span>
          </div>
          <span class="mini-chart-badge ${chCls}" id="miniBadge_${sym}">${chText}</span>
        </div>
        <div class="mini-chart-price" id="miniPrice_${sym}">${coin ? formatPrice(coin.current_price) : "—"}</div>
        <div class="mini-chart-widget-wrap" id="miniWidget_${sym}"></div>`;
      miniGridRef.current.appendChild(card);
      const s = document.createElement("script");
      s.type = "text/javascript";
      s.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
      s.async = true;
      s.innerHTML = JSON.stringify({
        symbol: tvSym,
        width: "100%",
        height: "100%",
        locale: "en",
        dateRange: "1W",
        colorTheme: isDark ? "dark" : "light",
        isTransparent: true,
        autosize: true,
        chartOnly: true,
      });
      card.querySelector(`#miniWidget_${sym}`).appendChild(s);
    });
  }, [coins, navigate]);

  // Update mini chart prices on subsequent fetches
  useEffect(() => {
    if (!miniChartsBuilt.current || coins.length === 0) return;
    const coinMap = {};
    coins.forEach((c) => {
      coinMap[c.symbol.toUpperCase()] = c;
    });
    MINI_COINS.forEach(({ sym }) => {
      const coin = coinMap[sym];
      if (!coin) return;
      const pEl = document.getElementById(`miniPrice_${sym}`);
      const bEl = document.getElementById(`miniBadge_${sym}`);
      if (pEl) pEl.textContent = formatPrice(coin.current_price);
      if (bEl) {
        const { text, cls } = formatChange(
          coin.price_change_percentage_24h ?? 0,
        );
        bEl.textContent = text;
        bEl.className = `mini-chart-badge ${cls}`;
      }
    });
  }, [coins]);

  const filteredCoins = search.trim()
    ? coins.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.symbol.toLowerCase().includes(search.toLowerCase()),
      )
    : coins;

  const gainers = [
    ...coins.filter((c) => c.price_change_percentage_24h != null),
  ]
    .sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
    )
    .slice(0, 5);
  const losers = [...coins.filter((c) => c.price_change_percentage_24h != null)]
    .sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h,
    )
    .slice(0, 5);

  const totalMcap = coins.reduce((s, c) => s + (c.market_cap || 0), 0);
  const gainerCount = coins.filter(
    (c) => (c.price_change_percentage_24h ?? 0) > 0,
  ).length;

  const handleRowHover = useCallback((e, coin) => {
    const { text, cls } = formatChange(coin.price_change_percentage_24h);
    setTooltip({
      visible: true,
      coin,
      x: e.clientX + 16,
      y: e.clientY + 16,
      text,
      cls,
    });
  }, []);

  const handleMouseMove = useCallback((e) => {
    setTooltip((prev) => {
      if (!prev.visible) return prev;
      let x = e.clientX + 16,
        y = e.clientY + 16;
      if (x + 230 > window.innerWidth - 12) x = e.clientX - 246;
      if (y + 200 > window.innerHeight - 12) y = e.clientY - 216;
      return { ...prev, x, y };
    });
  }, []);

  const openCoin = (coin) => {
    navigate(
      `/coin?symbol=${coin.symbol.toUpperCase()}&name=${encodeURIComponent(coin.name)}&image=${encodeURIComponent(coin.image)}&price=${coin.current_price}&change=${coin.price_change_percentage_24h ?? 0}&mcap=${coin.market_cap}`,
    );
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <AmbientBg variant="dashboard" />

      <Ticker coins={coins} />

      <header className="dash-header">
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
          <div className="search-wrap">
            <svg
              className="search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m21 21-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              id="search"
              placeholder="Search coin or symbol…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <NotificationPanel
            alerts={alerts}
            notifs={notifs}
            onCreateAlert={createAlert}
            onDeleteAlert={deleteAlert}
            onDeleteNotif={deleteNotif}
            onClearAll={clearAll}
            onMarkRead={markNotifsRead}
            coins={coins}
            badgeCount={badgeCount}
          />
          <button className="refresh-btn" onClick={refresh}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M23 4v6h-6M1 20v-6h6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refresh
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Stats */}
      <section className="stats">
        {[
          {
            label: "Tracking",
            value: coins.length || "—",
            sub: "live coins",
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ),
            cls: "",
            i: 0,
          },
          {
            label: "Gainers",
            value: gainerCount || "—",
            sub: "in top 100",
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <polyline
                  points="22 7 13.5 15.5 8.5 10.5 2 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polyline
                  points="16 7 22 7 22 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            cls: "green-stat",
            i: 1,
          },
          {
            label: "Losers",
            value: coins.length - gainerCount || "—",
            sub: "in top 100",
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <polyline
                  points="22 17 13.5 8.5 8.5 13.5 2 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polyline
                  points="16 17 22 17 22 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            cls: "red-stat",
            i: 2,
          },
          {
            label: "Total MCap",
            value: formatNumber(totalMcap),
            sub: "USD",
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <line
                  x1="12"
                  y1="1"
                  x2="12"
                  y2="23"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            cls: "",
            i: 3,
          },
          {
            label: "Auto-Refresh",
            value: "30s",
            sub: lastUpdated ? lastUpdated.toLocaleTimeString() : "—",
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <polyline
                  points="12 6 12 12 16 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ),
            cls: "",
            i: 4,
          },
        ].map((s) => (
          <div key={s.i} className="stat-card" style={{ "--i": s.i }}>
            <div
              className={`stat-accent-bar${s.i === 1 ? " green-bar" : s.i === 2 ? " red-bar" : ""}`}
            ></div>
            <div
              className={`stat-icon${s.i === 1 ? " green-icon" : s.i === 2 ? " red-icon" : ""}`}
            >
              {s.icon}
            </div>
            <div className="stat-body">
              <div className="stat-label">{s.label}</div>
              <div
                className={`stat-value${s.i === 1 ? " positive-text" : s.i === 2 ? " negative-text" : ""}`}
              >
                {s.value}
              </div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Market Overview */}
      <section className="market-overview-section">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-eyebrow">Real-Time Visualization</span>
            <h2 className="section-title">Market Overview</h2>
          </div>
          <p className="section-desc">
            Heatmap · Top Coins · Gainers/Losers · News
          </p>
        </div>

        {/* Row 1: Heatmap + Mini Charts */}
        <div className="overview-row-1">
          <div className="overview-heatmap ov-card">
            <div className="ov-card-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="14"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              Market Heatmap
            </div>
            <div className="tradingview-widget-container heatmap-widget-wrap">
              <TradingViewHeatmap />
            </div>
          </div>
          <div className="mini-charts-col">
            <div className="ov-card-label" style={{ marginBottom: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <polyline
                  points="22 12 18 12 15 21 9 3 6 12 2 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Top Coins — 7 Day
            </div>
            <div className="mini-charts-grid" ref={miniGridRef}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="mini-chart-skeleton"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="overview-row-2">
          <MoverCard
            title="Top Gainers"
            items={gainers}
            type="gainer"
            onClickCoin={openCoin}
          />
          <MoverCard
            title="Top Losers"
            items={losers}
            type="loser"
            onClickCoin={openCoin}
          />
          <div className="ov-card news-card">
            <div className="ov-card-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Latest Crypto News
            </div>
            <div className="news-widget-wrap">
              <TradingViewNews />
            </div>
          </div>
        </div>
      </section>

      {/* Coin Table */}
      <section className="table-section" onMouseMove={handleMouseMove}>
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-eyebrow">Live Market Data</span>
            <h2 className="section-title">All Coins</h2>
          </div>
          <p className="section-desc">
            Hover for quick stats · Click for full analysis
          </p>
        </div>
        <div className="table-container">
          <table id="cryptoTable">
            <thead>
              <tr>
                <th className="th-rank">#</th>
                <th>Coin</th>
                <th>Price</th>
                <th>24h %</th>
                <th className="th-hide-sm">Market Cap</th>
                <th className="th-hide-sm">Volume (24h)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan="7">
                    <div className="loading-inner">
                      <div className="loading-spinner"></div>
                      <span>Fetching live market data…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredCoins.length === 0 && (
                <tr className="loading-row">
                  <td colSpan="7">
                    <div className="loading-inner">
                      No coins match "{search}"
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                filteredCoins.map((coin, i) => {
                  const { text: chText, cls: chCls } = formatChange(
                    coin.price_change_percentage_24h,
                  );
                  return (
                    <tr
                      key={coin.id}
                      style={{
                        animation: `fadeUp 0.3s ease ${Math.min(i * 0.008, 0.5).toFixed(3)}s both`,
                      }}
                      onClick={() => openCoin(coin)}
                      onMouseEnter={(e) => handleRowHover(e, coin)}
                      onMouseLeave={() =>
                        setTooltip((p) => ({ ...p, visible: false }))
                      }
                    >
                      <td className="rank-cell">
                        {coin.market_cap_rank || "—"}
                      </td>
                      <td>
                        <div className="coin-info">
                          <img
                            className="coin-img-thumb"
                            src={coin.image}
                            alt={coin.name}
                            loading="lazy"
                          />
                          <div className="coin-name-cell">
                            <span className="coin-name-main">{coin.name}</span>
                            <span className="coin-sym-small">
                              {coin.symbol.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="price-cell">
                        {formatPrice(coin.current_price)}
                      </td>
                      <td>
                        <span className={`change-badge ${chCls}`}>
                          {chText}
                        </span>
                      </td>
                      <td className="num-cell th-hide-sm">
                        {formatNumber(coin.market_cap)}
                      </td>
                      <td className="num-cell th-hide-sm">
                        {formatNumber(coin.total_volume)}
                      </td>
                      <td className="arrow-cell">→</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tooltip */}
      {tooltip.visible && tooltip.coin && (
        <div
          className="price-tooltip visible"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="tooltip-header">
            <img
              className="tooltip-img"
              src={tooltip.coin.image}
              alt={tooltip.coin.name}
            />
            <div className="tooltip-identity">
              <div className="tooltip-name">{tooltip.coin.name}</div>
              <div className="tooltip-sym">
                {tooltip.coin.symbol.toUpperCase()} / USDT
              </div>
            </div>
            <div className={`tooltip-change-badge ${tooltip.cls}`}>
              {tooltip.text}
            </div>
          </div>
          <div className="tooltip-price">
            {formatPrice(tooltip.coin.current_price)}
          </div>
          <div className="tooltip-divider"></div>
          <div className="tooltip-stats">
            <div className="tooltip-stat">
              <span className="tooltip-stat-label">Market Cap</span>
              <span className="tooltip-stat-val">
                {formatNumber(tooltip.coin.market_cap)}
              </span>
            </div>
            <div className="tooltip-stat">
              <span className="tooltip-stat-label">Volume 24h</span>
              <span className="tooltip-stat-val">
                {formatNumber(tooltip.coin.total_volume)}
              </span>
            </div>
            <div className="tooltip-stat">
              <span className="tooltip-stat-label">Rank</span>
              <span className="tooltip-stat-val">
                #{tooltip.coin.market_cap_rank || "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">CryptoNex</span>
            <span className="footer-sep">·</span>
            <span>Data by CoinGecko API &amp; TradingView</span>
          </div>
          <div className="footer-right">
            <span className="footer-disclaimer">Not financial advice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MoverCard({ title, items, type, onClickCoin }) {
  const isGainer = type === "gainer";
  return (
    <div className={`ov-card ${isGainer ? "gainers-card" : "losers-card"}`}>
      <div
        className={`ov-card-label ${isGainer ? "green-label" : "red-label"}`}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          {isGainer ? (
            <>
              <polyline
                points="22 7 13.5 15.5 8.5 10.5 2 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="16 7 22 7 22 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <polyline
                points="22 17 13.5 8.5 8.5 13.5 2 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polyline
                points="16 17 22 17 22 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
        {title}{" "}
        <span
          className={`label-badge ${isGainer ? "label-badge-green" : "label-badge-red"}`}
        >
          24h
        </span>
      </div>
      <div className="movers-list">
        {items.length === 0
          ? [0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="mover-skeleton"></div>
            ))
          : items.map((coin) => {
              const pct = coin.price_change_percentage_24h;
              return (
                <div
                  key={coin.id}
                  className="mover-row"
                  onClick={() => onClickCoin(coin)}
                >
                  <img
                    className="mover-img"
                    src={coin.image}
                    alt={coin.name}
                    loading="lazy"
                  />
                  <div className="mover-info">
                    <div className="mover-name">{coin.name}</div>
                    <div className="mover-sym">{coin.symbol.toUpperCase()}</div>
                  </div>
                  <div className="mover-right">
                    <div className="mover-price">
                      {formatPrice(coin.current_price)}
                    </div>
                    <div
                      className={`mover-change ${isGainer ? "positive-text" : "negative-text"}`}
                    >
                      {isGainer ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

function TradingViewHeatmap() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // 🧹 Prevent duplicate script injection
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";
    script.async = true;

    script.innerHTML = JSON.stringify({
      dataSource: "Crypto",
      blockSize: "market_cap_calc",
      blockColor: "24h_close_change|5",
      locale: "en",
      colorTheme: "dark",
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: 460,
    });

    ref.current.appendChild(script);

    // 🧼 Cleanup (important for Strict Mode)
    return () => {
      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={ref} style={{ height: "100%" }} />;
}
function TradingViewNews() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      displayMode: "regular",
      feedMode: "all_symbols",
      colorTheme: "dark",
      isTransparent: true,
      locale: "en",
      width: "100%",
      height: "100%",
    });
    ref.current.appendChild(s);
  }, []);
  return <div ref={ref} style={{ height: "100%" }}></div>;
}
