import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "../utils/formatters";
import "./Toast.css";

// Global toast event bus
const listeners = new Set();
export function fireToast(notif) {
  listeners.forEach((fn) => fn(notif));
}

export default function ToastStack() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (notif) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev,
        { ...notif, _toastId: id, exiting: false },
      ]);
      setTimeout(() => dismissToast(id), 10000);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t._toastId === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t._toastId !== id));
    }, 380);
  }, []);

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div
          key={toast._toastId}
          className={`toast${toast.exiting ? " toast-exit" : ""}`}
        >
          <div className="toast-progress-bar"></div>
          <div className="toast-body">
            <div className="toast-icon-wrap">
              <img
                className="toast-coin-img"
                src={toast.image}
                alt={toast.name}
              />
            </div>
            <div className="toast-content">
              <div className="toast-tag">
                {toast.condition === "above" ? "🚀" : "📉"} Price Alert
                Triggered
              </div>
              <div className="toast-title">
                <strong>{toast.name}</strong>{" "}
                {toast.condition === "above" ? "surpassed" : "dropped below"}{" "}
                your target
              </div>
              <div className="toast-meta">
                <span className="toast-price-pill">
                  {formatPrice(toast.hitPrice)}
                </span>
                <span className="toast-target-pill">
                  target: {formatPrice(toast.targetPrice)}
                </span>
              </div>
              <div className="toast-actions">
                <button
                  className="toast-action-btn toast-action-primary"
                  onClick={() => dismissToast(toast._toastId)}
                >
                  View Chart →
                </button>
                <button
                  className="toast-action-btn toast-action-secondary"
                  onClick={() => dismissToast(toast._toastId)}
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              className="toast-close"
              onClick={() => dismissToast(toast._toastId)}
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
        </div>
      ))}
    </div>
  );
}
