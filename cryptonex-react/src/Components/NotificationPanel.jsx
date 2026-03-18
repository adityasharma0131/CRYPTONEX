import { useState, useRef, useEffect } from "react";
import { formatPrice, timeAgo } from "../utils/formatters";
import "./NotificationPanel.css";

export default function NotificationPanel({
  alerts,
  notifs,
  onCreateAlert,
  onDeleteAlert,
  onDeleteNotif,
  onClearAll,
  coins,
  badgeCount,
  onMarkRead,
}) {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState("above");
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [formError, setFormError] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && open) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  const togglePanel = () => {
    const next = !open;
    setOpen(next);
    if (next) onMarkRead?.();
  };

  const selectedCoin = coins?.find((c) => c.id === selectedCoinId);
  const currentPrice = selectedCoin?.current_price || 0;

  const handleCreate = () => {
    if (!selectedCoinId) {
      setFormError("Select a coin");
      return;
    }
    const target = parseFloat(targetPrice);
    if (!target || target <= 0) {
      setFormError("Enter a valid price");
      return;
    }
    if (condition === "above" && target <= currentPrice) {
      setFormError(`Target must be above ${formatPrice(currentPrice)}`);
      return;
    }
    if (condition === "below" && target >= currentPrice) {
      setFormError(`Target must be below ${formatPrice(currentPrice)}`);
      return;
    }
    setFormError("");
    onCreateAlert({
      coinId: selectedCoinId,
      symbol: selectedCoin.symbol.toUpperCase(),
      name: selectedCoin.name,
      image: selectedCoin.image,
      condition,
      targetPrice: target,
      currentPrice,
    });
    setTargetPrice("");
    setSelectedCoinId("");
  };

  const activeAlerts = alerts.filter((a) => !a.triggered);

  return (
    <div className="notif-wrap" ref={panelRef}>
      <button
        className={`notif-btn${badgeCount > 0 ? " has-alerts" : ""}${open ? " active-panel" : ""}`}
        onClick={togglePanel}
        title="Price Alerts"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.73 21a2 2 0 0 1-3.46 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {badgeCount > 0 && (
          <span className="notif-badge">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      <div className={`notif-panel${open ? " open" : ""}`}>
        <div className="notif-panel-header">
          <div className="notif-panel-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Price Alerts
          </div>
          {(alerts.length > 0 || notifs.length > 0) && (
            <button className="notif-clear-all" onClick={onClearAll}>
              Clear All
            </button>
          )}
        </div>

        {/* Create Form */}
        <div className="notif-create-form">
          <div className="notif-form-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Create Price Alert
          </div>
          <div className="notif-form-row">
            <select
              className="notif-select"
              value={selectedCoinId}
              onChange={(e) => {
                setSelectedCoinId(e.target.value);
                setTargetPrice("");
              }}
            >
              <option value="">Select coin…</option>
              {(coins || []).slice(0, 50).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          {selectedCoin && (
            <div className="notif-form-row">
              <span className="alert-current-label">Current:</span>
              <span className="alert-current-price">
                {formatPrice(currentPrice)}
              </span>
            </div>
          )}
          <div className="notif-form-row">
            <div className="notif-condition-tabs">
              {["above", "below"].map((c) => (
                <button
                  key={c}
                  className={`cond-tab${condition === c ? " active" : ""}`}
                  data-cond={c}
                  onClick={() => setCondition(c)}
                >
                  {c === "above" ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <polyline
                        points="18 15 12 9 6 15"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <polyline
                        points="6 9 12 15 18 9"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            <div className="notif-price-wrap">
              <span className="notif-price-prefix">$</span>
              <input
                type="number"
                className="notif-price-input"
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                step="any"
                min="0"
              />
            </div>
          </div>
          {formError && (
            <div
              style={{
                fontSize: "10px",
                color: "var(--red)",
                marginBottom: "6px",
                fontFamily: "var(--font-mono)",
              }}
            >
              ⚠ {formError}
            </div>
          )}
          <button className="notif-create-btn" onClick={handleCreate}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="2"
                x2="12"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Set Alert
          </button>
        </div>

        {/* Active Alerts */}
        <div className="notif-list-wrap">
          <div className="notif-list-label">Active Alerts</div>
          <div className="notif-list">
            {activeAlerts.length === 0 ? (
              <div className="notif-empty">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  opacity="0.3"
                >
                  <path
                    d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13.73 21a2 2 0 0 1-3.46 0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p>
                  No alerts yet.
                  <br />
                  Set a price target above.
                </p>
              </div>
            ) : (
              [...alerts].reverse().map((a) => (
                <div
                  key={a.id}
                  className={`alert-item${a.triggered ? " triggered" : ""}`}
                >
                  <img className="alert-coin-img" src={a.image} alt={a.name} />
                  <div className="alert-info">
                    <div className="alert-coin-name">{a.name}</div>
                    <div className="alert-condition">
                      <span className={`alert-cond-pill cond-${a.condition}`}>
                        {a.condition === "above" ? "▲ ABOVE" : "▼ BELOW"}
                      </span>
                      <span className="alert-target-price">
                        {formatPrice(a.targetPrice)}
                      </span>
                      {a.triggered && (
                        <span className="alert-hit-tag">✓ HIT</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`alert-status-dot ${a.triggered ? "status-triggered" : "status-active"}`}
                  ></div>
                  <button
                    className="alert-delete-btn"
                    onClick={() => onDeleteAlert(a.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notification History */}
        {notifs.length > 0 && (
          <div className="notif-history-wrap">
            <div className="notif-list-label">
              Notifications{" "}
              <span className="notif-history-count">{notifs.length}</span>
            </div>
            <div className="notif-history-list">
              {[...notifs].reverse().map((n) => (
                <div
                  key={n.id}
                  className={`notif-history-item${n.unread ? " unread" : ""}`}
                >
                  <div className="notif-hist-icon">
                    <img
                      src={n.image}
                      style={{ width: 18, height: 18, borderRadius: "50%" }}
                      alt={n.name}
                    />
                  </div>
                  <div className="notif-hist-content">
                    <div className="notif-hist-title">
                      {n.name}{" "}
                      {n.condition === "above" ? "rose above" : "fell below"}{" "}
                      {formatPrice(n.targetPrice)}
                    </div>
                    <div className="notif-hist-meta">
                      <span style={{ color: "var(--accent)" }}>
                        {formatPrice(n.hitPrice)}
                      </span>
                      <span>·</span>
                      <span>{timeAgo(n.triggeredAt)}</span>
                    </div>
                  </div>
                  <button
                    className="notif-hist-delete"
                    onClick={() => onDeleteNotif(n.id)}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
