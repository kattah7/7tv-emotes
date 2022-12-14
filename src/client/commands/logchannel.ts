import { UserInfo, StvInfo } from '../../utility/parseUID';
import { Channels, Emote } from '../../utility/db';
import { channelEmotes } from '../../utility/channelEmotes';

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
                    StvId: stvID,
                    emotes: emotes,
                }).save();
            }
            return;
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

        const { error, emote_set, user } = await StvInfo(id);
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
            await saveChannels(username, id, user.id, emotes);
            client.join(username);
            return;
        } catch (e) {
            return {
                error: e,
            };
        }
    },
};
