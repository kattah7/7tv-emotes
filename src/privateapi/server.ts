import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import join from '../privateapi/routes/join';
import { bot } from '../../config.json';
import * as Logger from '../utility/logger';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(join);
app.listen(bot.api, () => {
    Logger.info('Private API Server is running on port ' + bot.api);
});
