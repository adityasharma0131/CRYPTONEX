export function formatNumber(num) {
  if (num == null || num === "") return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  return "$" + num.toLocaleString();
}

export function formatCompact(n) {
  const num = parseFloat(n);
  if (isNaN(num) || num <= 0) return "N/A";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return "$" + num.toLocaleString("en-US");
}

export function formatPrice(price) {
  if (price == null || price === "") return "—";
  if (price < 0.0001) return "$" + price.toFixed(8);
  if (price < 0.01) return "$" + price.toFixed(6);
  if (price < 1) return "$" + price.toFixed(4);
  if (price >= 1000)
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return (
    "$" +
    price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function formatChange(change) {
  if (change == null) return { text: "—", cls: "" };
  const pos = change >= 0;
  return {
    text: (pos ? "▲ " : "▼ ") + Math.abs(change).toFixed(2) + "%",
    cls: pos ? "positive" : "negative",
  };
}

export function formatPct(n) {
  const v = parseFloat(n);
  if (isNaN(v)) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
