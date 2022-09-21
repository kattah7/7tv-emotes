import express from 'express';
import { client } from '../../client/twitch';
import { Emote, Channels } from '../../utility/db';
import { UserInfo, StvInfo } from '../../utility/parseUID';
import { channelEmotes } from '../../utility/channelEmotes';
import { WS } from '../../utility/stv';
const router = express.Router();

router.post('/bot/join', async (req: any, res: any) => {
    const { username } = req.query;
    if (!username || !/^[A-Z_\d]{2,28}$/i.test(username)) {
        return res.status(400).json({
            success: false,
            message: 'malformed username parameter',
        });
    }

    const ID = (await UserInfo(username))[0].id;
    const STV = await StvInfo(ID);
    if (STV.error) {
        return res.status(400).json({
            success: false,
            message: STV.error,
        });
    }

    const channel = await Channels.findOne({ name: username });
    if (!channel) {
        try {
            const newChannel = new Channels({
                name: username,
                id: (await UserInfo(username))[0].id,
                Date: Date.now(),
            });
            await newChannel.save();
            const emoteDB = await Emote.findOne({ id: (await UserInfo(username))[0].id });
            if (!emoteDB) {
                const channelEmote = await channelEmotes((await UserInfo(username))[0].id);
                const newEmote = new Emote({
                    name: username,
                    id: (await UserInfo(username))[0].id,
                    StvId: (await StvInfo((await UserInfo(username))[0].id)).user.id,
                    emotes: channelEmote,
                });
                await newEmote.save();
            }
            const sendWSJSONStringyToSTV = {
                op: 35,
                d: {
                    type: 'emote_set.update',
                    condition: {
                        object_id: (await StvInfo((await UserInfo(username))[0].id)).user.id,
                    },
                },
            };
            WS.send(JSON.stringify(sendWSJSONStringyToSTV));
            await client.join(username);
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

    return res.status(409).json({
        success: false,
        message: 'Already joined',
    });
});

export default router;
