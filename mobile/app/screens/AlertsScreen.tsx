import { Bell, CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Switch, Text, View } from "react-native";

import Screen from "../components/Screen";

const alerts = [
  { symbol: "RELIANCE", text: "BUY signal: RSI oversold + MACD crossover", unread: true },
  { symbol: "HDFCBANK", text: "BUY signal: lower Bollinger Band touched", unread: true },
  { symbol: "INFY", text: "SELL signal: RSI entered overbought territory", unread: false }
];

export default function AlertsScreen() {
  const [buy, setBuy] = useState(true);
  const [sell, setSell] = useState(true);
  const [highOnly, setHighOnly] = useState(true);

  return (
    <Screen>
      <View style={{ backgroundColor: "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 14 }}>
        {[
          ["BUY alerts", buy, setBuy],
          ["SELL alerts", sell, setSell],
          ["HIGH confidence only", highOnly, setHighOnly]
        ].map(([label, value, setter]) => (
          <View key={label as string} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: "#fffdf5", fontWeight: "800" }}>{label as string}</Text>
            <Switch value={value as boolean} onValueChange={setter as (next: boolean) => void} thumbColor={(value as boolean) ? "#73c441" : "#8f9288"} />
          </View>
        ))}
      </View>
      {alerts.map((alert) => (
        <View key={alert.text} style={{ backgroundColor: alert.unread ? "#292b27" : "#242522", borderColor: "#393c36", borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10, flexDirection: "row", gap: 12 }}>
          {alert.unread ? <Bell color="#73c441" size={20} /> : <CheckCircle2 color="#8f9288" size={20} />}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fffdf5", fontWeight: "900" }}>{alert.symbol}</Text>
            <Text style={{ color: "#d8d8ce", marginTop: 4 }}>{alert.text}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
