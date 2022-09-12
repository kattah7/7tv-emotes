import { ChatClient } from '@kararty/dank-twitch-irc';
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
        const user = new Emote({
            name: channelName,
        });
        await user.save();
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
    const emotes = await channelEmotes(channelName);
    emotes.forEach(async (emote: { name: string; id: string; emote: string }) => {
        if (messageText.includes(emote.name)) {
            for (let i = 0; i < messageText.split(emote.name).length - 1; i++) {
                const userDB = await Emote.findOne({ name: channelName });
                const linkEmote = /https:\/\/(cdn\.)?7tv\.app\/emote\/(\w{24})\/3x/.exec(emote.emote);
                const emoteDB = userDB?.emotes.find(
                    (e: { name: string; emote: string; usage: number }) => e.emote === linkEmote[2]
                );
                if (emoteDB) {
                    emoteDB.usage += 1;
                    await userDB?.save();
                } else {
                    const linkEmote = /https:\/\/(cdn\.)?7tv\.app\/emote\/(\w{24})\/3x/.exec(emote.emote);
                    userDB?.emotes.push({
                        name: emote.name,
                        emote: linkEmote[2],
                        usage: 1,
                        isEmote: true,
                        Date: Date.now(),
                    });
                    await userDB?.save();
                }
            }
        }
    });
});

export { client, initialize };
