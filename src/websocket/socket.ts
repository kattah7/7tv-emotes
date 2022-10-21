import WebSocket from 'ws';
import { client } from './../utility/connections';
import { Emote, Channels } from './../utility/db';
import * as Logger from './../utility/logger';

export function createSocketServer(server: number) {
    Logger.info(`Websocket server started on port ${server}`);
    const wss = new WebSocket.Server({
        port: server,
    });

    let WebSocketNonce = {};

    wss.on('connection', (ws: any, req: any) => {
        let nonce = req.headers['sec-websocket-key'];
        WebSocketNonce[nonce] = ws;

        function sendWS(type: string, data: any) {
            ws.send(JSON.stringify({ type: type, data: data }));
        }

        ws.on('message', (message: any) => {
            const parsed = JSON.parse(message.toString());
            console.log(parsed);
            const { type, data } = parsed;
            if (type === 'listen') {
                sendWS('response', `You are now connected to ${data.room}`);
                client.on('PRIVMSG', async ({ senderUsername, messageText, channelID, channelName }) => {
                    if (channelName === data.room) {
                        const knownEmoteNames = new Set(
                            (await Emote.findOne({ name: data.room })).emotes
                                .filter((emote) => emote.isEmote === true)
                                .map((emote) => emote.name)
                        );

                        const emotesUsedByName = {};

                        for (const word of messageText.split(/\s/g)) {
                            if (knownEmoteNames.has(word)) {
                                if (emotesUsedByName[word] > 16) {
                                    sendWS('message', 'Spamming emotes');
                                    return;
                                }

                                if (!(word in emotesUsedByName)) {
                                    emotesUsedByName[word] = 1;
                                    continue;
                                }
                            }
                            ++emotesUsedByName[word];
                        }

                        if (Object.entries(emotesUsedByName).length > 0) {
                            for (const [emoteName, count] of Object.entries(emotesUsedByName)) {
                                sendWS('message', {
                                    emoteName: emoteName,
                                    count: count,
                                    actor: senderUsername,
                                    channel: channelName,
                                });
                            }
                        }
                    }
                });
            }
        });
    });
}
