import express from 'express';
const router = express.Router();
import { getGlobalEmotes } from './bot';

router.get('/api/bot/global', async (req: any, res: any) => {
    const r = await getGlobalEmotes();
    if (!r.success) {
        return res.json({
            success: false,
        });
    }

    return res.json(r);
});

export default router;
