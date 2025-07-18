export function createWebSocket() {
  if (typeof window === "undefined") {
    return null;
  }
  return new WebSocket("ws://dcudashboard.local:81");
}
