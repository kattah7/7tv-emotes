import { client } from '../../utility/connections';
import { Channels } from '../../utility/db';

async function joinChannels() {
    const channels = await Channels.find({});
    for (const channel of channels) {
        client.join(channel.name);
    }
}

export { joinChannels };
