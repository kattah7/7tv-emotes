import Redis from 'ioredis';

export class RedisClient {
	private static _instance: RedisClient;
	private _client: Redis;

	private constructor() {
		this._client = new Redis({});

		this._client.on('error', (err) => {
			console.log(err);
		});

		this._client.on('connect', () => {
			Bot.Logger.Log('Connected to Redis');
		});
	}

	static New(): RedisClient {
		if (!this._instance) {
			this._instance = new RedisClient();
		}

		return this._instance;
	}

	async set(key: string, value: string): Promise<void> {
		await this._client.set(key, value);
	}

	async setArray(key: string, value: string[]): Promise<void> {
		await this._client.set(key, JSON.stringify(value));
	}

	async get(key: string): Promise<string | null> {
		const value = await this._client.get(key);
		if (!value) return null;

		return value;
	}

	async getArray(key: string): Promise<string[] | null> {
		const value = await this._client.get(key);
		if (!value) return null;

		return JSON.parse(value);
	}

	async getKeys(pattern: string): Promise<string[]> {
		const keys = await this._client.keys(pattern);
		return keys;
	}

	async del(key: string): Promise<void> {
		await this._client.del(key);
	}

	async delAll(): Promise<void> {
		const channels = await this.getKeys('emotes:*');
		for (const channel of channels) {
			await this.del(channel);
		}
	}
}
