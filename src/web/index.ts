import express from 'express';
import { bot } from '../../config.json';
import * as Logger from '../utility/logger';
const app = express();

app.use('/', express.static(`${__dirname}/public`));

app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.listen(bot.website, () => {
    Logger.info(`Website listening on ${bot.website}`);
});
