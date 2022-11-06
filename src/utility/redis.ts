import Redis from 'ioredis';
import * as Logger from './logger';
const redis = new Redis({});

export default redis;

redis.on('error', function (err: any) {
    Logger.error(err);
});

redis.on('connect', function () {
    Logger.info('Redis connected');
});
