import { initalize } from './client/twitch';
import { StvWS } from './utility/stv';
import { mongoDB } from './utility/db';
import * as Logger from './utility/logger';
require('./api/server');
require('./privateapi/server');

async function init() {
    try {
        mongoDB();
        await StvWS();
        await initalize();
    } catch (err) {
        Logger.error(err);
    }
}
init();
