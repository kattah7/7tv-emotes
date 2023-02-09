import mongo from 'mongoose';

mongo.connect('mongodb://127.0.0.1:27017/stv', {});

mongo.connection.on('connected', () => {
	console.log('Connected to MongoDB');
});

export function getChannelsCollection(Collection: string) {
	return mongo.connection.collection(Collection);
}

export async function Transfer(): Promise<void> {
	const channels = await getChannelsCollection('emotes').find({}).toArray();
	let current: number = 0;
	let count: number = channels.length;

	for (const xd of channels) {
		await Bot.SQL.Query(`INSERT INTO channels (twitch_username, twitch_id, stv_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [xd.name, xd.id, xd.StvId]);
		Bot.Logger.Warn(`[${current++}/${count}] ${xd.name} (${xd.id})`);

		// for (const emote of xd.emotes) {
		// 	if (emote.name.includes('Emote Removed') || !emote.emote || typeof emote.usage !== 'number' || isNaN(emote.usage)) continue;

		// 	const Timestamp = emote.Date;
		// 	emote.Date = new Date(Timestamp);

		// 	const formatedDate = emote.Date.toISOString();
		// 	await Bot.SQL.Query(
		// 		`INSERT INTO emotes (twitch_id, emote, emote_id, emote_count, added)
		//   		 VALUES ($1, $2, $3, $4, $5)
		//   		 ON CONFLICT (twitch_id, emote_id)
		//   		 DO UPDATE SET emote = $2, emote_count = $4 WHERE emotes.emote != $2`,
		// 		[xd.id, emote.name, emote.emote, emote.usage, formatedDate],
		// 	);
		// }
	}
}
