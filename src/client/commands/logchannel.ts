import { UserInfo, StvInfo } from '../../utility/parseUID';
import { Channels, Emote } from '../../utility/db';
import { channelEmotes } from '../../utility/channelEmotes';
import { WS } from '../../utility/stv';

module.exports = {
    name: '7tvlog',
    description: 'Logs a channel to the database',
    usage: 'logchannel <channel>',
    aliases: ['log'],
    cooldown: 5000,
    async execute(msg: any, args: any, client: any, params: any) {
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
                    stvID: stvID,
                    emotes: emotes,
                }).save();
            }

            client.join(username);
            return;
        }

        async function sendWS(op: number, type: string, stvID: string) {
            WS.send(JSON.stringify({ op: op, d: { type: type, condition: { object_id: stvID } } }));
        }

        if (!args[0]) {
            return {
                warn: 'No channel specified',
            };
        }

        if (args[1]) {
            return {
                warn: 'Too many arguments',
            };
        }
        const username = args[0].toLowerCase();
        const { id } = (await UserInfo(username))[0];
        if (!id) {
            return {
                warn: 'User not found',
            };
        }

        const { error } = await StvInfo(id);
        if (error) {
            return {
                error: `7TV Error: ${error}`,
            };
        }

        const isInChannel = await Channels.findOne({ id: id });
        if (isInChannel) {
            return {
                warn: `Already in ${username}`,
            };
        }

        try {
            const emotes = await channelEmotes(id);
            await saveChannels(username, id, (await StvInfo(id)).user.id, emotes);
            sendWS(35, 'emote_set.update', (await StvInfo(id)).emote_set.id);
            sendWS(35, 'user.update', (await StvInfo(id)).user.id);
            return;
        } catch (e) {
            return {
                error: e,
            };
        }
    },
};
