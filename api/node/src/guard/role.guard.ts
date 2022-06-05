import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User, UserRole } from '@user/user.entity';
import { NewsHubLogger } from '@common/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
	private readonly logger: NewsHubLogger;

	constructor(private reflector: Reflector) {
		this.logger = new NewsHubLogger();
		this.logger.setContext(RolesGuard.name);
	}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const user: User = request.user;
		if (!user) {
			this.logger.debug('User not found');
			return false;
		}
		if (user.role === UserRole.SUPER_ADMIN) return true;

		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles || roles.length === 0) {
			return true;
		}
		return roles.includes(user.role);
	}
}
