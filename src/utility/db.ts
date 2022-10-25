import DB from 'mongoose';
import { bot } from './../../config.json';
import * as Logger from './logger';

const mongoDB = () => {
    try {
        DB.connect(bot.mongo, {});
    } catch (err) {
        Logger.error(err);
    }
};

DB.connection.on('connected', () => {
    Logger.info('Connected to MongoDB');
});

DB.connection.on('disconnected', () => {
    Logger.info('Disconnected from database');
});

DB.connection.on('error', (err) => {
    Logger.error(err);
});

const EmoteSchema = new DB.Schema({
    name: String,
    id: String,
    StvId: String,
    emotes: [{ name: String, emote: String, usage: Number, isEmote: Boolean, Date: Number }],
});

const ChannelSchema = new DB.Schema({
    name: String,
    id: String,
    Date: Number,
});

const Channels = DB.model('Channels', ChannelSchema);
const Emote = DB.model('Emote', EmoteSchema);

export { Emote, Channels, mongoDB, DB };
