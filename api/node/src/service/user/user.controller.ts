import { NewsHubLogger } from '@common/logger.service';
import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
	ChangeBasicInformationRequest,
	ChangeUserRoleRequest,
	GetUserResponse,
	ResetPasswordRequest,
	UserForAdminDashboard,
	UserResponse,
} from '@type/dto/user';
import { UserErrorCodes } from '@type/error/user';
import { User, UserRole } from '@user/user.entity';
import { UserService } from './user.service';
import { Auth } from '../../decorator/auth.decorator';
import { UserContext } from '../../decorator/user.decorator';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService, private readonly logger: NewsHubLogger) {
		this.logger.setContext(UserController.name);
	}

	@Get(':id')
	@ApiOkResponse({ description: 'User entity', type: GetUserResponse })
	@ApiNotFoundResponse({ description: 'User not found' })
	@Auth(UserRole.ADMIN)
	async getUserById(@Param('id') userId: string): Promise<GetUserResponse> {
		const user = await this.userService.findByIdOrFail(userId);
		return this.userService.transformUserToUserResponse(user);
	}

	@Get('')
	@Auth(UserRole.ADMIN)
	@ApiOkResponse({ description: 'User entities', type: [UserForAdminDashboard] })
	async findAllForDashboard(): Promise<UserForAdminDashboard[]> {
		const users = await this.userService.findAll();
		return users.map((u) => {
			return {
				...u,
				numberOfCollectedTweets: u.tweets.length,
			};
		});
	}

	@Get('news/tweets')
	@Auth(UserRole.ADMIN)
	@ApiOkResponse({
		description: 'Get all users and their news related tweets',
		type: [UserResponse],
	})
	async getAllTweetsGroupedByUser(): Promise<UserResponse[]> {
		const users = await this.userService.findAllWithNewsTweets();
		const numberOfNewsRelatedTweets = users.reduce((acc, user) => acc + user.tweets.length, 0);
		this.logger.log(`Found ${numberOfNewsRelatedTweets} news related tweets`);
		return users;
	}

	@Post('update/password')
	@Auth()
	@ApiOkResponse({ description: 'Password reset' })
	async resetPassword(@Body() body: ResetPasswordRequest, @UserContext() jwtPayload: JwtPayload): Promise<void> {
		const { sub } = jwtPayload;
		const user = await this.userService.findByIdOrFail(sub);
		const { oldPassword, newPassword } = body;
		await this.userService.updatePassword(user, oldPassword, newPassword);
	}

	@Post('update/basic-info')
	@Auth()
	@ApiOkResponse({ description: 'Basic information changed' })
	async changeEmail(
		@Body() body: ChangeBasicInformationRequest,
		@UserContext() jwtPayload: JwtPayload,
	): Promise<void> {
		const { sub } = jwtPayload;
		await this.userService.updateEmail(sub, body);
	}

	@Post('change/role')
	@Auth(UserRole.ADMIN)
	@ApiOkResponse({ description: 'Changed role of user' })
	async changeUserRole(@Body() body: ChangeUserRoleRequest): Promise<void> {
		const { userId, role } = body;
		const user = await this.userService.findByIdOrFail(userId);
		if (user.role === role) {
			return;
		}
		if (user.role === UserRole.ADMIN) {
			throw new BadRequestException(UserErrorCodes.USER_IS_ADMIN);
		}
		await this.userService.updateRole(userId, role);
	}

	@Delete(':id')
	@Auth(UserRole.ADMIN)
	@ApiOkResponse({ description: 'User deleted' })
	@ApiNotFoundResponse({ description: 'User not found' })
	async deleteUser(@Param('id') userId: string, @UserContext() jwtPayload: JwtPayload): Promise<void> {
		const requestingUser = await this.userService.findByIdOrFail(jwtPayload.sub);
		const userToDelete = await this.userService.findByIdOrFail(userId);
		if (requestingUser.id === userToDelete.id) {
			throw new BadRequestException(UserErrorCodes.WRONG_DELETE_ROUTE);
		}
		if (userToDelete.role === UserRole.SUPER_ADMIN) {
			throw new BadRequestException(UserErrorCodes.CANNOT_DELETE_SUPER_ADMIN);
		}
		if (requestingUser.role === UserRole.ADMIN && userToDelete.role === UserRole.ADMIN) {
			throw new BadRequestException(UserErrorCodes.CANNOT_DELETE_ADMIN);
		}
		await this.userService.delete(userId);
	}
}
