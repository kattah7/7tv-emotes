import pkg from 'pg';
import { GetChannels } from '../services/SevenTV.js';
import type { NewEmote, UpdateEmote } from '../types/types.js';
import type { IEmote, IChannels } from '../types/index.js';

interface IPool extends pkg.Pool {}

export class Postgres {
	private static _instance: Postgres;
	private _pool: IPool;

	private constructor() {
		this._pool = new pkg.Pool({
			...Bot.Config.Postgres,
		});

		this._pool.on('error', (err) => {
			Bot.Logger.Error(err);
		});
	}

	static New(): Postgres {
		if (!this._instance) {
			this._instance = new Postgres();
		}

		return this._instance;
	}

	async Query(query: string, values?: any[]): Promise<any> {
		return this._pool.query(query, values);
	}

	async End(): Promise<void> {
		await this._pool.end();
	}

	static async Setup(): Promise<void> {
		const client = new pkg.Pool({
			password: Bot.Config.Postgres.password,
			user: Bot.Config.Postgres.user,
			host: Bot.Config.Postgres.host,
			port: Bot.Config.Postgres.port,
		});

		const db = Bot.Config.Postgres.database;
		const checkDbQuery = `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${db}'`;
		const res = await client.query(checkDbQuery);

		if (res.rowCount === 0) {
			Bot.Logger.Warn(`Database ${db} does not exist, creating...`);
			const createDbQuery = `CREATE DATABASE ${db}`;
			await client.query(createDbQuery);

			Bot.Logger.Log(`Database ${db} created`);
		}

		await client.end();
	}

	async CreateTables(): Promise<void> {
		await this.Query(`CREATE TABLE IF NOT EXISTS channels (
			id SERIAL PRIMARY KEY,
			twitch_username TEXT NOT NULL,
			twitch_id VARCHAR(30) NOT NULL UNIQUE,
			stv_id VARCHAR(30) NOT NULL UNIQUE,
			tracking_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
			tracking BOOLEAN DEFAULT TRUE NOT NULL
		)`);

		await this.Query(`CREATE TABLE IF NOT EXISTS emotes (
			twitch_id VARCHAR(30) NOT NULL,
			emote TEXT NOT NULL,
			emote_id TEXT NOT NULL,
			emote_count INTEGER DEFAULT 0 NOT NULL,
			added TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
			UNIQUE (twitch_id, emote_id),
			FOREIGN KEY (twitch_id) REFERENCES channels(twitch_id) ON DELETE CASCADE
		)`);
	}

	async NewEmote(twitch_id: string, twitch_name: string, emote: NewEmote): Promise<void> {
		await this.Query(
			`INSERT INTO emotes (twitch_id, emote, emote_id) 
			 VALUES ($1, $2, $3)`,
			[twitch_id, emote.name, emote.id],
		);

		Bot.Logger.Debug(`New Emote ${emote.name} added to ${twitch_name}`);
	}

	async UpdateEmote(emotes: UpdateEmote): Promise<void> {
		const { dbEmote, name, id, channelId, channelName } = emotes;
		await Bot.SQL.Query(
			`INSERT INTO emotes (twitch_id, emote, emote_id)
			     VALUES ($1, $2, $3)
			     ON CONFLICT (twitch_id, emote_id)
			     DO UPDATE SET emote = $2 WHERE emotes.emote != $2`,
			[channelId, name, id],
		);

		Bot.Logger.Debug(`Emote name changed ${dbEmote} -> ${name} in ${channelName}`);
	}

	async EmoteLooper(emoteList: IEmote[], twitch_id: string, twitch_username: string): Promise<void> {
		Bot.Logger.Warn(`Updating emotes for ${twitch_username}...`);

		for (const emoteInfo of emoteList) {
			const getEmote = await Bot.SQL.Query(`SELECT emote, emote_id FROM emotes WHERE twitch_id = $1 AND emote_id = $2`, [
				twitch_id,
				emoteInfo.id,
			]);

			if (getEmote.rowCount === 0) {
				await this.NewEmote(twitch_id, twitch_username, { name: emoteInfo.name, id: emoteInfo.id });
				continue;
			}

			const { emote, emote_id } = getEmote.rows[0];
			if (emote === emoteInfo.name && emote_id === emoteInfo.id) continue;

			const Payload = {
				dbEmote: emote,
				name: emoteInfo.name,
				id: emoteInfo.id,
				channelId: twitch_id,
				channelName: twitch_username,
			};

			await this.UpdateEmote(Payload);
		}

		Bot.Logger.Log(`Updated emotes for ${twitch_username}`);
	}

	async GetChannelsArray(): Promise<IChannels> {
		const Channels = await this.Query('SELECT array_agg(stv_id) as stv_ids FROM channels');
		const { stv_ids } = Channels.rows[0];
		const result = await GetChannels(stv_ids);

		return {
			result,
			length: stv_ids.length,
		};
	}
}
