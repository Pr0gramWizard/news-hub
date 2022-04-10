import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NewsHubLogger } from '@common/logger.service';
import { JwtPayload } from '../service/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly logger: NewsHubLogger;

	constructor() {
		this.logger = new NewsHubLogger();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const { authorization } = request.headers;
		if (!authorization) {
			return false;
		}
		const token = authorization.split(' ')[1];
		const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
		try {
			request.user = await jwtService.verifyAsync<JwtPayload>(token);
		} catch (error) {
			this.logger.error(error);
			return false;
		}
		return true;
	}
}
