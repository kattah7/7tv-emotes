import type { PrivmsgMessage } from '@kararty/dank-twitch-irc';

export async function EmoteHandler(msg: PrivmsgMessage): Promise<void> {
	const get = await Bot.Redis.getArray(`emotes:${msg.channelID}`);
	const emotesUsedByNames: Record<string, [string, string, string, number]> = {};

	for (const word of msg.split(/\s/g)) {
    	for (const emote of get) {
        	if (emote.name === word) {
            	if (!(word in emotesUsedByNames)) {
                	emotesUsedByNames[word] = [word, emote.alias, emote.id, 1];
                	continue;
            	}

            	emotesUsedByNames[word][3]++;
        	}
    	}
	}

	if (Object.entries(emotesUsedByNames).length > 0) {
		for (const [name, alias, id, count] of Object.entries(emotesUsedByNames)) {
			const emoteAlias = (name == alias) ? null : alias
			await Bot.SQL.Query(`UPDATE emotes SET emote_count = emotes.emote_count + $1 WHERE emotes.twitch_id = $2 AND emotes.emote_id = $3`, [
				count,
				msg.channelID,
				id,
			]);

			Bot.WS.Send(msg.channelID, {
				type: 'emote',
				channelName: msg.channelName,
				channelId: msg.channelID,
				senderName: msg.senderUsername,
				senderId: msg.senderUserID,
				data: {
					name,
					alias: emoteAlias,
					id,
					count,
				},
			});

			Bot.Logger.Debug(`Emote ${name} (${id}) used ${count} times in ${msg.channelName}`);
			Bot.Logger.Debug(`${process.memoryUsage().rss / 1024 / 1024} MB, ${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
		}
	}
}
