import express from 'express';
import { Emote } from '../../utility/db';
const router = express.Router();

router.get('/top', async (req, res) => {
    const allEmotes = await Emote.find();
    const PushAllEmotes = [];
    allEmotes.forEach((emote: any) => {
        emote.emotes.forEach((emote: any) => {
            PushAllEmotes.push(emote);
        });
    });
    const sortedEmotes = PushAllEmotes.sort((a: any, b: any) => b.usage - a.usage);
    const topEmotes = sortedEmotes.slice(0, 25);
    const ifEmoteIdIsSameCombine = [];
    topEmotes.forEach((emote: any) => {
        const doesEmoteExist = ifEmoteIdIsSameCombine.find((emote2: any) => emote2.emote === emote.emote);
        if (!doesEmoteExist) {
            ifEmoteIdIsSameCombine.push(emote);
        } else {
            doesEmoteExist.usage += parseInt(emote.usage);
        }
    });
    const emotesMapped = ifEmoteIdIsSameCombine.map((emote: any) => {
        return {
            name: emote.name,
            emote: emote.emote,
            usage: emote.usage,
        };
    });

    return res.status(200).json({
        success: true,
        channels: await Emote.countDocuments(),
        data: emotesMapped,
    });
});

export default router;
