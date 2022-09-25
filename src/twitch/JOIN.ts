import { client } from '../utility/connections';
import * as Logger from '../utility/logger';

async function JOIN() {
    client.on('JOIN', async ({ channelName }) => {
        Logger.info(`Joined ${channelName}`);
    });
}

export { JOIN };
