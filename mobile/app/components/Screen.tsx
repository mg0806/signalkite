import { PropsWithChildren } from "react";
import { ScrollView, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = PropsWithChildren<{
  style?: ViewStyle;
}>;

export default function Screen({ children, style }: Props) {
  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1, backgroundColor: "#151615" }}>
      <ScrollView contentContainerStyle={[{ padding: 16, paddingBottom: 28 }, style]}>{children}</ScrollView>
    </SafeAreaView>
  );
}
