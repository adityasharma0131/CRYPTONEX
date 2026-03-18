import { useMemo } from "react";
import "./Ticker.css";

const STATIC_COINS = [
  { sym: "BTC", price: 67234.5, chg: 1.84 },
  { sym: "ETH", price: 3512.2, chg: 2.31 },
  { sym: "BNB", price: 589.1, chg: -0.45 },
  { sym: "SOL", price: 178.4, chg: 3.12 },
  { sym: "XRP", price: 0.6234, chg: -1.2 },
  { sym: "ADA", price: 0.4521, chg: 0.88 },
  { sym: "DOGE", price: 0.1342, chg: 5.21 },
  { sym: "DOT", price: 8.23, chg: -0.62 },
  { sym: "MATIC", price: 0.9811, chg: 1.07 },
  { sym: "AVAX", price: 41.7, chg: 2.44 },
  { sym: "LINK", price: 18.32, chg: -0.91 },
  { sym: "UNI", price: 11.04, chg: 1.55 },
];

export default function Ticker({
  coins = [],
  currentSymbol = null,
  currentPrice = 0,
  currentChange = 0,
}) {
  const items = useMemo(() => {
    let base = STATIC_COINS;
    if (coins && coins.length > 0) {
      base = coins.slice(0, 30).map((c) => ({
        sym: c.symbol.toUpperCase(),
        price: c.current_price,
        chg: c.price_change_percentage_24h ?? 0,
      }));
    }
    // inject live price for current coin
    if (currentSymbol && currentPrice > 0) {
      base = base.map((c) =>
        c.sym === currentSymbol.toUpperCase()
          ? { ...c, price: currentPrice, chg: currentChange }
          : c,
      );
    }
    return [...base, ...base]; // duplicate for seamless loop
  }, [coins, currentSymbol, currentPrice, currentChange]);

  return (
    <div className="ticker-wrap">
      <div className="ticker-label">MARKETS</div>
      <div className="ticker-track">
        <div className="ticker-inner">
          {items.map((c, i) => {
            const isUp = c.chg >= 0;
            const sign = isUp ? "+" : "";
            const priceStr =
              c.price >= 1
                ? c.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : c.price.toFixed(4);
            return (
              <span key={i} className="ticker-item">
                <span className="ticker-sym">{c.sym}</span>
                <span className="ticker-price">${priceStr}</span>
                <span
                  className={isUp ? "ticker-change-pos" : "ticker-change-neg"}
                >
                  {sign}
                  {c.chg.toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
