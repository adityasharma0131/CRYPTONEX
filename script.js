/* =========================================================
   CryptoNex — script.js  (final clean version)
   ========================================================= */

// ── API Endpoints ──────────────────────────────────────────────────────────
const CG_BASE =
  "https://api.coingecko.com/api/v3/coins/markets" +
  "?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false";
const PROXY_BASE = "https://corsproxy.io/?" + encodeURIComponent(CG_BASE);

// ── State ──────────────────────────────────────────────────────────────────
let allCoins = []; // master — NEVER filtered
let searchQuery = ""; // current live search string
let tooltipTimer = null;

// ── Theme ──────────────────────────────────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem("cnx-theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
})();

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("cnx-theme", next);
}

// ── Formatters ─────────────────────────────────────────────────────────────
function formatNumber(num) {
  if (num == null || num === "") return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  return "$" + num.toLocaleString();
}

function formatPrice(price) {
  if (price == null || price === "") return "—";
  if (price < 0.0001) return "$" + price.toFixed(8);
  if (price < 0.01) return "$" + price.toFixed(6);
  if (price < 1) return "$" + price.toFixed(4);
  return (
    "$" +
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatChange(change) {
  if (change == null) return { text: "—", cls: "" };
  const pos = change >= 0;
  return {
    text: (pos ? "▲ " : "▼ ") + Math.abs(change).toFixed(2) + "%",
    cls: pos ? "positive" : "negative",
  };
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Fetch Coins ────────────────────────────────────────────────────────────
async function fetchCoins() {
  const btn = document.querySelector(".refresh-btn");
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = "0.65";
  }

  try {
    let data;
    try {
      const r = await fetch(CG_BASE, { cache: "no-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      data = await r.json();
    } catch (e) {
      console.warn("Direct fetch blocked — using proxy:", e.message);
      const r = await fetch(PROXY_BASE, { cache: "no-cache" });
      if (!r.ok) throw new Error("Proxy HTTP " + r.status);
      data = await r.json();
    }

    allCoins = data; // update master — never overwrite this elsewhere
    applySearch(); // re-render table honouring current search query
    updateStats(allCoins);
    buildTicker(allCoins);
    renderMiniCharts(allCoins);
    renderMovers(allCoins);
    populateAlertCoinSelect(allCoins);
    checkAlerts(allCoins);

    const el = document.getElementById("lastUpdated");
    if (el) el.innerText = new Date().toLocaleTimeString();
  } catch (err) {
    console.error("fetchCoins:", err);
    const tbody = document.getElementById("cryptoBody");
    if (tbody)
      tbody.innerHTML = `
      <tr class="loading-row">
        <td colspan="7">
          <div class="loading-inner" style="color:var(--red)">
            ⚠ Failed to load data — check your connection
          </div>
        </td>
      </tr>`;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  }
}

// ── Search ─────────────────────────────────────────────────────────────────
// KEY FIX: applySearch() always reads from allCoins (the master),
// so typing / clearing always works correctly.
function applySearch() {
  const q = searchQuery.trim().toLowerCase();
  if (!q) {
    renderCoins(allCoins);
    return;
  }
  const filtered = allCoins.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
  );
  renderCoins(filtered);
}

(function initSearch() {
  const input = document.getElementById("search");
  if (!input) return;

  input.addEventListener("input", function () {
    searchQuery = this.value;
    applySearch();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      searchQuery = "";
      applySearch();
      input.blur();
    }
  });
})();

// ── Stats Bar ──────────────────────────────────────────────────────────────
function updateStats(data) {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.innerText = v;
  };
  const gainers = data.filter(
    (c) => (c.price_change_percentage_24h ?? 0) > 0,
  ).length;
  const totalMcap = data.reduce((s, c) => s + (c.market_cap || 0), 0);
  set("coinCount", data.length);
  set("gainerCount", gainers);
  set("loserCount", data.length - gainers);
  set("totalMcap", formatNumber(totalMcap));
}

// ── Ticker Tape ───────────────────────────────────────────────────────────
function buildTicker(data) {
  const inner = document.getElementById("tickerInner");
  if (!inner) return;
  const top = data.slice(0, 30);
  const html = top
    .map((c) => {
      const ch = c.price_change_percentage_24h ?? 0;
      const cls = ch >= 0 ? "ticker-change-pos" : "ticker-change-neg";
      const label = (ch >= 0 ? "+" : "") + ch.toFixed(2) + "%";
      return `<span class="ticker-item">
      <span class="ticker-sym">${c.symbol.toUpperCase()}</span>
      <span class="ticker-price">${formatPrice(c.current_price)}</span>
      <span class="${cls}">${label}</span>
    </span>`;
    })
    .join("");
  inner.innerHTML = html + html;
  inner.style.animationDuration = Math.round((top.length * 200) / 80) + "s";
}

// ── Render Coins Table ─────────────────────────────────────────────────────
function renderCoins(data) {
  const tbody = document.getElementById("cryptoBody");
  if (!tbody) return;

  if (!data || !data.length) {
    const msg = searchQuery.trim()
      ? `No coins match "<strong>${escHtml(searchQuery.trim())}</strong>"`
      : "No data available.";
    tbody.innerHTML = `
      <tr class="loading-row">
        <td colspan="7"><div class="loading-inner">${msg}</div></td>
      </tr>`;
    return;
  }

  const frag = document.createDocumentFragment();
  data.forEach((coin, i) => {
    const { text: chText, cls: chCls } = formatChange(
      coin.price_change_percentage_24h,
    );
    const tr = document.createElement("tr");
    // only animate on fresh full load, not on every search keystroke
    if (!searchQuery) {
      tr.style.cssText = `animation:fadeUp 0.3s ease ${Math.min(i * 0.008, 0.5).toFixed(3)}s both`;
    }
    tr.innerHTML = `
      <td class="rank-cell">${coin.market_cap_rank || "—"}</td>
      <td>
        <div class="coin-info">
          <img class="coin-img-thumb" src="${coin.image}" alt="${escHtml(coin.name)}" loading="lazy"/>
          <div class="coin-name-cell">
            <span class="coin-name-main">${escHtml(coin.name)}</span>
            <span class="coin-sym-small">${coin.symbol.toUpperCase()}</span>
          </div>
        </div>
      </td>
      <td class="price-cell">${formatPrice(coin.current_price)}</td>
      <td><span class="change-badge ${chCls}">${chText}</span></td>
      <td class="num-cell th-hide-sm">${formatNumber(coin.market_cap)}</td>
      <td class="num-cell th-hide-sm">${formatNumber(coin.total_volume)}</td>
      <td class="arrow-cell">→</td>`;

    tr.addEventListener("click", () =>
      openCoin(coin.symbol.toUpperCase(), coin.name, coin.image),
    );
    tr.addEventListener("mouseenter", (e) => showTooltip(e, coin));
    tr.addEventListener("mousemove", (e) => moveTooltip(e));
    tr.addEventListener("mouseleave", () => hideTooltip());
    frag.appendChild(tr);
  });

  tbody.innerHTML = "";
  tbody.appendChild(frag);
}

// ── Tooltip ────────────────────────────────────────────────────────────────
const tooltip = document.getElementById("priceTooltip");

function showTooltip(e, coin) {
  clearTimeout(tooltipTimer);
  const { text, cls } = formatChange(coin.price_change_percentage_24h);
  document.getElementById("tooltipImg").src = coin.image;
  document.getElementById("tooltipName").innerText = coin.name;
  document.getElementById("tooltipSym").innerText =
    coin.symbol.toUpperCase() + " / USDT";
  document.getElementById("tooltipPrice").innerText = formatPrice(
    coin.current_price,
  );
  document.getElementById("tooltipMcap").innerText = formatNumber(
    coin.market_cap,
  );
  document.getElementById("tooltipVol").innerText = formatNumber(
    coin.total_volume,
  );
  document.getElementById("tooltipRank").innerText =
    "#" + (coin.market_cap_rank || "—");
  const badge = document.getElementById("tooltipChangeBadge");
  badge.innerText = text;
  badge.className = "tooltip-change-badge " + cls;
  moveTooltip(e);
  tooltip.classList.add("visible");
}

function moveTooltip(e) {
  if (!tooltip || !tooltip.classList.contains("visible")) return;
  const tw = tooltip.offsetWidth || 230,
    th = tooltip.offsetHeight || 200;
  let x = e.clientX + 16,
    y = e.clientY + 16;
  if (x + tw > window.innerWidth - 12) x = e.clientX - tw - 16;
  if (y + th > window.innerHeight - 12) y = e.clientY - th - 16;
  tooltip.style.left = x + "px";
  tooltip.style.top = y + "px";
}

function hideTooltip() {
  tooltipTimer = setTimeout(
    () => tooltip && tooltip.classList.remove("visible"),
    120,
  );
}

// ── Navigation ─────────────────────────────────────────────────────────────
function openCoin(symbol, name, image) {
  window.location.href =
    `coin.html?symbol=${encodeURIComponent(symbol)}` +
    `&name=${encodeURIComponent(name)}` +
    `&image=${encodeURIComponent(image)}`;
}

// ── Mini Charts ────────────────────────────────────────────────────────────
const MINI_COINS = [
  { sym: "BTC", tvSym: "BINANCE:BTCUSDT" },
  { sym: "ETH", tvSym: "BINANCE:ETHUSDT" },
  { sym: "SOL", tvSym: "BINANCE:SOLUSDT" },
  { sym: "BNB", tvSym: "BINANCE:BNBUSDT" },
];
let miniChartsBuilt = false;

function renderMiniCharts(data) {
  const grid = document.getElementById("miniChartsGrid");
  if (!grid) return;

  const map = {};
  data.forEach((c) => {
    map[c.symbol.toUpperCase()] = c;
  });

  if (!miniChartsBuilt) {
    miniChartsBuilt = true;
    grid.innerHTML = "";
    const isDark =
      document.documentElement.getAttribute("data-theme") !== "light";

    MINI_COINS.forEach(({ sym, tvSym }) => {
      const coin = map[sym];
      const change = coin ? (coin.price_change_percentage_24h ?? 0) : 0;
      const { text: chText, cls: chCls } = formatChange(change);

      const card = document.createElement("div");
      card.className = "mini-chart-card";
      card.id = `miniCard_${sym}`;
      if (coin) card.onclick = () => openCoin(sym, coin.name, coin.image);

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

      grid.appendChild(card);

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
        largeChartUrl: "",
        noTimeScale: true,
        chartOnly: true,
      });
      card.querySelector(`#miniWidget_${sym}`).appendChild(s);
    });
  } else {
    // on subsequent fetches: just update price + badge (don't re-inject scripts)
    MINI_COINS.forEach(({ sym }) => {
      const coin = map[sym];
      if (!coin) return;
      const pEl = document.getElementById(`miniPrice_${sym}`);
      const bEl = document.getElementById(`miniBadge_${sym}`);
      if (pEl) pEl.innerText = formatPrice(coin.current_price);
      if (bEl) {
        const { text, cls } = formatChange(
          coin.price_change_percentage_24h ?? 0,
        );
        bEl.innerText = text;
        bEl.className = `mini-chart-badge ${cls}`;
      }
    });
  }
}

