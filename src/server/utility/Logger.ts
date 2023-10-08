import Winston from 'winston';
import chalk from 'chalk';

export enum LogLevel {
	ERROR = 'error',
	WARN = 'warn',
	INFO = 'info',
	VERBOSE = 'verbose',
	DEBUG = 'debug',
	SILLY = 'silly',
}

const LogLevelToEmoji: { [key: string]: string } = {
	[LogLevel.ERROR]: '\u{274C}',
	[LogLevel.WARN]: '\u{26A0}\u{FE0F}',
	[LogLevel.INFO]: '\u{2139}\u{FE0F}',
	[LogLevel.DEBUG]: '\u{1F41E}',
	[LogLevel.SILLY]: '\u{1F43E}',
};

const consoleFormat = Winston.format.printf(({ level, message, timestamp, module }) => {
	let upperLevel = ` ${level.toUpperCase()} ` as string;
	const emoji = LogLevelToEmoji[level];
	switch (level) {
		case LogLevel.SILLY:
			message = chalk.magenta(message);
			upperLevel = chalk.bgMagenta.bold(upperLevel);
			break;

		case LogLevel.DEBUG:
			message = chalk.cyan(message);
			upperLevel = chalk.bgCyan.bold(upperLevel);
			break;

		case LogLevel.VERBOSE:
			message = chalk.magentaBright(message);
			upperLevel = chalk.bgMagentaBright.bold(upperLevel);
			break;

		case LogLevel.INFO:
			message = chalk.green(message);
			upperLevel = chalk.bgGreen.bold(upperLevel);
			break;

		case LogLevel.WARN:
			message = chalk.yellow(message);
			upperLevel = chalk.black.bgYellowBright.bold(upperLevel);
			break;

		case LogLevel.ERROR:
			message = chalk.red(message);
			upperLevel = chalk.bgRedBright.bold(upperLevel);
			break;

		default:
			break;
	}

	return `[${timestamp}] ${emoji} ${upperLevel} ${module ? chalk.black.bgWhite(` ${module.toUpperCase()} `) + ' ' : ''}${message}`;
});

const fileFormat = Winston.format.printf(({ level, message, timestamp, module }) => {
	return `[${timestamp}] [${level.toUpperCase()}] ${module ? '[' + module.toUpperCase() + '] ' : ''}${message}`;
});

export class Logger {
	private static _instance: Logger;
	private winstonLogger: Winston.Logger;

	constructor() {
		this.winstonLogger = Winston.createLogger({
			level: LogLevel.SILLY,
			format: Winston.format.combine(Winston.format.timestamp(), Winston.format.splat(), consoleFormat),
			transports: [
				new Winston.transports.Console(),
				new Winston.transports.File({
					filename: 'logs/error.log',
					level: 'error',
					format: Winston.format.combine(Winston.format.timestamp(), Winston.format.splat(), fileFormat),
				}),
				new Winston.transports.File({
					filename: 'logs/combined.log',
					format: Winston.format.combine(Winston.format.timestamp(), Winston.format.splat(), fileFormat),
				}),
			],
		});
	}

	static New(): Logger {
		if (!this._instance) {
			this._instance = new Logger();
		}

		return this._instance;
	}

	Log(message: string, module?: string) {
		this.winstonLogger.log(LogLevel.INFO, message, { module });
	}

	Debug(message: string, module?: string) {
		if (!Bot.Config.DEBUG) return;
		this.winstonLogger.log(LogLevel.DEBUG, message, { module });
	}

	Error(message: string, module?: string) {
		this.winstonLogger.log(LogLevel.ERROR, message, { module });
	}

	Warn(message: string, module?: string) {
		this.winstonLogger.log(LogLevel.WARN, message, { module });
	}

	Verbose(message: string, module?: string) {
		this.winstonLogger.log(LogLevel.VERBOSE, message, { module });
	}

	Silly(message: string, module?: string) {
		this.winstonLogger.log(LogLevel.SILLY, message, { module });
	}
}
