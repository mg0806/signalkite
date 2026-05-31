import Constants from "expo-constants";
import { Platform } from "react-native";

const DEV_LAN_API_URL = "http://192.168.1.2:8000";

function expoHost(): string | undefined {
  const manifest = Constants.manifest as { debuggerHost?: string } | null;
  const manifest2 = Constants.manifest2 as
    | { extra?: { expoGo?: { debuggerHost?: string } } }
    | null;

  const hostUri =
    Constants.expoConfig?.hostUri ??
    manifest?.debuggerHost ??
    manifest2?.extra?.expoGo?.debuggerHost;

  return hostUri?.split(":")[0];
}

export function apiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const host = expoHost();
  if (host && host !== "127.0.0.1" && host !== "localhost") {
    return `http://${host}:8000`;
  }

  return Platform.OS === "web" ? "http://localhost:8000" : DEV_LAN_API_URL;
}
