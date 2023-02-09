import type { IEmoteSet } from '../types/index.js';
import type { IChannels } from '../types/types.js';

export async function ChannelEmoteManager(mapped: IEmoteSet[]): Promise<IChannels> {
	let count: number = 0;
	let channelsToJoin: string[] = [];

	for (const { id, username, emote_sets } of mapped) {
		if (!emote_sets || !emote_sets.emotes) {
			Bot.Logger.Warn(`7TV returned no emotes for ${username} (${id})`);
			continue;
		}

		const emotesListed = emote_sets.emotes.map((emote: { name: string }) => emote.name);

		if (emotesListed.length === 0) {
			Bot.Logger.Warn(`7TV returned no emotes for ${username} (${id})`);
			continue;
		}

		Bot.Logger.Debug(`${emotesListed.length} Emotes Loaded in ${username} (${id})`);
		await Bot.Redis.setArray(`emotes:${id}`, emotesListed);
		await Bot.SQL.EmoteLooper(emote_sets.emotes, id, username);

		channelsToJoin.push(username);
		count++;
	}

	return { count, channelsToJoin };
}
