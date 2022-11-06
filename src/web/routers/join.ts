import express from 'express';
const router = express.Router();
import { joinChannel } from '../bot';

router.post('/api/bot/join', async (req: any, res: any) => {
    if (!req.session || !req.session.passport || !req.session.passport.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
        });
    }

    const { login, id } = req.session.passport.user.data[0];

    const r = await joinChannel(login, id);
    if (!r.success) {
        return res.json({
            success: false,
            message: r.message,
        });
    }

    return res.json({ success: true });
});

export default router;
