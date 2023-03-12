import fs from 'fs';
import { Postgres } from './database/Postgres.js';
import { RedisClient } from './database/Redis.js';
import { Logger } from './utility/Logger.js';
import { ChatClient } from './twitch/ChatClient.js';
import { WebsocketServer } from './socket/WebSocket.js';
// import { EventAPI } from "./SevenTV/EventAPI.js";
import { Transfer } from './Transfer.js';
import { ChannelEmoteManager } from './manager/ChannlEmoteManager.js';
import { Looper } from './loops/ChannlEmotes.js';

// @ts-ignore
global.Bot = {};
// @ts-ignore
Bot.Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
// @ts-ignore
Bot.Logger = Logger.New();
// @ts-ignore
Bot.Twitch = new ChatClient();
// @ts-ignore
Bot.Redis = RedisClient.New();
// @ts-ignore
Bot.WS = new WebsocketServer(Bot.Config.WS.port);
/**
 * Disabled until i get gud
 * // @ts-ignore
 * Bot.EventAPI = EventAPI.New();
 */

(async () => {
	await Postgres.Setup();
	// @ts-ignore
	Bot.SQL = Postgres.New();
	await Bot.SQL.CreateTables();

	if (Bot.Config.TRANSFER) {
		await Transfer();
	}

	await import('./api/index.js');

	process.on('SIGINT', async () => {
		await Bot.Redis.delAll();
		Bot.Logger.Warn('Shutting down...');
		process.exit();
	});

	process.once('SIGUSR2', async () => {
		await Bot.Redis.delAll();
		Bot.Logger.Warn('Shutting down...');
		process.kill(process.pid, 'SIGUSR2');
	});

	const { result, length } = await Bot.SQL.GetChannelsArray();
	let perfomanceTime: number = performance.now();
	let { count, channelsToJoin } = await ChannelEmoteManager(result);

	for (const channel of channelsToJoin) {
		await new Promise((resolve) => setTimeout(resolve, 8));
		Bot.Twitch.Join(channel);
	}
	Bot.Twitch.Join('kattah');
	Bot.Twitch.Join('kpqy');

	let tookTime = performance.now() - perfomanceTime;
	Bot.Logger.Log(`Emotes updated for ${count}/${length} channels, took ${tookTime}ms`);

	Looper();
})();
