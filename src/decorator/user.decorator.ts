import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../service/auth/auth.service';

export const UserContext = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return request.user as JwtPayload;
});
