import * as Linking from "expo-linking";
import { ExternalLink, ShieldAlert, ShoppingCart, TrendingUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import Screen from "../components/Screen";
import SignalPill from "../components/SignalPill";
import SparklineChart from "../components/SparklineChart";
import { getTopPicks } from "../services/api";
import { apiBaseUrl } from "../services/config";
import { captureException, trackEvent } from "../services/telemetry";

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, signDisplay: "exceptZero" });

type TopPick = {
  tradingsymbol: string;
  exchange?: string;
  category?: string;
  sector?: string;
  last_price: number;
  performance_1m?: number;
  performance_3m?: number;
  target_low?: number;
  target_high?: number;
  downside_level?: number;
  rsi?: number | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  signal_type?: "BUY" | "SELL" | "HOLD" | string;
  reason?: string;
  sparkline?: number[];
  instrument_token?: number | null;
  kite_url?: string;
  kite_chart_url?: string;
  kite_buy_url?: string;
};

function groupedByCategory(picks: TopPick[]) {
  return picks.reduce<Record<string, TopPick[]>>((groups, pick) => {
    const category = pick.category ?? pick.sector ?? "Market";
    groups[category] = [...(groups[category] ?? []), pick];
    return groups;
  }, {});
}

function signalType(pick: TopPick): "BUY" | "SELL" | "HOLD" {
  return pick.signal_type === "BUY" || pick.signal_type === "SELL" || pick.signal_type === "HOLD"
    ? pick.signal_type
    : "HOLD";
}

async function openInKite(pick: TopPick) {
  await Linking.openURL(pick.kite_chart_url ?? pick.kite_url ?? "https://kite.zerodha.com/dashboard");
}

async function buyInKite(pick: TopPick) {
  const url = pick.kite_buy_url?.startsWith("http")
    ? pick.kite_buy_url
    : `${apiBaseUrl()}${pick.kite_buy_url ?? `/market/kite/buy?exchange=${pick.exchange ?? "NSE"}&symbol=${pick.tradingsymbol}&quantity=1`}`;
  await Linking.openURL(url);
}

export default function TopPicksScreen() {
  const [picks, setPicks] = useState<TopPick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getTopPicks()
      .then((nextPicks) => {
        if (mounted) {
          setPicks(nextPicks);
          trackEvent("top_picks_loaded", { count: nextPicks.length });
        }
      })
      .catch((error) => captureException(error, { screen: "TopPicks" }))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const grouped = groupedByCategory(picks);

  return (
    <Screen>
      <Text style={{ color: "#fffdf5", fontSize: 22, fontWeight: "900", marginBottom: 4 }}>NSE/BSE top performers</Text>
      <Text style={{ color: "#c8cabd", lineHeight: 19, marginBottom: 14 }}>
        Category-wise momentum scan with technical target ranges. Targets are estimates, not guaranteed prices.
      </Text>

      {loading ? (
        <View style={{ backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <ActivityIndicator color="#73c441" />
            <Text style={{ color: "#fffdf5", fontWeight: "900" }}>Scanning NSE/BSE categories</Text>
          </View>
          <View style={{ height: 8, backgroundColor: "#171816", borderRadius: 8, overflow: "hidden" }}>
            <View style={{ width: "68%", height: 8, backgroundColor: "#73c441", borderRadius: 8 }} />
          </View>
          <Text style={{ color: "#c8cabd", lineHeight: 18, marginTop: 10 }}>
            Fetching recent price history, ranking momentum, and calculating target ranges.
          </Text>
        </View>
      ) : null}

      {!loading && picks.length === 0 ? (
        <View style={{ backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14 }}>
          <Text style={{ color: "#fffdf5", fontWeight: "900" }}>No picks available</Text>
          <Text style={{ color: "#c8cabd", marginTop: 6 }}>The market scan did not return results yet. Try again after the backend warms up.</Text>
        </View>
      ) : null}

      {Object.entries(grouped).map(([category, categoryPicks]) => (
        <View key={category} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#73c441", fontSize: 15, fontWeight: "900", marginBottom: 8 }}>{category}</Text>

          {categoryPicks.map((pick) => (
            <View
              key={`${category}-${pick.exchange ?? "NSE"}-${pick.tradingsymbol}`}
              style={{
                backgroundColor: "#242522",
                borderColor: "#393c36",
                borderWidth: 1,
                borderRadius: 8,
                padding: 14,
                marginBottom: 10,
                overflow: "hidden"
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ color: "#fffdf5", fontSize: 18, fontWeight: "900" }}>{pick.tradingsymbol}</Text>
                  <Text numberOfLines={1} style={{ color: "#c8cabd", marginTop: 2 }}>
                    {pick.exchange ?? "NSE"} - RSI {pick.rsi ?? "NA"} - {pick.signal_type ?? "SCAN"}
                  </Text>
                </View>
                <SignalPill type={signalType(pick)} confidence={pick.confidence} />
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 12, minHeight: 54 }}>
                <View style={{ width: 96, flexShrink: 0, overflow: "hidden" }}>
                  <SparklineChart values={pick.sparkline?.length ? pick.sparkline : [pick.last_price - 32, pick.last_price - 18, pick.last_price - 25, pick.last_price - 5, pick.last_price]} />
                </View>
                <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
                  <Text numberOfLines={1} style={{ color: "#fffdf5", fontSize: 18, fontWeight: "900", textAlign: "right" }}>
                    {rupee.format(pick.last_price)}
                  </Text>
                  <Text numberOfLines={1} style={{ color: "#c8cabd", marginTop: 2, textAlign: "right" }}>
                    1M {pct.format(pick.performance_1m ?? 0)}% / 3M {pct.format(pick.performance_3m ?? 0)}%
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <View style={{ flex: 1, backgroundColor: "#1b1c1a", borderRadius: 8, padding: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <TrendingUp color="#73c441" size={15} />
                    <Text style={{ color: "#c8cabd", fontSize: 12, fontWeight: "800" }}>Target</Text>
                  </View>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: "#fffdf5", fontWeight: "900" }}>
                    {rupee.format(pick.target_low ?? pick.last_price)} - {rupee.format(pick.target_high ?? pick.last_price)}
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#1b1c1a", borderRadius: 8, padding: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <ShieldAlert color="#f0b35a" size={15} />
                    <Text style={{ color: "#c8cabd", fontSize: 12, fontWeight: "800" }}>Risk level</Text>
                  </View>
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: "#fffdf5", fontWeight: "900" }}>
                    {rupee.format(pick.downside_level ?? pick.last_price)}
                  </Text>
                </View>
              </View>

              {pick.reason ? (
                <Text style={{ color: "#c8cabd", lineHeight: 18, marginTop: 10 }}>{pick.reason}</Text>
              ) : null}

              <TouchableOpacity
                onPress={() => openInKite(pick)}
                style={{ marginTop: 12, borderColor: "#686c62", borderWidth: 1, borderRadius: 8, paddingVertical: 11, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Text style={{ color: "#fffdf5", fontWeight: "900" }}>Open chart</Text>
                <ExternalLink color="#fffdf5" size={16} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => buyInKite(pick)}
                style={{ marginTop: 8, backgroundColor: "#73c441", borderRadius: 8, paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Text style={{ color: "#10210f", fontWeight: "900" }}>Buy 1 in Kite</Text>
                <ShoppingCart color="#10210f" size={16} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </Screen>
  );
}
