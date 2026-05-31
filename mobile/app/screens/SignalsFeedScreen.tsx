import { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import Screen from "../components/Screen";
import SignalPill from "../components/SignalPill";
import { getSignals } from "../services/api";

const tabs = ["ALL", "BUY", "SELL", "HOLD"] as const;

export default function SignalsFeedScreen() {
  const [signals, setSignals] = useState<any[]>([]);
  const [filter, setFilter] = useState<(typeof tabs)[number]>("ALL");

  useEffect(() => {
    getSignals().then(setSignals);
  }, []);

  const filtered = useMemo(
    () => signals.filter((signal) => filter === "ALL" || signal.type === filter),
    [signals, filter]
  );

  return (
    <Screen>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={{ flex: 1, backgroundColor: filter === tab ? "#73c441" : "#242522", borderRadius: 8, paddingVertical: 10, alignItems: "center" }}
          >
            <Text style={{ color: filter === tab ? "#10210f" : "#f7f4ea", fontWeight: "900", fontSize: 12 }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {filtered.map((signal) => (
        <View key={`${signal.tradingsymbol}-${signal.computed_at}`} style={{ backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "#fffdf5", fontSize: 17, fontWeight: "900" }}>{signal.tradingsymbol}</Text>
            <SignalPill type={signal.type} confidence={signal.confidence} />
          </View>
          <Text style={{ color: "#d8d8ce", marginTop: 8, lineHeight: 21 }}>{signal.reason}</Text>
          <Text style={{ color: "#8f9288", marginTop: 8, fontWeight: "700" }}>{new Date(signal.computed_at).toLocaleString()}</Text>
        </View>
      ))}
    </Screen>
  );
}
