import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from '@user/user.entity';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export function Auth(...roles: UserRole[]) {
	return applyDecorators(SetMetadata('roles', roles), UseGuards(AuthGuard, RolesGuard), ApiBearerAuth());
}