// ── Gainers & Losers ──────────────────────────────────────────────────────
function renderMovers(data) {
  const valid = data.filter((c) => c.price_change_percentage_24h != null);
  const gainers = [...valid]
    .sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
    )
    .slice(0, 5);
  const losers = [...valid]
    .sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h,
    )
    .slice(0, 5);
  renderMoverList("gainersList", gainers, true);
  renderMoverList("losersList", losers, false);
}

function renderMoverList(id, data, isGainer) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = "";
  data.forEach((coin) => {
    const pct = coin.price_change_percentage_24h;
    const row = document.createElement("div");
    row.className = "mover-row";
    row.onclick = () =>
      openCoin(coin.symbol.toUpperCase(), coin.name, coin.image);
    row.innerHTML = `
      <img class="mover-img" src="${coin.image}" alt="${escHtml(coin.name)}" loading="lazy"/>
      <div class="mover-info">
        <div class="mover-name">${escHtml(coin.name)}</div>
        <div class="mover-sym">${coin.symbol.toUpperCase()}</div>
      </div>
      <div class="mover-right">
        <div class="mover-price">${formatPrice(coin.current_price)}</div>
        <div class="mover-change ${isGainer ? "positive-text" : "negative-text"}">
          ${isGainer ? "▲" : "▼"} ${Math.abs(pct).toFixed(2)}%
        </div>
      </div>`;
    el.appendChild(row);
  });
}

