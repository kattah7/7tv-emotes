# 7TV Emote Tracker

### What is this?
The purpose for this is to mainly track 7tv emote usage.  

### Commands
Only bot admins can run commands  
  
- `!log "channel"` will log the channel's emotes

### API
https://api.kattah.me/c/:user Getting channel info  
https://api.kattah.me/top Getting top emotes of all tracked channels  
https://api.kattah.me/global  Getting most used Global emotes  

### Ratelimit  
Ratelimit: rate=1r/s burst=3  

### Websocket
Connect to `wss://stats-ws.kattah.me` and pass in this query to get started.
```
{
    "type": "listen",
    "data": { 
        "room": "global:top" 
    }
}
```
You will be greeted with
```
{
    "type": "response",
    "data": "You are now connected to global:top"
}
```


For specific channels pass in a channel name
```
{
    "type": "listen",
    "data": { 
        "room": "kattah" 
    }
}
```
You will be greeted with
```
{
    "type": "response",
    "data": "You are now connected to 137199626"
}
```

Connect to `wss://global-ws.kattah.me` and pass in this query to get started.
```
{
    "type": "listen",
    "data":{
        "room": "global"
    }
}
```
You will be greeted with
```
{
    "type": "Your websocket key",
    "data": "Welcome, enjoy your stay :)"
}
```

### Config
```
{
    "bot": {
        "username": "justinfan12312", // bot name. justinfan for anonymous
        "admin": "kattah",
        "prefix": "!", // prefix of the bot
        "token": "cum",
        "channel": "kattah", // test channel to join
        "api": {
            "public": 5000, // port for API
            "internal": 6969 // port for interal API
        },
        "socket": {
            "host": "ws://localhost:8080", // host for top and channel websocket
            "port": 8080, // port for the host above
            "global": {
                "host": "ws://localhost:7500" // for this, you would have to make a bot that joins millions of channels and make a websocket on that bot that connects to this. replace with wss://global-ws.kattah.me if you dont have one
            }
        },ebsocket on that bot that connects to this.
        "mongo": "mongodb://127.0.0.1:27017/stv"
    },
    "web": {
        "port": 6700, // port for website
        "clientID": "xddddddddddddd", // get your client id from here dev.twitch.tv/console
        "twitchSecret": "xddddddddddddddddd", // get your secret from here dev.twitch.tv/console
        "sessionSecret": "random generated characters",
        "callbackURL": "http://localhost:6700/auth/twitch/callback"  // put this inside dev.twitch.tv/console, localhost for testing.
    }
}
```

### Development

This repo requires [Yarn](https://classic.yarnpkg.com/), [Node](https://nodejs.org/en/download/) and [MongoDB](https://www.mongodb.com/try/download/community)

Run `git clone`

Run `cd 7tv-emotes`

Rename `example.config.json to config.json` and follow the instructions above.

Run `yarn` to install the packages.

Run `yarn build && node .` This will build the typescript files into javascript and run it with node.

Run `yarn web` on a another terminal to start the website.

Type `!log "channel"` to log channels.
  
For questions always ask me on twitch [@Kattah](https://twitch.tv/kattah)

