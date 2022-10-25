import { client } from '../../utility/connections';
import { Emote } from '../../utility/db';
import { bot } from '../../../config.json';
import fs, { readdirSync } from 'fs';
import * as Logger from '../../utility/logger';

async function PRIVMSG() {
    client.on('PRIVMSG', async (msg) => {
        const { senderUsername, messageText, channelID, channelName, senderUserID } = msg;
        const commands = new Map();
        const aliases = new Map();
        const cooldown = new Map();

        for (let file of readdirSync('./build/src/client/commands').filter((file) => file.endsWith('.js'))) {
            let pull = require(`../../client/commands/${file}`);
            commands.set(pull.name, pull);
            if (pull.aliases && Array.isArray(pull.aliases))
                pull.aliases.forEach((alias: any) => aliases.set(alias, pull.name));
        }

        const prefix = '!';
        if (!messageText.startsWith(prefix)) return;
        const args = messageText.slice(prefix.length).trim().split(/ +/g);
        const params = {};
        args.filter((word) => word.includes(':')).forEach((param) => {
            const [key, value] = param.split(':');
            params[key] = value === 'true' || value === 'false' ? value === 'true' : value;
        });
        const cmd = args.length > 0 ? args.shift().toLowerCase() : '';
        if (cmd.length == 0) return;

        let command = commands.get(cmd);
        if (!command && !aliases.get(cmd)) return;
        if (!command) command = commands.get(aliases.get(cmd));

        try {
            if (command) {
                if (senderUsername !== bot.admin) {
                    return;
                }

                if (command.cooldown) {
                    if (cooldown.has(`${command.name}${senderUserID}`)) return;
                    cooldown.set(`${command.name}${senderUserID}`, Date.now() + command.cooldown);
                    setTimeout(() => {
                        cooldown.delete(`${command.name}${senderUserID}`);
                    }, command.cooldown);
                }

                const response = await command.execute(msg, args, client, params);

                if (response) {
                    const { error, warn, text } = response;
                    if (error) {
                        Logger.error(error);
                        setTimeout(() => {
                            cooldown.delete(`${command.name}${senderUserID}`);
                        }, 5000);
                    } else if (warn) {
                        Logger.warn(warn);
                    } else if (text) {
                        Logger.info(text);
                    }
                }
            }
        } catch (e) {
            Logger.error(e);
        }

        const getChannelEmotes = fs.readFileSync(`./src/stats/${channelID}.json`, 'utf8');
        const parse = JSON.parse(getChannelEmotes);
        const knownEmoteNames = new Set(parse);

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
