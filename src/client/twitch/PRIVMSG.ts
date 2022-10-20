import { client } from '../../utility/connections';
import { Emote, Channels } from '../../utility/db';
import { UserInfo, StvInfo } from '../../utility/parseUID';
import { WS } from '../../utility/stv';
import { bot } from '../../../config.json';
import { channelEmotes } from '../../utility/channelEmotes';
import * as Logger from '../../utility/logger';

async function PRIVMSG() {
    client.on('PRIVMSG', async ({ senderUsername, messageText, channelID, channelName }) => {
        if (senderUsername === bot.admin) {
            if (messageText.startsWith('!7tvlog')) {
                const args = messageText.slice(bot.prefix.length).trim().split(/ +/g);
                const username = args[1].toLowerCase();
                const ID = await UserInfo(username);
                if (ID == null) {
                    Logger.error('User not found');
                    return;
                }
                const STV = await StvInfo(ID[0]['id']);
                if (STV.error) {
                    Logger.error(`7TV Error: ${STV.error}`);
                    return;
                }

                const isInChannel = await Channels.findOne({ id: ID[0]['id'] });
                if (isInChannel) {
                    Logger.warn(`Already in ${username}`);
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
                    const emoteSetUpdate = {
                        op: 35,
                        d: {
                            type: 'emote_set.update',
                            condition: {
                                object_id: (await StvInfo(channelID)).emote_set.id,
                            },
                        },
                    };
                    const userUpdate = {
                        op: 35,
                        d: {
                            type: 'user.update',
                            condition: {
                                object_id: (await StvInfo(channelID)).user.id,
                            },
                        },
                    };
                    WS.send(JSON.stringify(emoteSetUpdate));
                    WS.send(JSON.stringify(userUpdate));
                    Logger.info('Newly Joined ' + username);
                } catch (err) {
                    Logger.error(err);
                }
                return;
            }
        }

        const knownEmoteNames = new Set(
            (await Emote.findOne({ id: channelID })).emotes
                .filter((emote) => emote.isEmote === true)
                .map((emote) => emote.name)
        );

        const emotesUsedByName = {};

        for (const word of messageText.split(/\s/g)) {
            if (knownEmoteNames.has(word)) {
                if (emotesUsedByName[word] > 16) {
                    Logger.warn(`${senderUsername} is spamming "${word}" in ${channelName}`);
                    return;
                }

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
}

export { PRIVMSG };
