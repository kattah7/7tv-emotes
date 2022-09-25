import express from 'express';
import { Emote } from '../../utility/db';
const router = express.Router();

router.get('/top', async (req, res) => {
    const allEmotes = await Emote.find({});
    const PushAllEmotes = [];
    allEmotes.forEach((emote) => {
        emote.emotes.forEach(
            (emote: { name: string; emote: string; usage: number; isEmote: boolean; Date: number }) => {
                PushAllEmotes.push(emote);
            }
        );
    });
    const sortedEmotes = PushAllEmotes.sort((a, b: { usage: number }) => b.usage - a.usage);
    const topEmotes = sortedEmotes.slice(0, 25);
    const ifEmoteIdIsSameCombine = [];
    topEmotes.forEach((emote: { emote: string; usage: number }) => {
        const doesEmoteExist = ifEmoteIdIsSameCombine.find((emote2: { emote: string }) => emote2.emote === emote.emote);
        if (!doesEmoteExist) {
            ifEmoteIdIsSameCombine.push(emote);
        } else {
            doesEmoteExist.usage += Number(emote.usage);
        }
    });
    const emotesMapped = ifEmoteIdIsSameCombine.map((emote: { name: string; emote: string; usage: number }) => {
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
