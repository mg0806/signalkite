import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowUpRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import type { RootStackParamList, TabsParamList } from "../../App";
import IndicatorTag from "../components/IndicatorTag";
import Screen from "../components/Screen";
import SignalPill from "../components/SignalPill";
import SparklineChart from "../components/SparklineChart";
import { AuthenticationRequiredError, getPortfolio } from "../services/api";
import { usePortfolioStore } from "../store/portfolioStore";

type Props = CompositeScreenProps<BottomTabScreenProps<TabsParamList, "Portfolio">, NativeStackScreenProps<RootStackParamList>>;

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const rupeePrecise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

function signedRupee(value: number) {
  return `${value >= 0 ? "+" : ""}${rupee.format(value)}`;
}

function signedRupeePrecise(value: number) {
  return `${value >= 0 ? "+" : ""}${rupeePrecise.format(value)}`;
}

function timeLabel(value?: string) {
  if (!value) {
    return "--";
  }
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function refreshStatusLabel(summary: any) {
  const stats = summary.refresh_stats;
  if (summary.refresh_status === "live") {
    return `Live quotes ${stats?.quote_count ?? ""}/${stats?.holdings_count ?? ""}`;
  }
  if (summary.refresh_status === "partial_live") {
    return `Partial live quotes ${stats?.quote_count ?? 0}/${stats?.holdings_count ?? 0}`;
  }
  if (summary.refresh_status === "holdings_snapshot") {
    return "Kite holdings snapshot";
  }
  return `Stale data${summary.refresh_error ? `: ${summary.refresh_error}` : ""}`;
}

function refreshStatusColor(status?: string) {
  if (status === "live") {
    return "#73c441";
  }
  if (status === "partial_live" || status === "holdings_snapshot") {
    return "#f0d56b";
  }
  return "#ff7064";
}

export default function PortfolioScreen({ navigation }: Props) {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<any>();
  const [checkedAt, setCheckedAt] = useState<Date>();
  const { selectedSymbol, setSelectedSymbol } = usePortfolioStore();

  useEffect(() => {
    let mounted = true;
    let loading = false;

    async function refreshPortfolio() {
      if (loading) {
        return;
      }
      loading = true;
      try {
        const portfolio = await getPortfolio();
        if (mounted) {
          setData(portfolio);
          setCheckedAt(new Date());
        }
      } catch (error) {
        if (error instanceof AuthenticationRequiredError && mounted) {
          rootNav.replace("Login");
        }
      } finally {
        loading = false;
      }
    }

    refreshPortfolio();
    const intervalId = setInterval(refreshPortfolio, 3000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: "#151615", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#73c441" />
      </View>
    );
  }

  return (
    <Screen>
      <View style={{ borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 16, backgroundColor: "#242522" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View>
            <Text style={{ color: "#d8d8ce", fontWeight: "700" }}>Portfolio value</Text>
            <Text style={{ color: "#fffdf5", fontSize: 28, fontWeight: "900" }}>{rupee.format(data.summary.total_value)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#d8d8ce", fontWeight: "700" }}>Today's P&L</Text>
            <Text style={{ color: data.summary.today_pnl >= 0 ? "#73c441" : "#ff7064", fontSize: 18, fontWeight: "900" }}>
              {signedRupeePrecise(data.summary.today_pnl)}
            </Text>
            <Text style={{ color: "#8f9288", fontSize: 11, fontWeight: "800", marginTop: 4 }}>
              Updated {timeLabel(data.summary.last_updated)}
            </Text>
            <Text style={{ color: "#8f9288", fontSize: 11, fontWeight: "800", marginTop: 2 }}>
              Checked {checkedAt ? checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--"}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: refreshStatusColor(data.summary.refresh_status),
                fontSize: 11,
                fontWeight: "900",
                marginTop: 2,
                maxWidth: 220
              }}
            >
              {refreshStatusLabel(data.summary)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          {[
            ["Overall gain", signedRupeePrecise(data.summary.overall_gain)],
            ["XIRR", data.summary.xirr ? `${data.summary.xirr}%` : "--"],
            ["Signals today", `${data.summary.active_signals} active`]
          ].map(([label, value]) => (
            <View key={label} style={{ flex: 1, backgroundColor: "#1b1c1a", borderRadius: 7, padding: 10, minHeight: 54 }}>
              <Text style={{ color: "#d8d8ce", fontSize: 11, fontWeight: "700" }}>{label}</Text>
              <Text style={{ color: label === "Signals today" ? "#fffdf5" : "#73c441", fontWeight: "900" }}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 14, borderColor: "#393c36", borderWidth: 1, borderRadius: 8, overflow: "hidden" }}>
        {data.holdings.map((holding: any) => (
          <TouchableOpacity
            key={holding.tradingsymbol}
            onPress={() => setSelectedSymbol(holding.tradingsymbol)}
            style={{
              padding: 14,
              borderBottomColor: "#393c36",
              borderBottomWidth: 1,
              backgroundColor: selectedSymbol === holding.tradingsymbol ? "#292b27" : "#242522"
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 92 }}>
              <View style={{ flex: 1, minWidth: 180 }}>
                <Text numberOfLines={1} style={{ color: "#fffdf5", fontSize: 16, fontWeight: "900" }}>{holding.tradingsymbol}</Text>
                <Text numberOfLines={1} style={{ color: "#d8d8ce", fontWeight: "700" }}>
                  {holding.quantity} qty - avg {rupee.format(holding.average_price)}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  <IndicatorTag label={`RSI ${Math.round(holding.signal?.rsi ?? 0)}`} />
                  <IndicatorTag label={holding.signal?.reason?.split(",")[0] ?? "Neutral"} />
                </View>
              </View>
              <View style={{ width: 86, flexShrink: 0, alignItems: "center", overflow: "hidden" }}>
                <SparklineChart values={holding.sparkline?.length ? holding.sparkline : [1, 2, 1]} color={holding.pnl >= 0 ? "#73c441" : "#ff7064"} />
              </View>
              <View style={{ width: 110, flexShrink: 0, alignItems: "flex-end" }}>
                <Text numberOfLines={1} style={{ color: "#8f9288", fontSize: 11, fontWeight: "800" }}>Current</Text>
                <Text numberOfLines={1} style={{ color: "#fffdf5", fontSize: 15, fontWeight: "900" }}>{rupeePrecise.format(holding.last_price)}</Text>
                <Text numberOfLines={1} style={{ color: "#8f9288", fontSize: 11, fontWeight: "800", marginTop: 4 }}>Target</Text>
                <Text numberOfLines={1} style={{ color: "#f0d56b", fontSize: 14, fontWeight: "900" }}>
                  {holding.target_price ? rupeePrecise.format(holding.target_price) : "--"}
                </Text>
                <Text numberOfLines={1} style={{ color: holding.pnl >= 0 ? "#73c441" : "#ff7064", fontWeight: "800" }}>
                  {signedRupeePrecise(holding.pnl)}
                </Text>
                <SignalPill type={holding.signal?.type ?? "HOLD"} confidence={holding.signal?.confidence} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => rootNav.navigate("StockAnalysis", { symbol: selectedSymbol })}
          style={{ flex: 1, borderColor: "#686c62", borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
        >
          <Text style={{ color: "#fffdf5", fontWeight: "900" }}>Why now?</Text>
          <ArrowUpRight color="#fffdf5" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Picks")}
          style={{ flex: 1, borderColor: "#686c62", borderWidth: 1, borderRadius: 8, padding: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
        >
          <Text style={{ color: "#fffdf5", fontWeight: "900" }}>Top picks</Text>
          <ArrowUpRight color="#fffdf5" size={16} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
