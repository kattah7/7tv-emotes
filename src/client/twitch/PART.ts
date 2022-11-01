import { client } from '../../utility/connections';
import * as Logger from '../../utility/logger';

async function PART() {
    client.on('PART', async ({ channelName }) => {
        Logger.info(`Parted ${channelName}`);
    });
}

export { PART };
