const DEFAULT_API_URL = "https://signalkite-api.onrender.com";

export function apiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  return DEFAULT_API_URL;
}
