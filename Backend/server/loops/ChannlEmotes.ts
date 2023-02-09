import { ChannelEmoteManager } from '../manager/ChannlEmoteManager.js';

const THIRTY_MINUTES = 1000 * 60 * 30;

export function Looper(): void {
	setInterval(async () => {
		const { result, length } = await Bot.SQL.GetChannelsArray();

		let perfomanceTime: number = performance.now();
		let { count } = await ChannelEmoteManager(result);
		let tookTime = performance.now() - perfomanceTime;

		Bot.Logger.Log(`Looped!, Emotes updated for ${count}/${length} channels, took ${tookTime}ms`);
	}, THIRTY_MINUTES);
}
