import 'reflect-metadata';
import { ChatClient as TwitchIRC, ConnectionPool } from '@kararty/dank-twitch-irc';
import { singleton } from 'tsyringe';
import { EmoteHandler } from '../handler/EmoteHandler.js';
import { CommandHandler } from '../handler/CommandHandler.js';

@singleton()
export class ChatClient extends TwitchIRC {
	constructor() {
		super({
			username: Bot.Config.Twitch.username,
			password: Bot.Config.Twitch.oauth,
			rateLimits: 'verifiedBot',
			ignoreUnhandledPromiseRejections: true,
			connectionRateLimits: {
				parallelConnections: 5,
				releaseTime: 1000,
			},
			connection: {
				type: 'websocket',
				secure: true,
			},
		});

		// this.use(new ConnectionPool(this, { poolSize: 100 }));

		this.connect();

		this.on('error', (err) => {
			Bot.Logger.Error(err);
		});

		this.on('close', (err) => {
			if (err !== null) {
				Bot.Logger.Error(`Connection closed with error: ${err}`);
			}
		});

		this.on('connecting', () => {
			Bot.Logger.Silly('Connecting to Twitch');
		});

		this.on('ready', () => {
			Bot.Logger.Log('Connected to Twitch');
		});

		this.on('JOIN', ({ channelName }) => {
			Bot.Logger.Log(`Joined ${channelName}`);
		});

		this.on('PART', ({ channelName }) => {
			Bot.Logger.Warn(`Parted ${channelName}`);
		});

		this.on('PRIVMSG', (msg) => {
			EmoteHandler(msg);
			CommandHandler(msg);
		});
	}

	Join(channel: string): void {
		this.join(channel);
	}

	async Part(channel: string): Promise<void> {
		await this.part(channel);
	}

	async JoinAll(channels: string[]): Promise<void> {
		await this.joinAll(channels);
	}
}
