### What is this?

The purpose for this is track 7TV emote usage.

## Setting up Config

This is configured using a config file. Duplicate the `config_template.json` file and rename it to `config.json`, then replace the necessary values.

<strong><code>config_template.json</code></strong> -> <strong><code>config.json</code></strong>

### API

```
GET https://7tv.markzynk.com/c/xqc
GET https://7tv.markzynk.com/c/xqc?limit=10

GET https://7tv.markzynk.com/global
GET https://7tv.markzynk.com/top
```

### Websocket

```
wss://7tv-ws.markzynk.com

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
