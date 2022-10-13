import { client } from '../utility/connections';
import { JOIN } from '../twitch/JOIN';
import { PART } from '../twitch/PART';
import { PRIVMSG } from '../twitch/PRIVMSG';
import { joinChannels } from '../twitch/joinChannels';

const initalize = async () => {
    for (const execute of [JOIN, PART, PRIVMSG, joinChannels]) {
        await execute();
    }
};

export { client, initalize };
