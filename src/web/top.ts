import express from 'express';
const router = express.Router();
import { getTopEmotes } from './bot';

router.get('/api/bot/top', async (req: any, res: any) => {
    const r = await getTopEmotes();
    if (!r.success) {
        return res.json({
            success: false,
        });
    }

    return res.json(r);
});

export default router;
