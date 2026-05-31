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
import { getPortfolio } from "../services/api";
import { usePortfolioStore } from "../store/portfolioStore";

type Props = CompositeScreenProps<BottomTabScreenProps<TabsParamList, "Portfolio">, NativeStackScreenProps<RootStackParamList>>;

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function PortfolioScreen({ navigation }: Props) {
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<any>();
  const { selectedSymbol, setSelectedSymbol } = usePortfolioStore();

  useEffect(() => {
    getPortfolio().then(setData);
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
            <Text style={{ color: "#73c441", fontSize: 18, fontWeight: "900" }}>+{rupee.format(data.summary.today_pnl)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          {[
            ["Overall gain", rupee.format(data.summary.overall_gain)],
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
                <Text numberOfLines={1} style={{ color: "#fffdf5", fontSize: 15, fontWeight: "900" }}>{rupee.format(holding.last_price)}</Text>
                <Text numberOfLines={1} style={{ color: holding.pnl >= 0 ? "#73c441" : "#ff7064", fontWeight: "800" }}>
                  {holding.pnl >= 0 ? "+" : ""}{rupee.format(holding.pnl)}
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
