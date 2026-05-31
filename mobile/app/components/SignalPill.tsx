import { Text, View } from "react-native";

const colors = {
  BUY: { bg: "#18381f", fg: "#75d14b" },
  SELL: { bg: "#4a2020", fg: "#ff7064" },
  HOLD: { bg: "#43320d", fg: "#f2b84b" }
};

type Props = {
  type: "BUY" | "SELL" | "HOLD";
  confidence?: string;
};

export default function SignalPill({ type, confidence }: Props) {
  const palette = colors[type];
  return (
    <View style={{ backgroundColor: palette.bg, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" }}>
      <Text style={{ color: palette.fg, fontWeight: "800", fontSize: 12 }}>{type}{confidence === "HIGH" ? " +" : ""}</Text>
    </View>
  );
}
