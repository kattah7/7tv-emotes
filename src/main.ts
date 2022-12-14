import { bot } from './../config.json';
import { initalize } from './client/twitch';
// import { StvWS } from './utility/stv';
import { mongoDB } from './utility/db';
import { createSocketServer } from './websocket/socket';
import * as Logger from './utility/logger';
require('./api/server');
require('./privateapi/server');
require('./web/index');
createSocketServer(bot.socket.port);

async function init() {
    try {
        for (const func of [mongoDB, initalize]) {
            func();
        }

        setInterval(() => {
            process.exit(0);
        }, 1000 * 60 * 30);
    } catch (err) {
        Logger.error(err);
    }
}
init();
