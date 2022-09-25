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

    const emotesMapped = channelEmotes.emotes.map(
        (emote: { name: string; emote: string; usage: number; isEmote: boolean; Date: number }) => {
            return {
                name: emote.name,
                emote: emote.emote,
                usage: emote.usage,
                isEmote: emote.isEmote,
                Date: emote.Date,
            };
        }
    );

    const filterEmotesByTrue = emotesMapped.filter((emote: { isEmote: boolean }) => emote.isEmote === true);
    const mapByTopUsage = filterEmotesByTrue.sort((a, b: { usage: number }) => b.usage - a.usage);
    const sliceHundred = mapByTopUsage.slice(0, 100);

    return res.status(200).json({
        success: true,
        data: sliceHundred,
    });
});

export default router;
