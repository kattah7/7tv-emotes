import Express from 'express';
import { Limiter } from '../../Middleware/RateLimit.js';
const Router = Express.Router();

Router.get('/top', Limiter(1000, 5), async (req, res) => {
	try {
		const topEmotes = await Bot.SQL.Query(`
            SELECT emotes.emote, emotes.emote_id, 
            CAST(SUM(emotes.emote_count) as INTEGER) as total_count
            FROM emotes
            GROUP BY emotes.emote_id, emotes.emote
            ORDER BY total_count DESC
            LIMIT 100
        `);

		return res.status(200).json({
			success: true,
			emotes: topEmotes.rows,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: 'Internal Server Error',
		});
	}
});

export default Router;