/* ═══════════════════════════════════════════════════════════
   PRICE ALERT & NOTIFICATION SYSTEM
   ═══════════════════════════════════════════════════════════ */

let priceAlerts = [];
let priceNotifs = [];
let alertCondition = "above";
let notifPanelOpen = false;

function saveAlerts() {
  try {
    localStorage.setItem("cnx-alerts", JSON.stringify(priceAlerts));
  } catch (e) {}
}
function saveNotifs() {
  try {
    localStorage.setItem("cnx-notifs", JSON.stringify(priceNotifs));
  } catch (e) {}
}

function loadStoredData() {
  try {
    const a = localStorage.getItem("cnx-alerts");
    if (a) priceAlerts = JSON.parse(a);
    const n = localStorage.getItem("cnx-notifs");
    if (n) priceNotifs = JSON.parse(n);
  } catch (e) {}
  renderAlertsList();
  renderNotifHistory();
  updateBadge();
}

// ── Panel ─────────────────────────────────────────────────────────────────
function toggleNotifPanel() {
  notifPanelOpen = !notifPanelOpen;
  const panel = document.getElementById("notifPanel");
  const btn = document.getElementById("notifBtn");
  if (!panel) return;
  if (notifPanelOpen) {
    panel.classList.add("open");
    if (btn) btn.classList.add("active-panel");
    priceNotifs.forEach((n) => {
      n.unread = false;
    });
    saveNotifs();
    updateBadge();
  } else {
    panel.classList.remove("open");
    if (btn) btn.classList.remove("active-panel");
  }
}

