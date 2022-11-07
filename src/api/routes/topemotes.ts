import express from 'express';
import { Emote } from '../../utility/db';
const router = express.Router();

let dataMapped = [];
let channels = 0;
setInterval(async () => {
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
            usage: (emote.usage as number) || 0,
        };
    });

    dataMapped = emotesMapped;
    channels = await Emote.countDocuments();
}, 1000 * 60 * 1);

router.get('/top', async (req, res) => {
    return res.status(200).json({
        success: true,
        channels: channels,
        data: dataMapped,
    });
});

export default router;
