import { createLogger, format, transports, addColors } from 'winston';
const { combine, colorize, timestamp, printf } = format;
import util from 'util';
import 'dotenv/config';

const loggerLevels = {
    colors: {
        info: 'green',
        error: 'underline bold red',
        debug: 'bold magenta',
        warn: 'yellow',
    },
};

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const winston = createLogger({
    format: combine(
        format((info) => {
            info.level = info.level.toUpperCase();
            return info;
        })(),
        timestamp({
            format: 'DD.MM.YY HH:mm:ss.SSS',
        }),
        colorize(),
        logFormat
    ),
    transports: [
        new transports.Console({
            stderrLevels: ['error'],
        }),
    ],
});
addColors(loggerLevels.colors);

if (process.env.LOGLEVEL) {
    winston.transports[0].level = process.env.LOGLEVEL;
    winston.info(`Setting loglevel to ${winston.transports[0].level}`);
} else {
    winston.transports[0].level = 'info';
    winston.info(`Setting loglevel to ${winston.transports[0].level}`);
}

const info = (...args) => {
    winston.info(args);
};

const error = (...args) => {
    winston.error(args);
};

const debug = (...args) => {
    winston.debug(args);
};

const warn = (...args) => {
    winston.warn(args);
};

const json = (...args) => {
    winston.debug(util.inspect(args));
};

export { info, error, debug, warn, json };
