import { Text, View } from "react-native";

type Props = {
  label: string;
};

export default function IndicatorTag({ label }: Props) {
  return (
    <View style={{ backgroundColor: "#1b1c1a", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, marginRight: 6, marginTop: 6 }}>
      <Text style={{ color: "#e9e1c9", fontSize: 11, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}
