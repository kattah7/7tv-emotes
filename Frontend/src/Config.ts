export const DEBUG = process.env.NODE_ENV === "development";
export const SOCKET_URL = DEBUG
  ? "ws://localhost:5002/"
  : "wss://stats-ws.kattah.me/";

export const TOP_API_URL = DEBUG
  ? "http://localhost:5001/top"
  : "https://api.kattah.me/top";

export const GLOBAL_API_URL = DEBUG
  ? "http://localhost:5001/global"
  : "https://api.kattah.me/global";

export const CHANNEL_API_URL = DEBUG
  ? "http://localhost:5001/c"
  : "https://api.kattah.me/c";
