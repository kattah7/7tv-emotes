import { client } from '../utility/connections';
import { JOIN } from './twitch/JOIN';
import { PART } from './twitch/PART';
import { PRIVMSG } from './twitch/PRIVMSG';
import { joinChannels } from './twitch/joinChannels';
import * as Logger from '../utility/logger';

const initalize = async () => {
    for (const execute of [JOIN, PART, joinChannels]) {
        await execute();
    }
    setTimeout(() => {
        Logger.info('PRIVMSG initalized');
        PRIVMSG();
    }, 15000);
};

export { client, initalize };
