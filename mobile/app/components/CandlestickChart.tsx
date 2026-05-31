import { View } from "react-native";

type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
};

type Props = {
  candles: Candle[];
};

export default function CandlestickChart({ candles }: Props) {
  if (!candles.length) {
    return <View style={{ height: 220 }} />;
  }

  const max = Math.max(...candles.map((candle) => candle.high));
  const min = Math.min(...candles.map((candle) => candle.low));
  const range = Math.max(max - min, 1);

  return (
    <View style={{ height: 220, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 4 }}>
      {candles.map((candle, index) => {
        const up = candle.close >= candle.open;
        const color = up ? "#73c441" : "#ff7064";
        const wickTop = ((max - candle.high) / range) * 190;
        const wickHeight = Math.max(((candle.high - candle.low) / range) * 190, 10);
        const bodyTop = ((max - Math.max(candle.open, candle.close)) / range) * 190;
        const bodyHeight = Math.max((Math.abs(candle.close - candle.open) / range) * 190, 6);

        return (
          <View key={`${candle.close}-${index}`} style={{ width: 24, height: 200, position: "relative", alignItems: "center" }}>
            <View style={{ position: "absolute", top: wickTop, width: 2, height: wickHeight, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ position: "absolute", top: bodyTop, width: 16, height: bodyHeight, backgroundColor: color, borderRadius: 3 }} />
          </View>
        );
      })}
    </View>
  );
}
