import { ChatClient, AlternateMessageModifier, SlowModeRateLimiter } from '@kararty/dank-twitch-irc';
import { bot } from '../../config.json';
import { channelEmotes } from '../utility/channelEmotes';
import { Emote } from '../utility/db';
import { Channels } from '../utility/db';
import { UserInfo } from '../utility/parseUID';
import * as Logger from '../utility/logger';

const client = new ChatClient({
    username: bot.username,
    password: bot.token,
    rateLimits: 'verifiedBot',
    ignoreUnhandledPromiseRejections: true,
});

const initialize = async () => {
    client.use(new AlternateMessageModifier(client));
    client.use(new SlowModeRateLimiter(client, 10));
    client.connect();
    try {
        await client.join('altaccountpoggers');
        const channels = await Channels.find();
        for (const channel of channels) {
            client.join(channel.name);
        } // Join all channels in the database
    } catch (err) {
        Logger.error(err);
    }
    Logger.info('Connected to Twitch');
};

client.on('JOIN', async ({ channelName }) => {
    Logger.info(`Joined ${channelName}`);
    const userDB = await Emote.findOne({ name: channelName });
    if (!userDB) {
        const channelEmote = await channelEmotes(channelName);
        const newEmote = new Emote({
            name: channelName,
            emotes: channelEmote,
        });
        await newEmote.save();
    }
});

client.on('PART', ({ channelName }) => {
    Logger.info(`Parted ${channelName}`);
});

client.on('PRIVMSG', async ({ senderUsername, channelName, messageText }) => {
    if (senderUsername == bot.admin) {
        if (messageText.startsWith('!7tvlog')) {
            const args = messageText.slice(bot.prefix.length).trim().split(/ +/g);
            const isInChannel = await Channels.findOne({ name: args[1] });
            if (isInChannel) {
                Logger.info(`Already in ${args[1]}`);
                return;
            }

            try {
                const channel = new Channels({
                    name: args[1],
                    id: (await UserInfo(args[1]))[0].id,
                    Date: Date.now(),
                });
                await channel.save();
                await client.join(args[1]);
            } catch (err) {
                Logger.error(err);
            }
        }
    }

    const userDB = await Emote.findOne({ name: channelName });
    if (!userDB) {
        const channelEmote = await channelEmotes(channelName);
        const newEmote = new Emote({
            name: channelName,
            emotes: channelEmote,
        });
        await newEmote.save();
    }

    const emotes = userDB.emotes;
    emotes.forEach(async (emote: { name: string; id: string; emote: string; usage: number }) => {
        if (messageText.includes(emote.name)) {
            for (let i = 0; i < messageText.split(emote.name).length - 1; i++) {
                emote.usage++;
                await Emote.updateOne(
                    { 'name': channelName, 'emotes.name': emote.name },
                    { $set: { 'emotes.$.usage': emote.usage } }
                );
            }
        }
    });
});

export { client, initialize };
