import Express from 'express';
import { Limiter } from '../../Middleware/RateLimit.js';
const Router = Express.Router();

type Emote = {
	emote: string;
	emote_alias: string | null;
	emote_id: string;
	emote_count: number;
	added: Date;
};

Router.get('/c/:username', Limiter(1000, 10), async (req, res) => {
	let { username } = req.params;
	const limit = req.query.limit || 100;
	username = username.toLowerCase();

	const channelData = await Bot.SQL.Query(`SELECT * FROM channels WHERE twitch_username = $1`, [username]);
	const channelEmotes = await Bot.SQL.Query(
		`SELECT emotes.* 
		 FROM emotes 
	     INNER JOIN channels 
	     ON channels.twitch_id = emotes.twitch_id 
	     WHERE channels.twitch_username = $1
		 ORDER BY emotes.emote_count DESC`,
		[username],
	);

	if (channelEmotes.rowCount === 0 || channelData.rowCount === 0) {
		return res.status(404).json({
			success: false,
			message: 'No emotes found for this channel',
		});
	}

	const emotes = channelEmotes.rows.map((emote: Emote) => {
		return {
			emote: emote.emote,
			emote_alias: emote.emote_alias,
			emote_id: emote.emote_id,
			count: emote.emote_count,
			added: emote.added,
		};
	});

	return res.status(200).json({
		success: true,
		user: {
			...channelData.rows[0],
		},
		emotes: emotes.slice(0, limit),
	});
});

export default Router;
