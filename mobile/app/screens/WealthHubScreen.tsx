import { Link, RefreshCw, ShieldCheck } from "lucide-react-native";
import type React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";

import Screen from "../components/Screen";
import {
  createShareLink,
  addPriceAlert,
  addWatchlistItem,
  askPortfolio,
  getFxRate,
  getLiveQuotes,
  getPerformance,
  getCapitalGainsReport,
  getDividends,
  getGoals,
  getPortfolios,
  getPriceAlerts,
  getWatchlist,
  getWealthDashboard,
  importAiText,
  importCsvText,
  runRetirementProjection
} from "../services/api";

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

type HubState = {
  dashboard: any;
  portfolios: any[];
  watchlist: any[];
  alerts: any[];
  dividends: any;
  goals: any[];
  tax: any;
};

export default function WealthHubScreen() {
  const [state, setState] = useState<HubState | null>(null);
  const [shareUrl, setShareUrl] = useState<string>();
  const [symbol, setSymbol] = useState("");
  const [target, setTarget] = useState("");
  const [importText, setImportText] = useState("");
  const [toolResult, setToolResult] = useState<string>();

  async function load() {
    const [dashboard, portfolios, watchlist, alerts, dividends, goals, tax] = await Promise.all([
      getWealthDashboard(),
      getPortfolios(),
      getWatchlist(),
      getPriceAlerts(),
      getDividends(),
      getGoals(),
      getCapitalGainsReport()
    ]);
    setState({ dashboard, portfolios, watchlist, alerts, dividends, goals, tax });
  }

  useEffect(() => {
    load();
  }, []);

  if (!state) {
    return (
      <View style={{ flex: 1, backgroundColor: "#151615", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#73c441" />
      </View>
    );
  }

  const summary = state.dashboard.summary;

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={{ color: "#fffdf5", fontSize: 22, fontWeight: "900" }}>Wealth OS</Text>
        <TouchableOpacity onPress={load} style={{ padding: 8 }}>
          <RefreshCw color="#f7f4ea" size={18} />
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14 }}>
        <Text style={{ color: "#c8cabd", fontWeight: "700" }}>Unified net worth</Text>
        <Text style={{ color: "#fffdf5", fontSize: 30, fontWeight: "900", marginTop: 4 }}>{rupee.format(summary.total_value)}</Text>
        <Text style={{ color: summary.today_pnl >= 0 ? "#73c441" : "#ff7064", fontWeight: "900", marginTop: 6 }}>
          {summary.today_pnl >= 0 ? "+" : ""}{rupee.format(summary.today_pnl)} today
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        {[
          ["Portfolios", state.portfolios.length],
          ["Watchlist", state.watchlist.length],
          ["Alerts", state.alerts.length],
          ["Goals", state.goals.length]
        ].map(([label, value]) => (
          <View key={label as string} style={{ flex: 1, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 10 }}>
            <Text style={{ color: "#c8cabd", fontSize: 11, fontWeight: "700" }}>{label as string}</Text>
            <Text style={{ color: "#fffdf5", fontWeight: "900", fontSize: 18 }}>{value as number}</Text>
          </View>
        ))}
      </View>

      <Section title="Allocation">
        {state.dashboard.allocation.by_exchange.map((item: any) => (
          <Row key={item.label} label={item.label} value={`${rupee.format(item.value)} (${Math.round(item.weight * 100)}%)`} />
        ))}
      </Section>

      <Section title="Signals & risk">
        {state.dashboard.signals.map((signal: any) => (
          <Row key={signal.tradingsymbol} label={signal.tradingsymbol} value={`${signal.type} - ${signal.reason}`} />
        ))}
      </Section>

      <Section title="Income & tax">
        <Row label="Dividend income" value={rupee.format(state.dividends.total_income)} />
        <Row label="Forecast dividends" value={rupee.format(state.dividends.forecast_income)} />
        <Row label="FIFO realized gain" value={rupee.format(state.tax.total_gain)} />
      </Section>

      <Section title="Planning">
        {state.goals.length ? state.goals.map((goal: any) => (
          <Row key={goal.id} label={goal.name} value={`${Math.round(goal.progress * 100)}% funded`} />
        )) : <Text style={{ color: "#c8cabd" }}>No goals yet. API support is ready for goal creation and projections.</Text>}
      </Section>

      <Section title="Integrations">
        <Row label="Broker sync" value="Zerodha connected" />
        <Row label="AI trade import" value="Voice, text, screenshot contract ready" />
        <Row label="CSV import/export" value="Transaction schema ready" />
        <Row label="Alert channels" value="Browser, WhatsApp, Telegram, Email, SMS contracts" />
      </Section>

      <Section title="Watchlist & alerts">
        <TextInput
          value={symbol}
          onChangeText={setSymbol}
          placeholder="Symbol, e.g. TATAPOWER"
          placeholderTextColor="#8f9288"
          style={{ color: "#fffdf5", borderColor: "#4d5148", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 }}
        />
        <TextInput
          value={target}
          onChangeText={setTarget}
          placeholder="Target price"
          placeholderTextColor="#8f9288"
          keyboardType="numeric"
          style={{ color: "#fffdf5", borderColor: "#4d5148", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 8 }}
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <ActionButton label="Add watch" onPress={async () => {
            await addWatchlistItem({ tradingsymbol: symbol, target_price: Number(target) || undefined });
            await load();
          }} />
          <ActionButton label="Add alert" onPress={async () => {
            await addPriceAlert({ tradingsymbol: symbol, condition: "above", target_price: Number(target), channels: ["browser"] });
            await load();
          }} />
        </View>
      </Section>

      <Section title="Imports, FX & planning">
        <TextInput
          value={importText}
          onChangeText={setImportText}
          placeholder="Paste trade text or CSV rows"
          placeholderTextColor="#8f9288"
          multiline
          style={{ color: "#fffdf5", borderColor: "#4d5148", borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 76, marginBottom: 8 }}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <ActionButton label="AI parse" onPress={async () => setToolResult(JSON.stringify(await importAiText(importText)))} />
          <ActionButton label="CSV import" onPress={async () => setToolResult(JSON.stringify(await importCsvText(importText)))} />
          <ActionButton label="Live quotes" onPress={async () => setToolResult(JSON.stringify(await getLiveQuotes()))} />
          <ActionButton label="USD/INR" onPress={async () => setToolResult(JSON.stringify(await getFxRate("USD", "INR")))} />
          <ActionButton label="Benchmark" onPress={async () => setToolResult(JSON.stringify(await getPerformance()))} />
          <ActionButton label="Retirement" onPress={async () => setToolResult(JSON.stringify(await runRetirementProjection({ current_age: 30, retirement_age: 60, monthly_contribution: 10000 })))} />
          <ActionButton label="Ask AI" onPress={async () => setToolResult(JSON.stringify(await askPortfolio(importText || "What should I buy?")))} />
        </View>
        {toolResult ? <Text style={{ color: "#c8cabd", marginTop: 8 }} numberOfLines={6}>{toolResult}</Text> : null}
      </Section>

      <TouchableOpacity
        onPress={async () => {
          const link = await createShareLink();
          setShareUrl(link.url);
        }}
        style={{ marginTop: 12, borderColor: "#686c62", borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
      >
        <Link color="#f7f4ea" size={16} />
        <Text style={{ color: "#f7f4ea", fontWeight: "900" }}>Create read-only share link</Text>
      </TouchableOpacity>
      {shareUrl ? (
        <View style={{ marginTop: 10, flexDirection: "row", gap: 8, alignItems: "center" }}>
          <ShieldCheck color="#73c441" size={16} />
          <Text style={{ color: "#c8cabd", flex: 1 }}>{shareUrl}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ borderColor: "#686c62", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 }}>
      <Text style={{ color: "#f7f4ea", fontWeight: "900" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 12, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14 }}>
      <Text style={{ color: "#fffdf5", fontSize: 16, fontWeight: "900", marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 6 }}>
      <Text style={{ color: "#c8cabd", flex: 1 }}>{label}</Text>
      <Text style={{ color: "#fffdf5", fontWeight: "800", flex: 1, textAlign: "right" }}>{value}</Text>
    </View>
  );
}
