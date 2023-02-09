import Ratelimit from 'express-rate-limit';

export const Limiter = (windowMs: number, max: number) =>
	Ratelimit({
		windowMs,
		max,
		message: 'lul',
		standardHeaders: true,
		legacyHeaders: false,
	});
