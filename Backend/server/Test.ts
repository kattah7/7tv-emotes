import { RedisClient } from './database/Redis.js';
import { Logger } from './utility/Logger.js';

// @ts-ignore
global.Bot = {};
// @ts-ignore
Bot.Logger = Logger.New();
// @ts-ignore
Bot.Redis = RedisClient.New();

(async () => {
	const channel = process.argv[2];
	// @ts-ignore
	const asd = await Bot.Redis.getArray(`emotes:${channel}`);
	console.log(asd, asd?.length);
	asd?.map(async (asd) => await testing(asd));
})();

async function testing(asd: string): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	console.log(asd);
}
