import { ChatClient, AlternateMessageModifier, SlowModeRateLimiter } from '@kararty/dank-twitch-irc';
import { bot } from '../../config.json';
import { channelEmotes } from '../utility/channelEmotes';
import { Emote, Channels } from '../utility/db';
import { UserInfo, StvInfo } from '../utility/parseUID';
import { WS } from '../utility/stv';
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
    Logger.info('Connected to Twitch');
    try {
        await client.join('altaccountpoggers');
        const channels = await Channels.find();
        for (const channel of channels) {
            await client.join(channel.name);
        } // Join all channels in the database
    } catch (err) {
        Logger.error(err);
    }
};

client.on('JOIN', async ({ channelName }) => {
    Logger.info(`Joined ${channelName}`);
    const channelID = (await UserInfo(channelName))[0].id;
    const userDB = await Emote.findOne({ id: channelID });
    const ID = userDB?.StvId;
    if (!ID) {
        await Emote.findOneAndUpdate(
            { name: channelName },
            { StvId: (await StvInfo(channelID)).user.id, id: channelID }
        );
    }

    const userDB2 = await Emote.findOne({ id: channelID });
    if (!userDB2) {
        const channelEmote = await channelEmotes(channelID);
        const newEmote = new Emote({
            name: channelName,
            id: channelID,
            StvId: (await StvInfo(channelID)).user.id,
            emotes: channelEmote,
        });
        await newEmote.save();
    }
});

client.on('PART', ({ channelName }) => {
    Logger.info(`Parted ${channelName}`);
});

client.on('PRIVMSG', async ({ senderUsername, messageText, channelID, channelName }) => {
    if (senderUsername == bot.admin) {
        if (messageText.startsWith('!7tvlog')) {
            const args = messageText.slice(bot.prefix.length).trim().split(/ +/g);
            const username = args[1].toLowerCase();
            const isInChannel = await Channels.findOne({ name: username });
            if (isInChannel) {
                Logger.info(`Already in ${username}`);
                return;
            }

            try {
                const channel = new Channels({
                    name: username,
                    id: (await UserInfo(username))[0].id,
                    Date: Date.now(),
                });
                await channel.save();
                const channelID = (await UserInfo(username))[0].id;
                const userDB2 = await Emote.findOne({ id: channelID });
                if (!userDB2) {
                    const channelEmote = await channelEmotes(channelID);
                    const newEmote = new Emote({
                        name: username,
                        id: channelID,
                        StvId: (await StvInfo(channelID)).user.id,
                        emotes: channelEmote,
                    });
                    await newEmote.save();
                }
                await client.join(username);
                const sendWSJSONStringyToSTV = {
                    op: 35,
                    d: {
                        type: 'emote_set.update',
                        condition: {
                            object_id: (await StvInfo(channelID)).user.id,
                        },
                    },
                };
                WS.send(JSON.stringify(sendWSJSONStringyToSTV));
                Logger.info('Newly Joined ' + username);
            } catch (err) {
                Logger.error(err);
            }
        }
    }

    const knownEmoteNames = new Set((await Emote.findOne({ id: channelID })).emotes.map((emote) => emote.name));

    const emotesUsedByName = {};

    for (const word of messageText.split(/\s/g)) {
        if (knownEmoteNames.has(word)) {
            if (!(word in emotesUsedByName)) {
                emotesUsedByName[word] = 1;
                continue;
            }
        }
        ++emotesUsedByName[word];
    }

    if (Object.entries(emotesUsedByName).length > 0) {
        const operation = Emote.collection.initializeUnorderedBulkOp();
        for (const [emoteName, count] of Object.entries(emotesUsedByName)) {
            operation.find({ 'id': channelID, 'emotes.name': emoteName }).update({
                $inc: { 'emotes.$.usage': count },
            });
        }

        try {
            await operation.execute();
        } catch (err) {
            Logger.error(err);
        }
    }
});

export { client, initialize };
