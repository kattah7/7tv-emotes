import { client } from '../../utility/connections';
import { Emote } from '../../utility/db';
import fs from 'fs';
import * as Logger from '../../utility/logger';

async function PRIVMSG() {
    client.on('PRIVMSG', async (msg) => {
        const { senderUsername, messageText, channelID, channelName, senderUserID } = msg;
        const getChannelEmotes = fs.readFileSync(`./src/stats/${channelID}.json`, 'utf8');
        const parse = JSON.parse(getChannelEmotes);
        const knownEmoteNames = new Set(parse);
        if (!knownEmoteNames) {
            Logger.info(`No emotes found for ${channelName}`);
            return;
        }

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
                if (isNaN(Number(count)) || count < 0) {
                    continue;
                }
                operation.find({ 'id': channelID, 'emotes.name': emoteName, 'emotes.isEmote': true }).update({
                    $inc: { 'emotes.$.usage': count },
                });
            }

            try {
                await operation.execute();
            } catch (err) {
                if (err.message.includes('Batch cannot be empty')) {
                    return;
                }
                Logger.error(err);
            }
        }
    });
}

export { PRIVMSG };
