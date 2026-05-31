import axios from "axios";

import { getAccessToken } from "./auth";
import { apiBaseUrl } from "./config";
import { portfolioMock, topPicksMock } from "./mockData";

const api = axios.create({
  baseURL: apiBaseUrl(),
  timeout: 6000
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type SignalType = "BUY" | "SELL" | "HOLD";

export async function getPortfolio() {
  try {
    const response = await api.get("/portfolio");
    return response.data;
  } catch {
    return portfolioMock;
  }
}

export async function getSignals() {
  try {
    const response = await api.get("/signals");
    return response.data;
  } catch {
    return portfolioMock.holdings.map((holding) => ({
      tradingsymbol: holding.tradingsymbol,
      type: holding.signal.type,
      confidence: holding.signal.confidence,
      reason: holding.signal.reason,
      computed_at: new Date().toISOString()
    }));
  }
}

export async function getTopPicks() {
  try {
    const response = await api.get("/market/top-picks", { params: { limit_per_category: 2 }, timeout: 60000 });
    return response.data;
  } catch {
    return topPicksMock;
  }
}

export async function getStockAnalysis(symbol: string) {
  try {
    const response = await api.get(`/portfolio/${symbol}/analysis`);
    return response.data;
  } catch {
    const holding = portfolioMock.holdings.find((item) => item.tradingsymbol === symbol) ?? portfolioMock.holdings[0];
    return {
      tradingsymbol: symbol,
      candles: holding.sparkline.map((value, index) => ({
        value,
        open: value - 8,
        high: value + 18,
        low: value - 14,
        close: value,
        date: `D-${6 - index}`
      })),
      latest_signal: holding.signal,
      levels: { support: holding.last_price - 50, resistance: holding.last_price + 70, bollinger_upper: holding.last_price + 95, bollinger_lower: holding.last_price - 90 },
      signal_history: [
        { type: holding.signal.type, confidence: holding.signal.confidence, reason: holding.signal.reason, computed_at: new Date().toISOString() },
        { type: "HOLD", confidence: "LOW", reason: "mixed or neutral indicator readings", computed_at: new Date(Date.now() - 86400000).toISOString() }
      ]
    };
  }
}

export async function getWealthDashboard() {
  const response = await api.get("/wealth/dashboard");
  return response.data;
}

export async function getPortfolios() {
  const response = await api.get("/wealth/portfolios");
  return response.data;
}

export async function getWatchlist() {
  const response = await api.get("/wealth/watchlist");
  return response.data;
}

export async function getPriceAlerts() {
  const response = await api.get("/wealth/alerts");
  return response.data;
}

export async function getDividends() {
  const response = await api.get("/wealth/dividends");
  return response.data;
}

export async function getGoals() {
  const response = await api.get("/wealth/goals");
  return response.data;
}

export async function getCapitalGainsReport() {
  const response = await api.get("/wealth/reports/capital-gains");
  return response.data;
}

export async function createShareLink() {
  const response = await api.post("/wealth/share-links");
  return response.data;
}

export async function addWatchlistItem(payload: { tradingsymbol: string; exchange?: string; target_price?: number; stop_loss?: number }) {
  const response = await api.post("/wealth/watchlist", payload);
  return response.data;
}

export async function addPriceAlert(payload: { tradingsymbol: string; condition: string; target_price: number; channels?: string[] }) {
  const response = await api.post("/wealth/alerts", payload);
  return response.data;
}

export async function importCsvText(text: string) {
  const response = await api.post("/wealth/imports/csv", { text });
  return response.data;
}

export async function importAiText(text: string) {
  const response = await api.post("/wealth/imports/ai", { text });
  return response.data;
}

export async function getLiveQuotes(symbols?: string[]) {
  const response = await api.get("/market/quotes", { params: symbols?.length ? { symbols: symbols.join(",") } : undefined });
  return response.data;
}

export async function getFxRate(base: string, quote: string) {
  const response = await api.get("/market/fx", { params: { base, quote } });
  return response.data;
}

export async function getPerformance() {
  const response = await api.get("/wealth/performance");
  return response.data;
}

export async function runRetirementProjection(payload: { current_age: number; retirement_age: number; monthly_contribution: number }) {
  const response = await api.post("/wealth/planning/retirement", payload);
  return response.data;
}

export async function askPortfolio(text: string) {
  const response = await api.post("/wealth/ai/ask", { text });
  return response.data;
}
