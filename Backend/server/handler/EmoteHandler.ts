import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';

export async function EmoteHandler(msg: PrivmsgMessage): Promise<void> {
	const get = await Bot.Redis.getArray(`emotes:${msg.channelID}`);
	const knownEmotes = new Set(get);
	const emotesUsedByNames: Record<string, number> = {};

	for (const word of msg.messageText.split(/\s/g)) {
		if (knownEmotes.has(word)) {
			if (!(word in emotesUsedByNames)) {
				emotesUsedByNames[word] = 1;
				continue;
			}

			emotesUsedByNames[word]++;
		}
	}

	if (Object.entries(emotesUsedByNames).length > 0) {
		for (const [emote, count] of Object.entries(emotesUsedByNames)) {
			await Bot.SQL.Query(`UPDATE emotes SET emote_count = emotes.emote_count + $1 WHERE emotes.emote = $2 AND emotes.twitch_id = $3`, [
				count,
				emote,
				msg.channelID,
			]);

			Bot.WS.Send(msg.channelID, {
				type: 'emote',
				channelName: msg.channelName,
				channelId: msg.channelID,
				senderName: msg.senderUsername,
				senderId: msg.senderUserID,
				data: {
					emote,
					count,
				},
			});

			Bot.Logger.Debug(`Emote ${emote} used ${count} times in ${msg.channelName}`);
			Bot.Logger.Debug(`${process.memoryUsage().rss / 1024 / 1024} MB, ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
		}
	}
}
