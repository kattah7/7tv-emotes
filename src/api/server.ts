import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import channelInfo from './routes/channelInfo';
import global from './routes/global';
import top from './routes/topemotes';
import join from './routes/join';
import * as Logger from '../utility/logger';
import { bot } from '../../config.json';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(channelInfo);
app.use(global);
app.use(top);
app.use(join);
app.listen(bot.port, () => {
    Logger.info('Server is running on port ' + bot.port);
});
