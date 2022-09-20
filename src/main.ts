import { initialize } from './client/twitch';
import { StvWS } from './utility/stv';
import { mongoDB } from './utility/db';
import * as Logger from './utility/logger';
require('./api/server');
require('./privateapi/server');

async function init() {
    try {
        initialize();
        StvWS();
        mongoDB();
    } catch (err) {
        Logger.error(err);
    }
}
init();
