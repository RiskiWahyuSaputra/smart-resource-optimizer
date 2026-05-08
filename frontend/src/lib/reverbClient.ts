import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Ensure Pusher is available on window for Echo if needed, 
// though Echo with 'reverb' broadcaster usually handles it.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Pusher = Pusher;
}

let echo: Echo | null = null;

export function getEchoClient(token: string): Echo {
  if (echo) return echo;

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const host = process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1";
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080);
  const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || "http";

  echo = new Echo({
    broadcaster: "reverb",

    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "local",

    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",

    authEndpoint: `${apiBase.replace(/\/api$/, "")}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },

    enabledTransports: ["ws", "wss"],
  });

  return echo;
}
