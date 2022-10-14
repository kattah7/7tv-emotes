import { initalize } from './client/twitch';
import { StvWS } from './utility/stv';
import { mongoDB } from './utility/db';
import * as Logger from './utility/logger';
require('./web');
require('./api/server');
require('./privateapi/server');

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
