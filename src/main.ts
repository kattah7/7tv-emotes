import { initialize } from './client/twitch';
import { Stv } from './utility/stv';
import { mongoDB } from './utility/db';
import * as Logger from './utility/logger';
require('./api/server');

async function init() {
    try {
        initialize();
        Stv();
        mongoDB();
    } catch (err) {
        Logger.error(err);
    }
}
init();
