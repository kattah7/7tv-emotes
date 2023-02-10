import Express from 'express';
import { Limiter } from '../../Middleware/RateLimit.js';
import fetch from 'node-fetch';
const Router = Express.Router();

interface ApiResponse {
	success: boolean;
	logging_channels: number;
	emotes: Emotes[];
}

type Emotes = {
	emote: string;
	emote_id: string;
	count: number;
	date: string;
};

Router.get('/global', Limiter(1000, 5), async (req, res) => {
	const response = (await fetch(`http://localhost:5002/global`, {
		method: 'GET',
	}).then((res) => res.json())) as ApiResponse;
	if (!response) return;

	const mapped = response.emotes.map((emote: Emotes) => {
		return {
			emote: emote.emote,
			emote_id: emote.emote_id,
			total_count: emote.count,
			tracking: emote.date,
		};
	});

	return res.status(200).json({
		success: true,
		channels: response.logging_channels,
		emotes: mapped,
	});
});

export default Router;
