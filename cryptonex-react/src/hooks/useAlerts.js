import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_ALERTS = "cnx-alerts";
const STORAGE_KEY_NOTIFS = "cnx-notifs";

function loadFromStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function useAlerts() {
  const [alerts, setAlerts] = useState(() =>
    loadFromStorage(STORAGE_KEY_ALERTS, []),
  );
  const [notifs, setNotifs] = useState(() =>
    loadFromStorage(STORAGE_KEY_NOTIFS, []),
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
    } catch {}
  }, [notifs]);

  const createAlert = useCallback((alertData) => {
    setAlerts((prev) => [
      ...prev,
      {
        ...alertData,
        id: Date.now(),
        triggered: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const deleteAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const deleteNotif = useCallback((id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
    setNotifs([]);
  }, []);

  const markNotifsRead = useCallback(() => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const checkAlerts = useCallback((coinData, panelOpen, onFire) => {
    const priceMap = {};
    coinData.forEach((c) => {
      priceMap[c.id] = c.current_price;
    });

    setAlerts((prev) => {
      let changed = false;
      const updated = prev.map((a) => {
        if (a.triggered) return a;
        const price = priceMap[a.coinId];
        if (price == null) return a;
        const hit =
          (a.condition === "above" && price >= a.targetPrice) ||
          (a.condition === "below" && price <= a.targetPrice);
        if (!hit) return a;
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
          unread: !panelOpen,
        };
        setNotifs((n) => [...n, notif]);
        if (onFire) onFire(notif);
        return { ...a, triggered: true };
      });
      return changed ? updated : prev;
    });
  }, []);

  const activeCount = alerts.filter((a) => !a.triggered).length;
  const unreadCount = notifs.filter((n) => n.unread).length;
  const badgeCount = activeCount + unreadCount;

  return {
    alerts,
    notifs,
    createAlert,
    deleteAlert,
    deleteNotif,
    clearAll,
    markNotifsRead,
    checkAlerts,
    badgeCount,
    activeCount,
  };
}
