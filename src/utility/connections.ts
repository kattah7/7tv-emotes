import { ChatClient } from '@kararty/dank-twitch-irc';
import { bot } from '../../config.json';
import * as Logger from '../utility/logger';

const client = new ChatClient({
    username: bot.username,
    password: bot.token,
    rateLimits: 'verifiedBot',
    ignoreUnhandledPromiseRejections: true,
});

client.connect();
Logger.info('Connected to Twitch');

export { client };
