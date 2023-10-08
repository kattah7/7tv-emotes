# Setting up Config

This is configured using a config file. The config file is a JSON file that contains the following fields:

<h5 a><strong><code>config.json</code></strong></h5>

```
{	
	"Postgres": {
		"password": "", <-- Put your password here
		"user": "postgres",
		"host": "localhost",
		"port": 5432,
		"database": "emotes"
	},
	"Twitch": {
		"username": "justinfan69696", <-- Anon connection
		"oauth": "nothing",
		"clientId": "nothing",
		"clientSecret": "nothing"
	},
	"DEBUG": false, <-- Set to true to enable debug logging
	"API": {
		"port": 5001 <-- Port to run the API on
	},
	"WS": {
		"port": 9100 <-- Port to run the websocket on
	},
	"Admins": [
		"88492428",
		"475748597"
	]
}
```
