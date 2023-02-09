import Express from 'express';
import { Limiter } from '../../Middleware/RateLimit.js';
import fetch from 'node-fetch';
const Router = Express.Router();

interface ApiResponse {
	success: boolean;
	data: any;
}

Router.get('/global', Limiter(1000, 5), async (req, res) => {
	const response = (await fetch(`https://api.kattah.me/global`, {
		method: 'GET',
	}).then((res) => res.json())) as ApiResponse;
	if (!response.success) return;

	const mapped = response.data.global.map((emote: any) => {
		return {
			emote: emote.name,
			emote_id: emote.emote,
			total_count: emote.usage,
		};
	});

	return res.status(200).json({
		success: true,
		emotes: mapped,
	});
});

export default Router;
