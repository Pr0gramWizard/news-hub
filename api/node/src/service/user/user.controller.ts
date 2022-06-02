import { NewsHubLogger } from '@common/logger.service';
import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetUserResponse, ResetPasswordRequest, UserResponse } from '@type/dto/user';
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
		const user = await this.userService.findById(userId);
		if (!user) {
			throw new BadRequestException(UserErrorCodes.USER_NOT_FOUND);
		}
		this.logger.log(`User with id ${userId} was found`);
		return this.transformUserToUserResponse(user);
	}

	@Get('')
	@Auth(UserRole.ADMIN)
	@ApiOkResponse({ description: 'User entities', type: [GetUserResponse] })
	async getAllUsers(): Promise<GetUserResponse[]> {
		const rawUsers = await this.userService.findAll();
		return rawUsers.map(this.transformUserToUserResponse);
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

	@Post('change/password')
	@Auth()
	@ApiOkResponse({ description: 'Password reset' })
	async resetPassword(@Body() body: ResetPasswordRequest, @UserContext() jwtPayload: JwtPayload): Promise<void> {
		const { sub } = jwtPayload;
		const user = await this.userService.findById(sub);
		if (!user) {
			throw new BadRequestException(UserErrorCodes.USER_NOT_FOUND);
		}
		const { oldPassword, newPassword } = body;
		await this.userService.updatePassword(user, oldPassword, newPassword);
	}

	@Post('change/email')
	@Auth()
	@ApiOkResponse({ description: 'Email changed' })
	async changeEmail(@Body() body: { email: string }, @UserContext() jwtPayload: JwtPayload): Promise<void> {
		const { sub } = jwtPayload;
		await this.userService.updateEmail(sub, body.email);
	}

	transformUserToUserResponse(user: User): GetUserResponse {
		const { id, createdAt, email } = user;
		return {
			id,
			createdAt,
			email,
			numberOfCollectedTweets: user.tweets.length,
		};
	}
}
