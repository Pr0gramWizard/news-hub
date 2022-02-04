import { CanActivate, ConsoleLogger, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../service/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly logger: ConsoleLogger;
	constructor() {
		this.logger = new ConsoleLogger();
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
			const payload = await jwtService.verifyAsync<JwtPayload>(token);
			request.user = payload;
		} catch (error) {
			this.logger.error(error);
			return false;
		}
		return true;
	}
}
