import { client } from '../../utility/connections';
import { Channels } from '../../utility/db';
import { bot } from '../../../config.json';

async function joinChannels() {
    const channels = await Channels.find({});
    for (const channel of channels) {
        client.join(channel.name);
    }
}

export { joinChannels };
