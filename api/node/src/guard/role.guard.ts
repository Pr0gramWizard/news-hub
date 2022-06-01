import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@user/user.entity';
import { NewsHubLogger } from '@common/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
	private readonly logger: NewsHubLogger;

	constructor(private reflector: Reflector) {
		this.logger = new NewsHubLogger();
		this.logger.setContext(RolesGuard.name);
	}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const user: User = request.user;
		if (!user) {
			this.logger.debug('User not found');
			return false;
		}
		return roles.includes(user.role);
	}
}
