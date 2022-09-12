import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import channelInfo from './routes/channelInfo';
import * as Logger from '../utility/logger';
import { bot } from '../../config.json';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(channelInfo);
app.listen(bot.port, () => {
    Logger.info('Server is running on port ' + bot.port);
});
