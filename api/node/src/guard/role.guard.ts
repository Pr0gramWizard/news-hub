import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { NewsHubLogger } from '@common/logger.service';
import { UserRole } from '@user/user.entity';

@Injectable()
export class RoleGuard implements CanActivate {
	private readonly logger: NewsHubLogger;
	private readonly role: UserRole;

	constructor(role: UserRole) {
		this.logger = new NewsHubLogger();
		this.role = role;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		return user && user.role === this.role;
	}
}
