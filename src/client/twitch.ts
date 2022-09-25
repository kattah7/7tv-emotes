import { client } from '../utility/connections';
import { JOIN } from '../twitch/JOIN';
import { PART } from '../twitch/PART';
import { PRIVMSG } from '../twitch/PRIVMSG';
import { joinChannels } from '../twitch/joinChannels';

const initalize = async () => {
    await JOIN();
    await PART();
    await PRIVMSG();
    await joinChannels();
};

export { client, initalize };
