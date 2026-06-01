import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { ShieldCheck } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import type { RootStackParamList } from "../../App";
import { getAccessToken, setAccessToken } from "../services/auth";
import { apiBaseUrl } from "../services/config";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

async function fetchKiteStatus() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${apiBaseUrl()}/auth/kite/status`, { signal: controller.signal });
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export default function LoginScreen({ navigation }: Props) {
  const loginUrl = `${apiBaseUrl()}/auth/kite/login`;
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function acceptToken(url: string | null) {
      if (!url) {
        return false;
      }
      const parsed = Linking.parse(url);
      const token = typeof parsed.queryParams?.token === "string" ? parsed.queryParams.token : undefined;
      if (!token) {
        return false;
      }
      await setAccessToken(token);
      if (mounted) {
        navigation.replace("Main");
      }
      return true;
    }

    async function checkExistingConnection() {
      try {
        if (await acceptToken(await Linking.getInitialURL())) {
          return;
        }
        if (await getAccessToken()) {
          navigation.replace("Main");
          return;
        }
        const status = await fetchKiteStatus();
        if (mounted && status.kite_connected) {
          navigation.replace("Main");
          return;
        }
      } catch {
        // The button handler shows a detailed reachability message.
      }
      if (mounted) {
        setCheckingConnection(false);
      }
    }

    checkExistingConnection();
    const subscription = Linking.addEventListener("url", ({ url }) => {
      acceptToken(url).catch(() => undefined);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [navigation]);

  async function connectWithZerodha() {
    setCheckingConnection(true);
    try {
      const status = await fetchKiteStatus();
      if (status.kite_connected) {
        navigation.replace("Main");
        return;
      }
      if (!status.kite_configured) {
        Alert.alert(
          "Kite login is not configured",
          "Add KITE_API_KEY and KITE_API_SECRET in backend/.env, restart FastAPI, then try again. Use sample portfolio for preview."
        );
        return;
      }
      await Linking.openURL(loginUrl);
    } catch {
      Alert.alert(
        "Backend is not reachable",
        `Start FastAPI on ${apiBaseUrl()} or use the sample portfolio preview.`
      );
    }
    setCheckingConnection(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#151615", padding: 24, justifyContent: "center" }}>
      <View style={{ marginBottom: 40 }}>
        <ShieldCheck color="#73c441" size={44} />
        <Text style={{ color: "#f7f4ea", fontSize: 36, fontWeight: "900", marginTop: 18 }}>SignalKite</Text>
        <Text style={{ color: "#c8cabd", fontSize: 16, lineHeight: 24, marginTop: 8 }}>
          A read-only signal layer for your Zerodha Kite portfolio.
        </Text>
        <Text style={{ color: "#8f9288", fontSize: 12, lineHeight: 18, marginTop: 14 }}>
          Research and alerts only. Not investment advice. Verify every trade and risk before placing orders.
        </Text>
      </View>
      <TouchableOpacity
        onPress={connectWithZerodha}
        disabled={checkingConnection}
        style={{ backgroundColor: "#73c441", borderRadius: 8, paddingVertical: 16, alignItems: "center" }}
      >
        <Text style={{ color: "#10210f", fontWeight: "900", fontSize: 16 }}>
          {checkingConnection ? "Checking Zerodha..." : "Connect with Zerodha"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.replace("Main")}
        style={{ borderColor: "#4d5148", borderWidth: 1, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 }}
      >
        <Text style={{ color: "#f7f4ea", fontWeight: "800" }}>Preview with sample portfolio</Text>
      </TouchableOpacity>
    </View>
  );
}
