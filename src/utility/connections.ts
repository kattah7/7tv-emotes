import { ChatClient, AlternateMessageModifier, SlowModeRateLimiter } from '@kararty/dank-twitch-irc';
import { bot } from '../../config.json';
import * as Logger from '../utility/logger';

const client = new ChatClient({
    username: bot.username,
    password: bot.token,
    rateLimits: 'verifiedBot',
    ignoreUnhandledPromiseRejections: true,
});

client.use(new AlternateMessageModifier(client));
client.use(new SlowModeRateLimiter(client, 10));
client.connect();
Logger.info('Connected to Twitch');

export { client };
