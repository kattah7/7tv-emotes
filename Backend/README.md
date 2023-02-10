# Setting up Config

The backend is configured using a config file. The config file is a JSON file that contains the following fields:

```
{
	"Postgres": {
		"password": "", <-- put your password here
		"user": "postgres",
		"host": "localhost",
		"port": 5432,
		"database": "emotes"
	},
	"Twitch": {
		"username": "justinfan69696", <-- anon connection
		"oauth": "asda1231",
		"clientId": "asd",
		"clientSecret": "asd"
	},
	"DEBUG": false, <-- set to true to enable debug logging
	"TRANSFER": false, <-- keep this to false unless you know what you're doing
	"API": {
		"port": 5001 <-- port to run the API on
	},
	"WS": {
		"port": 9100 <-- port to run the websocket on
	}
}
```