document.addEventListener("click", (e) => {
  const wrap = document.getElementById("notifWrap");
  if (wrap && !wrap.contains(e.target) && notifPanelOpen) {
    notifPanelOpen = false;
    const p = document.getElementById("notifPanel");
    const b = document.getElementById("notifBtn");
    if (p) p.classList.remove("open");
    if (b) b.classList.remove("active-panel");
  }
});

function setCondition(cond, btn) {
  alertCondition = cond;
  document
    .querySelectorAll(".cond-tab")
    .forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
}

// ── Populate coin dropdown ─────────────────────────────────────────────────
function populateAlertCoinSelect(data) {
  const sel = document.getElementById("alertCoinSelect");
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = `<option value="">Select coin…</option>`;
  data.slice(0, 50).forEach((c) => {
    const o = document.createElement("option");
    o.value = c.id;
    o.dataset.sym = c.symbol.toUpperCase();
    o.dataset.name = c.name;
    o.dataset.image = c.image;
    o.dataset.price = c.current_price;
    o.textContent = `${c.name} (${c.symbol.toUpperCase()})`;
    sel.appendChild(o);
  });
  if (prev) sel.value = prev;
  if (sel.value) refreshCoinPriceDisplay(sel);
}

document.addEventListener("change", (e) => {
  if (e.target.id === "alertCoinSelect") refreshCoinPriceDisplay(e.target);
});

function refreshCoinPriceDisplay(sel) {
  const row = document.getElementById("alertCurrentPriceRow");
  const priceEl = document.getElementById("alertCurrentPrice");
  const input = document.getElementById("alertPriceInput");
  if (sel.value && sel.selectedOptions[0]) {
    const price = parseFloat(sel.selectedOptions[0].dataset.price);
    if (row) row.style.display = "flex";
    if (priceEl) priceEl.textContent = formatPrice(price);
    if (input && !input.value) input.value = price;
  } else {
    if (row) row.style.display = "none";
  }
}

// ── Create Alert ───────────────────────────────────────────────────────────
function createAlert() {
  const sel = document.getElementById("alertCoinSelect");
  const input = document.getElementById("alertPriceInput");
  if (!sel || !input) return;
  if (!sel.value) {
    shakeEl(sel);
    return;
  }
  const target = parseFloat(input.value);
  if (!target || target <= 0) {
    shakeEl(input.closest(".notif-price-wrap"));
    return;
  }
  const opt = sel.selectedOptions[0];
  const current = parseFloat(opt.dataset.price);
  if (alertCondition === "above" && target <= current) {
    formError(`Target must be above ${formatPrice(current)}`);
    return;
  }
  if (alertCondition === "below" && target >= current) {
    formError(`Target must be below ${formatPrice(current)}`);
    return;
  }

  priceAlerts.push({
    id: Date.now(),
    coinId: sel.value,
    symbol: opt.dataset.sym,
    name: opt.dataset.name,
    image: opt.dataset.image,
    condition: alertCondition,
    targetPrice: target,
    currentPrice: current,
    triggered: false,
    createdAt: new Date().toISOString(),
  });
  saveAlerts();
  renderAlertsList();
  updateBadge();

  input.value = "";
  sel.value = "";
  const row = document.getElementById("alertCurrentPriceRow");
  if (row) row.style.display = "none";

  const btn = document.querySelector(".notif-create-btn");
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = "✓ Alert Created!";
    btn.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = "";
    }, 2000);
  }
}

