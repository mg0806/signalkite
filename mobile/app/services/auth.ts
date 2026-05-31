import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { apiBaseUrl } from "./config";

const TOKEN_KEY = "signalkite_access_token";

export async function getAccessToken() {
  if (Platform.OS === "web") {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAccessToken(token: string) {
  if (Platform.OS === "web") {
    window.localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAccessToken() {
  if (Platform.OS === "web") {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function refreshAccessToken() {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }
  const response = await fetch(`${apiBaseUrl()}/auth/kite/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  if (payload.access_token) {
    await setAccessToken(payload.access_token);
    return payload.access_token as string;
  }
  return null;
}

export async function logoutSession() {
  const token = await getAccessToken();
  if (token) {
    await fetch(`${apiBaseUrl()}/auth/kite/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => undefined);
  }
  await clearAccessToken();
}
