import WebSocket from 'ws';
import { client } from './../utility/connections';
import { Emote } from './../utility/db';
import * as Logger from './../utility/logger';

export function createSocketServer(server: number) {
    Logger.info(`Websocket server started on port ${server}`);
    const wss = new WebSocket.Server({
        port: server,
    });

    const WebSocketNonce = {};

    wss.on('connection', (ws: any, req: any) => {
        const nonce = req.headers['sec-websocket-key'];
        WebSocketNonce[nonce] = ws;

        function sendWS(type: string, data: any) {
            ws.send(JSON.stringify({ type: type, data: data }));
        }

        ws.on('message', (message: any) => {
            const parsed = JSON.parse(message.toString());
            const { type, data } = parsed;
            if (type === 'listen') {
                // if already listening to channel, ignore
                if (data in WebSocketNonce) {
                    sendWS('error', `Already listening to ${data.room}`);
                    return;
                }
                sendWS('response', `You are now connected to ${data.room}`);

                client.on('PRIVMSG', async ({ senderUsername, messageText, channelName }) => {
                    const isGlobalTop = data.room === 'global:top' ? channelName : data.room;

                    if (channelName === isGlobalTop) {
                        const knownEmoteNames = new Set(
                            (await Emote.findOne({ name: isGlobalTop })).emotes
                                .filter((emote) => emote.isEmote === true)
                                .map((emote) => emote.name)
                        );

                        const usageByName = {};

                        for (const word of messageText.split(' ')) {
                            if (knownEmoteNames.has(word)) {
                                if (usageByName[word] > 16) {
                                    sendWS('message', 'Spamming emotes');
                                    return;
                                }

                                if (word in usageByName) {
                                    usageByName[word] += 1;
                                    continue;
                                }
                                
                                usageByName[word] = 1;
                            }
                        }

                        const entries = Object.entries(usageByName);

                        if (entries.length) {
                            for (const [emoteName, count] of entries) {
                                sendWS('message', {
                                    count,
                                    emoteName,
                                    channel: channelName,
                                    actor: senderUsername,
                                });
                            }
                        }
                    }
                });
            }
        });
    });
}


