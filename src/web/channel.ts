import express from 'express';
const router = express.Router();
import { getChannelEmotes } from './bot';

router.get('/api/bot/info', async (req: any, res: any) => {
    const { channel } = req.query;

    const r = await getChannelEmotes(channel.toLowerCase());
    if (!r.success) {
        return res.json({
            success: false,
        });
    }

    return res.json(r);
});

export default router;
