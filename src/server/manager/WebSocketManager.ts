import WebSocket from 'ws';

interface IMessage {
	type: string;
	channel: string;
}

export class WebsocketServer {
	private _clients = new Map<WebSocket, string[]>();
	/**
	 * @description The time in ms before the socket closes
	 * if no message is received
	 */
	private timer: number = 1000 * 30;

	constructor(port: number) {
		const WSS = new WebSocket.Server({ port });
		Bot.Logger.Log(`Websocket listening on port ${port}`);

		WSS.on('connection', (web: WebSocket, req: any) => {
			web.on('message', (message: any) => {
				clearTimeout(timeout);
				this.SocketMessageHandler(web, message);
			});

			const timeout = setTimeout(() => {
				if (web.readyState === WebSocket.OPEN) {
					web.close();
				}
			}, this.timer);

			this.SendTo(web, {
				type: 'welcome',
				message: 'You are in a maze of twisty Poros, all alike. You have 30 seconds to send back a message.',
			});
		});
	}

	private async SocketMessageHandler(web: WebSocket, message: any): Promise<void> {
		let data: IMessage;
		try {
			data = JSON.parse(message);
		} catch (err) {
			this.Unknown(web, 'invalid-json');
			return;
		}

		const { type, channel } = data;

		if (!type || !channel) {
			this.Unknown(web, 'no-type-or-channel');
			return;
		}

		const findChannel = await Bot.Redis.get(`emotes:${channel}`);
		if (!findChannel && channel !== 'all') {
			this.InvalidChannel(web, channel);
			return;
		}

		if (!this._clients.has(web)) {
			this._clients.set(web, []);
		}

		switch (type) {
			case 'subscribe':
				this.AddClientChannel(web, channel);
				break;
			case 'unsubscribe':
				this.RemoveClientChannel(web, channel);
				break;
			default:
				this.Unknown(web, type);
				break;
		}
	}

	private InvalidChannel(web: WebSocket, channel: string): void {
		this.SendTo(web, {
			type: 'invalid-channel',
			channel,
		});
	}

	private Unknown(web: WebSocket, command: string): void {
		this.SendTo(web, {
			type: 'unknown-type',
			command,
		});
	}

	private AlreadySubscribed(web: WebSocket, channel: string): void {
		this.SendTo(web, {
			type: 'already-subscribed',
			channel,
		});
	}

	private NotSubscribed(web: WebSocket, channel: string): void {
		this.SendTo(web, {
			type: 'not-subscribed',
			channel,
		});
	}

	private Subscribed(web: WebSocket, channel: string): void {
		this.SendTo(web, {
			type: 'subscribed',
			channel,
		});
	}

	private Unsubscribed(web: WebSocket, channel: string): void {
		this.SendTo(web, {
			type: 'unsubscribed',
			channel,
		});
	}

	public Send(channel: string, data: any): void {
		for (const [web, channels] of this._clients) {
			if (channels.includes(channel)) {
				web.send(JSON.stringify(data));
			}

			if (channels.includes('all')) {
				web.send(JSON.stringify(data));
			}
		}
	}

	public SendTo(web: WebSocket, data: any): void {
		web.send(JSON.stringify(data));
	}

	public GetClients(): Map<WebSocket, string[]> {
		return this._clients;
	}

	public GetClientChannels(web: WebSocket): string[] {
		return this._clients.get(web) || [];
	}

	public RemoveClient(web: WebSocket): void {
		this._clients.delete(web);
	}

	public AddClientChannel(web: WebSocket, channel: string): void {
		const Channels = this.GetClientChannels(web);
		if (Channels.includes(channel)) return this.AlreadySubscribed(web, channel);

		Channels.push(channel);
		this._clients.set(web, Channels);
		this.Subscribed(web, channel);

		Bot.Logger.Log(`Websocket subscribed to ${channel}`);
	}

	public RemoveClientChannel(web: WebSocket, channel: string): void {
		const Channels = this.GetClientChannels(web);
		if (Channels.length === 0) {
			this.RemoveClient(web);
			return this.NotSubscribed(web, channel);
		}

		const index = Channels.indexOf(channel);
		if (index > -1) {
			Channels.splice(index, 1);
		}
		this._clients.set(web, Channels);
		this.Unsubscribed(web, channel);

		Bot.Logger.Log(`Websocket unsubscribed from ${channel}`);
	}

	public RemoveClientChannels(web: WebSocket, channels: string[]): void {
		const Channels = this._clients.get(web) || [];
		for (const channel of channels) {
			const index = Channels.indexOf(channel);
			if (index > -1) {
				Channels.splice(index, 1);
			}
		}
		this._clients.set(web, Channels);
	}

	public Close(): void {
		for (const [web] of this._clients) {
			web.close();
		}
	}
}
