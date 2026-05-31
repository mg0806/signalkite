import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";

import type { RootStackParamList } from "../../App";
import CandlestickChart from "../components/CandlestickChart";
import Screen from "../components/Screen";
import SignalPill from "../components/SignalPill";
import { getStockAnalysis } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "StockAnalysis">;

const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function StockAnalysisScreen({ route }: Props) {
  const [analysis, setAnalysis] = useState<any>();

  useEffect(() => {
    getStockAnalysis(route.params.symbol).then(setAnalysis);
  }, [route.params.symbol]);

  if (!analysis) {
    return (
      <View style={{ flex: 1, backgroundColor: "#151615", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#73c441" />
      </View>
    );
  }

  const rsi = analysis.latest_signal?.rsi ?? 50;
  const macd = analysis.latest_signal?.macd_hist ?? 0.4;

  return (
    <Screen>
      <View style={{ backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 12 }}>
        <CandlestickChart candles={analysis.candles ?? []} />
      </View>

      <View style={{ marginTop: 12, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14, overflow: "hidden" }}>
        <Text style={{ color: "#fffdf5", fontSize: 16, fontWeight: "900", marginBottom: 8 }}>RSI</Text>
        <LineChart
          data={[44, 39, 36, rsi].map((value) => ({ value }))}
          height={90}
          width={310}
          color={rsi < 35 ? "#73c441" : rsi > 65 ? "#ff7064" : "#f2b84b"}
          thickness={2}
          hideDataPoints
          hideRules
          yAxisColor="#393c36"
          xAxisColor="#393c36"
        />
      </View>

      <View style={{ marginTop: 12, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14, overflow: "hidden" }}>
        <Text style={{ color: "#fffdf5", fontSize: 16, fontWeight: "900", marginBottom: 8 }}>MACD</Text>
        <BarChart
          data={[-0.3, -0.1, 0.1, macd].map((value) => ({ value, frontColor: value >= 0 ? "#73c441" : "#ff7064" }))}
          height={90}
          width={310}
          barWidth={24}
          spacing={20}
          yAxisColor="#393c36"
          xAxisColor="#393c36"
        />
      </View>

      <View style={{ marginTop: 12, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ color: "#fffdf5", fontSize: 18, fontWeight: "900" }}>Recommendation</Text>
          <SignalPill type={analysis.latest_signal.type} confidence={analysis.latest_signal.confidence} />
        </View>
        <Text style={{ color: "#d8d8ce", lineHeight: 22, marginTop: 10 }}>{analysis.latest_signal.reason}</Text>
      </View>

      <View style={{ marginTop: 12, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14 }}>
        <Text style={{ color: "#fffdf5", fontSize: 16, fontWeight: "900", marginBottom: 10 }}>Key levels</Text>
        {Object.entries(analysis.levels).map(([key, value]) => (
          <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 6 }}>
            <Text style={{ color: "#c8cabd", textTransform: "capitalize" }}>{key.replace("_", " ")}</Text>
            <Text style={{ color: "#fffdf5", fontWeight: "800" }}>{typeof value === "number" ? rupee.format(value) : "--"}</Text>
          </View>
        ))}
      </View>

      {analysis.fundamentals && Object.keys(analysis.fundamentals).length > 0 ? (
        <View style={{ marginTop: 12, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14 }}>
          <Text style={{ color: "#fffdf5", fontSize: 16, fontWeight: "900", marginBottom: 10 }}>Screener fundamentals</Text>
          {Object.entries(analysis.fundamentals).map(([key, value]) => (
            <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 6 }}>
              <Text style={{ color: "#c8cabd", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</Text>
              <Text style={{ color: "#fffdf5", fontWeight: "800" }}>{String(value)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ marginTop: 12, backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14 }}>
        <Text style={{ color: "#fffdf5", fontSize: 16, fontWeight: "900", marginBottom: 10 }}>Signal history</Text>
        {analysis.signal_history.map((item: any, index: number) => (
          <View key={`${item.computed_at}-${index}`} style={{ paddingVertical: 9, borderTopColor: index ? "#393c36" : "transparent", borderTopWidth: 1 }}>
            <Text style={{ color: "#fffdf5", fontWeight: "900" }}>{item.type} - {item.confidence}</Text>
            <Text style={{ color: "#c8cabd", marginTop: 3 }}>{item.reason}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
