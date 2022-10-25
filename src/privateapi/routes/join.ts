import express from 'express';
import { client } from '../../utility/connections';
import { Emote, Channels } from '../../utility/db';
import { StvInfo } from '../../utility/parseUID';
import { channelEmotes } from '../../utility/channelEmotes';
const router = express.Router();

router.post('/bot/join/:username/:userid', async (req: { query: any; params: any }, res: { status: any }) => {
    async function saveChannels(username: string, userID: string, stvID: string, emotes: any) {
        await new Channels({
            name: username,
            id: userID,
            Date: Date.now(),
        }).save();

        const emoteDB = await Emote.findOne({ id: userID });
        if (!emoteDB) {
            await new Emote({
                name: username,
                id: userID,
                StvId: stvID,
                emotes: emotes,
            }).save();
        }
        return;
    }

    const { username, userid } = req.params;
    if (!userid) {
        return res.status(400).json({
            success: false,
            message: 'malformed username parameter',
        });
    }

    const STV = await StvInfo(userid);
    if (STV.error) {
        return res.status(400).json({
            success: false,
            message: STV.error,
        });
    }

    const channel = await Channels.findOne({ id: userid });

    const { user, emote_set } = STV;
    if (!channel) {
        try {
            const channelEmote = await channelEmotes(userid);
            await saveChannels(username, userid, user.id, channelEmote);
            client.join(username);
            return res.status(200).json({
                success: true,
                message: `Joined ${username}`,
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err,
            });
        }
    }

    const { name } = channel;
    if (username != name) {
        client.part(name);
        await Channels.updateOne({ id: userid }, { name: username });
        await Emote.updateOne({ id: userid }, { name: username });
        await client.join(username);
        return res.status(400).json({
            success: false,
            message: 'name change detected',
        });
    }

    return res.status(409).json({
        success: false,
        message: 'Already joined',
    });
});

export default router;
