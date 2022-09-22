import express from 'express';
import { Emote } from '../../utility/db';
const router = express.Router();

router.get('/c/:user', async (req, res) => {
    const { user } = req.params;
    if (!user || !/^[A-Z_\d]{2,27}$/i.test(user)) {
        return res.status(400).json({
            success: false,
            message: 'malformed username parameter',
        });
    }

    const channelEmotes = await Emote.findOne({ name: user });
    if (!channelEmotes) {
        return res.status(404).json({
            success: false,
            message: 'user not found',
        });
    }

    const emotesMapped = channelEmotes.emotes.map((emote: any) => {
        return {
            name: emote.name,
            emote: emote.emote,
            usage: emote.usage,
            isEmote: emote.isEmote,
            Date: emote.Date,
        };
    });

    const filterEmotesByTrue = emotesMapped.filter((emote: any) => emote.isEmote === true);
    const mapByTopUsage = filterEmotesByTrue.sort((a, b) => b.usage - a.usage);

    return res.status(200).json({
        success: true,
        data: mapByTopUsage,
    });
});

export default router;
