import { bot } from './../config.json';
import { initalize } from './client/twitch';
import { StvWS } from './utility/stv';
import { mongoDB } from './utility/db';
import { createSocketServer } from './websocket/socket';
import * as Logger from './utility/logger';
require('./api/server');
require('./privateapi/server');
createSocketServer(bot.websocket);

async function init() {
    try {
        for (const func of [mongoDB, StvWS, initalize]) {
            func();
        }
    } catch (err) {
        Logger.error(err);
    }
}
init();
