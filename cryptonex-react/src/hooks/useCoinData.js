import { useState, useEffect, useCallback, useRef } from "react";

const CG_BASE =
  "https://api.coingecko.com/api/v3/coins/markets" +
  "?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h";

export function useCoinData(refreshInterval = 30000) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  const fetchCoins = useCallback(async () => {
    try {
      const r = await fetch(CG_BASE, { cache: "no-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      setCoins(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
    timerRef.current = setInterval(fetchCoins, refreshInterval);
    return () => clearInterval(timerRef.current);
  }, [fetchCoins, refreshInterval]);

  return { coins, loading, error, lastUpdated, refresh: fetchCoins };
}

const SYMBOL_TO_CG_ID = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
  XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", DOT: "polkadot",
  MATIC: "matic-network", AVAX: "avalanche-2", LINK: "chainlink",
  UNI: "uniswap", LTC: "litecoin", BCH: "bitcoin-cash", ATOM: "cosmos",
  ETC: "ethereum-classic", XLM: "stellar", ALGO: "algorand", VET: "vechain",
  FTM: "fantom", SAND: "the-sandbox", MANA: "decentraland", SHIB: "shiba-inu",
  TRX: "tron", NEAR: "near", ICP: "internet-computer", FIL: "filecoin",
  AAVE: "aave", GRT: "the-graph", MKR: "maker", TON: "the-open-network",
  PEPE: "pepe", ARB: "arbitrum", OP: "optimism", SUI: "sui",
};

export async function resolveCoinGeckoId(sym) {
  const upper = sym.toUpperCase();
  if (SYMBOL_TO_CG_ID[upper]) return SYMBOL_TO_CG_ID[upper];
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(sym)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return sym.toLowerCase();
    const data = await res.json();
    const coin = (data.coins || []).find(
      (c) => c.symbol.toUpperCase() === upper
    );
    return coin ? coin.id : sym.toLowerCase();
  } catch {
    return sym.toLowerCase();
  }
}

export async function fetchSingleCoin(symbol) {
  const cgId = await resolveCoinGeckoId(symbol);
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(cgId)}&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0)
    throw new Error(`No market data found for ${symbol}`);
  return data[0];
}