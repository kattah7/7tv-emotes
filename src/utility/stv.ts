import WebSocket from 'ws';
import * as Logger from './logger';
import { Emote, Channels } from '../utility/db';
import { StvInfo } from '../utility/parseUID';

let WS = new WebSocket(`wss://events.7tv.io/v3`);
export { WS };
export const StvWS = async () => {
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
    // export function that sends json stringify
    WS.on('open', async (msg: any) => {
        Logger.info('Connected to 7TV', msg);
        const channels = await Channels.find({});
        for (const channel of channels) {
            const { emote_set, user } = await StvInfo(channel.id);
            if (!emote_set.id && !user) continue;
            sendWS(35, 'user.update', user.id);
            sendWS(35, 'emote_set.update', emote_set.id);
        }
    });

    WS.on('message', async (data: any) => {
        const { op, t, d } = JSON.parse(data);
        switch (d.type) {
            case 'emote_set.update': {
                const { id } = d.body.actor.connections[0];
                if (d.body.pulled) {
                    const { old_value } = d.body.pulled[0];
                    const knownEmoteNames = (await Emote.findOne({ id: id })).emotes.map(
                        (emote: { emote: string }) => emote.emote
                    );
                    if (knownEmoteNames.includes(old_value.id)) {
                        await Emote.updateOne(
                            { 'id': id, 'emotes.emote': old_value.id },
                            { $set: { 'emotes.$.isEmote': false } }
                        );
                    }
                } else if (d.body.pushed) {
                    const { value } = d.body.pushed[0];
                    const knownEmoteNames = (await Emote.findOne({ id: id })).emotes.map(
                        (emote: { emote: string }) => emote.emote
                    );
                    const findThatEmoteByStvID = (await Emote.findOne({ id: id })).emotes.find(
                        (emote: { emote: string }) => emote.emote === value.id
                    );
                    if (findThatEmoteByStvID) {
                        if (knownEmoteNames.includes(value.id) || findThatEmoteByStvID.name !== value.name) {
                            await Emote.updateOne(
                                { 'id': id, 'emotes.emote': value.id },
                                { $set: { 'emotes.$.name': value.name } }
                            );
                        }
                    }
                    if (knownEmoteNames.includes(value.id)) {
                        await Emote.updateOne(
                            { 'id': id, 'emotes.emote': value.id },
                            { $set: { 'emotes.$.isEmote': true } }
                        );
                    } else {
                        await Emote.updateOne(
                            { id: id },
                            {
                                $push: {
                                    emotes: {
                                        name: value.name,
                                        emote: value.id,
                                        usage: 0,
                                        isEmote: true,
                                        Date: Date.now(),
                                    },
                                },
                            }
                        );
                    }
                } else if (d.body.updated) {
                    const { value } = d.body.updated[0];
                    const knownEmoteNames = (await Emote.findOne({ id: id })).emotes.map(
                        (emote: { emote: string }) => emote.emote
                    );
                    if (knownEmoteNames.includes(value.id)) {
                        await Emote.updateOne(
                            { 'id': id, 'emotes.emote': value.id },
                            { $set: { 'emotes.$.name': value.name } }
                        );
                    }
                }
                break;
            }

            case 'user.update': {
                const { value, old_value } = d.body.updated[0].value[0];
                sendWS(36, 'emote_set.update', old_value.id);
                sendWS(35, 'emote_set.update', value.id);
                break;
            }
        }

        setInterval(() => {
            WS.send(
                JSON.stringify({
                    op: 37,
                })
            );
        }, 30 * 1000);
    });

    WS.on('error', (err) => {
        Logger.error(`7TV Socket encountered an error: ${err}`);
        setTimeout(() => {
            StvWS();
        }, 1000);
    });

    return WS;
};
