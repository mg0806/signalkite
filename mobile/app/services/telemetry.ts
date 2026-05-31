export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
    // Sentry can be enabled here with @sentry/react-native once the project DSN is available.
  }
  console.warn("captured_exception", { error, context });
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  console.log("analytics_event", { name, properties });
}