function formError(msg) {
  let el = document.getElementById("alertFormErr");
  if (!el) {
    el = document.createElement("div");
    el.id = "alertFormErr";
    el.style.cssText =
      "font-size:11px;color:var(--red);margin:-2px 0 6px;font-family:var(--font-mono);";
    const btn = document.querySelector(".notif-create-btn");
    if (btn) btn.insertAdjacentElement("beforebegin", el);
  }
  el.textContent = "⚠ " + msg;
  setTimeout(() => {
    if (el) el.textContent = "";
  }, 3500);
}

function shakeEl(el) {
  if (!el) return;
  el.style.animation = "none";
  void el.offsetHeight;
  el.style.animation = "cnxShake 0.4s ease";
  setTimeout(() => {
    el.style.animation = "";
  }, 500);
}

// ── Render Alerts ─────────────────────────────────────────────────────────
function renderAlertsList() {
  const list = document.getElementById("notifList");
  const empty = document.getElementById("notifEmpty");
  const cBtn = document.getElementById("clearAllBtn");
  if (!list) return;
  if (cBtn) cBtn.style.display = priceAlerts.length ? "block" : "none";
  list.querySelectorAll(".alert-item").forEach((el) => el.remove());
  if (!priceAlerts.length) {
    if (empty) empty.style.display = "flex";
    return;
  }
  if (empty) empty.style.display = "none";

  [...priceAlerts].reverse().forEach((a) => {
    const div = document.createElement("div");
    div.className = "alert-item" + (a.triggered ? " triggered" : "");
    div.innerHTML = `
      <img class="alert-coin-img" src="${a.image}" alt="${escHtml(a.name)}" loading="lazy"/>
      <div class="alert-info">
        <div class="alert-coin-name">${escHtml(a.name)}</div>
        <div class="alert-condition">
          <span class="alert-cond-pill ${a.condition === "above" ? "cond-above" : "cond-below"}">${a.condition === "above" ? "▲ ABOVE" : "▼ BELOW"}</span>
          <span class="alert-target-price">${formatPrice(a.targetPrice)}</span>
          ${a.triggered ? `<span class="alert-hit-tag">✓ HIT</span>` : ""}
        </div>
      </div>
      <div class="alert-status-dot ${a.triggered ? "status-triggered" : "status-active"}" title="${a.triggered ? "Triggered" : "Active"}"></div>
      <button class="alert-delete-btn" title="Remove">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
      </button>`;
    div.querySelector(".alert-delete-btn").addEventListener("click", (ev) => {
      ev.stopPropagation();
      deleteAlert(a.id);
    });
    list.appendChild(div);
  });
}

function deleteAlert(id) {
  priceAlerts = priceAlerts.filter((a) => a.id !== id);
  saveAlerts();
  renderAlertsList();
  updateBadge();
}

function clearAllAlerts() {
  if (!confirm("Remove all price alerts and notification history?")) return;
  priceAlerts = [];
  priceNotifs = [];
  saveAlerts();
  saveNotifs();
  renderAlertsList();
  renderNotifHistory();
  updateBadge();
}

// ── Notification History ───────────────────────────────────────────────────
function renderNotifHistory() {
  const wrap = document.getElementById("notifHistoryWrap");
  const list = document.getElementById("notifHistoryList");
  const countEl = document.getElementById("notifHistoryCount");
  if (!wrap || !list) return;
  if (!priceNotifs.length) {
    wrap.style.display = "none";
    return;
  }
  wrap.style.display = "block";
  if (countEl) countEl.textContent = priceNotifs.length;
  list.innerHTML = "";
  [...priceNotifs].reverse().forEach((n) => {
    const div = document.createElement("div");
    div.className = "notif-history-item" + (n.unread ? " unread" : "");
    div.innerHTML = `
      <div class="notif-hist-icon"><img src="${n.image}" style="width:18px;height:18px;border-radius:50%;"/></div>
      <div class="notif-hist-content">
        <div class="notif-hist-title">${escHtml(n.name)} ${n.condition === "above" ? "rose above" : "fell below"} ${formatPrice(n.targetPrice)}</div>
        <div class="notif-hist-meta">
          <span style="color:var(--accent)">${formatPrice(n.hitPrice)}</span>
          <span>·</span>
          <span>${timeAgo(new Date(n.triggeredAt))}</span>
        </div>
      </div>
      <button class="notif-hist-delete" title="Dismiss">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>`;
    div
      .querySelector(".notif-hist-delete")
      .addEventListener("click", () => deleteNotif(n.id));
    list.appendChild(div);
  });
}

