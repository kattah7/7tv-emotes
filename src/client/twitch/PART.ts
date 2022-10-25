import { client } from '../../utility/connections';
import { StvInfo, UserInfo } from '../../utility/parseUID';
import { WS } from '../../utility/stv';
import * as Logger from '../../utility/logger';

async function PART() {
    client.on('PART', async ({ channelName }) => {
        function sendWS(op: number, type: string, id: string) {
            WS.send(
                JSON.stringify({
                    op: op,
                    d: {
                        type: type,
                        condition: {
                            object_id: id,
                        },
                    },
                })
            );
        }

        Logger.info(`Parted ${channelName}`);
        const { id } = (await UserInfo(channelName))[0];
        const { user, emote_set } = await StvInfo(id);
        if (!user && !emote_set) return;
        sendWS(36, 'user.update', user.id);
        sendWS(36, 'emote_set.update', emote_set.id);
    });
}

export { PART };
