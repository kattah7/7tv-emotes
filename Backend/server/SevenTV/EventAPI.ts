import WebSocket from 'ws';
/**
 * I'll probably need to rewrite this, i've tried EventAPI in the past and it just seems a better option to use REST
import { EventHandler } from "../handler/EventHandler.js";

const STV_WS = "wss://events.7tv.io/v3";

export class EventAPI {
  private static _instance: EventAPI;
  private _ws!: WebSocket;

  private constructor() {
    this._ws = new WebSocket(STV_WS);

    this._ws.on("open", () => {
      Bot.Logger.Log("Connected to 7TV Event API");
    });

    this._ws.on("message", (data) => {
      EventHandler(data);
    });

    this._ws.on("error", (err) => {
      Bot.Logger.Error(err);
    });

    this._ws.on("close", () => {
      Bot.Logger.Warn("Disconnected from 7TV Event API");
    });
  }

  static New(): EventAPI {
    if (!this._instance) {
      this._instance = new EventAPI();
    }

    return this._instance;
  }

  public send(data: any) {
    this._ws.send(JSON.stringify(data));
  }
}
 */