function deleteNotif(id) {
  priceNotifs = priceNotifs.filter((n) => n.id !== id);
  saveNotifs();
  renderNotifHistory();
  updateBadge();
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

// ── Badge ─────────────────────────────────────────────────────────────────
function updateBadge() {
  const badge = document.getElementById("notifBadge");
  const btn = document.getElementById("notifBtn");
  const active = priceAlerts.filter((a) => !a.triggered).length;
  const unread = priceNotifs.filter((n) => n.unread).length;
  const total = active + unread;
  if (!badge) return;
  if (total > 0) {
    badge.style.display = "flex";
    badge.textContent = total > 9 ? "9+" : String(total);
    if (btn) btn.classList.add("has-alerts");
  } else {
    badge.style.display = "none";
    if (btn) btn.classList.remove("has-alerts");
  }
}

// ── Check Alert Triggers ───────────────────────────────────────────────────
function checkAlerts(data) {
  if (!priceAlerts.length) return;
  const priceMap = {};
  data.forEach((c) => {
    priceMap[c.id] = c.current_price;
  });

  let changed = false;
  priceAlerts.forEach((a) => {
    if (a.triggered) return;
    const price = priceMap[a.coinId];
    if (price == null) return;
    const hit =
      (a.condition === "above" && price >= a.targetPrice) ||
      (a.condition === "below" && price <= a.targetPrice);
    if (!hit) return;

    a.triggered = true;
    changed = true;
    const notif = {
      id: Date.now() + Math.random(),
      coinId: a.coinId,
      symbol: a.symbol,
      name: a.name,
      image: a.image,
      condition: a.condition,
      targetPrice: a.targetPrice,
      hitPrice: price,
      triggeredAt: new Date().toISOString(),
      unread: !notifPanelOpen,
    };
    priceNotifs.push(notif);
    fireToast(notif);
  });

  if (changed) {
    saveAlerts();
    saveNotifs();
    renderAlertsList();
    renderNotifHistory();
    updateBadge();
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────
function fireToast(notif) {
  const stack = document.getElementById("toastStack");
  if (!stack) return;
  const isUp = notif.condition === "above";
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <div class="toast-progress-bar"></div>
    <div class="toast-body">
      <div class="toast-icon-wrap">
        <img class="toast-coin-img" src="${notif.image}" alt="${escHtml(notif.name)}"/>
      </div>
      <div class="toast-content">
        <div class="toast-tag">${isUp ? "🚀" : "📉"} Price Alert Triggered</div>
        <div class="toast-title"><strong>${escHtml(notif.name)}</strong> ${isUp ? "surpassed" : "dropped below"} your target</div>
        <div class="toast-meta">
          <span class="toast-price-pill">${formatPrice(notif.hitPrice)}</span>
          <span class="toast-target-pill">target: ${formatPrice(notif.targetPrice)}</span>
        </div>
        <div class="toast-actions">
          <button class="toast-action-btn toast-action-primary toast-view-btn">View Chart →</button>
          <button class="toast-action-btn toast-action-secondary toast-dismiss-btn">Dismiss</button>
        </div>
      </div>
      <button class="toast-close toast-x-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6"  x2="6"  y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="6"  y1="6"  x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>`;

  stack.appendChild(toast);
  toast.querySelector(".toast-view-btn").addEventListener("click", () => {
    dismissToast(toast);
    openCoin(notif.symbol, notif.name, notif.image);
  });
  toast
    .querySelector(".toast-dismiss-btn")
    .addEventListener("click", () => dismissToast(toast));
  toast
    .querySelector(".toast-x-btn")
    .addEventListener("click", () => dismissToast(toast));
  toast._timer = setTimeout(() => dismissToast(toast), 10000);
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains("toast-exit")) return;
  clearTimeout(toast._timer);
  toast.classList.add("toast-exit");
  setTimeout(() => toast.remove(), 380);
}

// ── Inject keyframes once ─────────────────────────────────────────────────
const _extraStyles = document.createElement("style");
_extraStyles.textContent = `
@keyframes cnxShake {
  0%,100%{ transform:translateX(0)  }
  20%    { transform:translateX(-6px) }
  40%    { transform:translateX(6px)  }
  60%    { transform:translateX(-4px) }
  80%    { transform:translateX(4px)  }
}
.alert-hit-tag {
  font-size:9px; color:var(--green);
  font-family:var(--font-mono); font-weight:700;
}`;
document.head.appendChild(_extraStyles);

// ── Boot ───────────────────────────────────────────────────────────────────
loadStoredData();
fetchCoins();
setInterval(fetchCoins, 30000);
