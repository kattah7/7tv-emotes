### What is this?

The purpose for this is track 7tv emote usage.

### API

```
GET https://api.kattah.me/c/xqc
GET https://api.kattah.me/c/xqc?limit=10

GET https://api.kattah.me/global
GET https://api.kattah.me/top
```

### Websocket

```
wss://stats-ws.kattah.me

You will have 30 seconds to send a message to the server, otherwise the connection will be closed.
```

```
{
  "type": "subscribe",
  "channel": "all" <-- listening to all channels
}
```

```
{
  "type": "unsubscribe",
  "channel": "all" <-- listening to all channels
}
```

```
{
  "type": "subscribe",
  "channel": "71092938" <-- xQc's channel id
}
```

```
{
  "type": "unsubscribe",
  "channel": "71092938" <-- xQc's channel id
}
```
