export function connectPrices(onMessage: (tick: { tradingsymbol: string; last_price: number }) => void) {
  const url = process.env.EXPO_PUBLIC_WS_URL;
  if (!url) {
    return () => undefined;
  }

  const socket = new WebSocket(url);
  socket.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };
  return () => socket.close();
}
