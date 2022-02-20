import { ControllerResponse } from '@common/util';
import { UserNotFoundException } from '@error/user';
import { GetUserResponse } from '../../types/dto/user';
import { ConsoleLogger, Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@user/user.entity';

@ApiTags('User')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService, private readonly logger: ConsoleLogger) {
		this.logger.setContext(UserController.name);
	}

	@Get(':id')
	@ApiOkResponse({ description: 'User entity', type: GetUserResponse })
	@ApiNotFoundResponse({ description: 'User not found' })
	async getUserById(@Param('id') userId: string): Promise<ControllerResponse<GetUserResponse>> {
		const user = await this.userService.findById(userId);
		if (!user) {
			throw new UserNotFoundException();
		}
		this.logger.log(`User with id ${userId} was found`);
		return this.transformUserToUserResponse(user);
	}

	@Get('')
	@ApiOkResponse({ description: 'User entities', type: [GetUserResponse] })
	async getAllUsers(): Promise<ControllerResponse<GetUserResponse[]>> {
		const rawUsers = await this.userService.findAll();
		return rawUsers.map(this.transformUserToUserResponse);
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
