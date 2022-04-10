import { NextFunction, Request, Response } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
	private logger = new Logger('HTTP');

	use(request: Request, response: Response, next: NextFunction): void {
		const startAt = process.hrtime();
		const { ip, method, originalUrl } = request;
		const userAgent = request.get('user-agent') || '';
		const userAgentHash = crypto.createHash('md5').update(userAgent).digest('hex');

		response.on('finish', () => {
			const { statusCode } = response;
			const diff = process.hrtime(startAt);
			const responseTime = diff[0] * 1e3 + diff[1] * 1e-6;
			this.logger.log(
				`${method} ${originalUrl} ${statusCode} ${responseTime.toFixed(4)}ms - ${userAgentHash} [${ip}]`,
			);
		});

		next();
	}
}
