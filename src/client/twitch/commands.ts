import { client } from '../twitch';
import { bot } from '../../../config.json';
import * as Logger from '../../utility/logger';
import { readdirSync } from 'fs';

async function commands() {
    client.on('PRIVMSG', async (msg) => {
        const { senderUsername, messageText, channelID, channelName, senderUserID } = msg;

        const commands = new Map();
        const aliases = new Map();
        const cooldown = new Map();

        for (const file of readdirSync('./build/src/client/commands').filter((file) => file.endsWith('.js'))) {
            const pull = require(`../../client/commands/${file}`);
            commands.set(pull.name, pull);
            if (pull.aliases && Array.isArray(pull.aliases))
                pull.aliases.forEach((alias: any) => aliases.set(alias, pull.name));
        }

        const prefix = bot.prefix;
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
    });
}

export { commands };
