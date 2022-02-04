import { ControllerResponse } from '@common/util';
import { UserNotFoundException } from '@error/user';
import { IGetUserResponse } from '@interface/user';
import { ConsoleLogger, Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	private readonly logger = new ConsoleLogger(UserController.name);
	constructor(private readonly userService: UserService) {}

	@Get(':id')
	async getUserById(@Param('id') userId: string): Promise<ControllerResponse<IGetUserResponse>> {
		const user = await this.userService.findById(userId);
		if (!user) {
			return new UserNotFoundException();
		}
		const { id, createdAt } = user;
		return {
			id,
			numberOfCollectedTweets: user.tweets.length,
			createdAt,
		};
	}

	@Get('')
	async getAllUsers(): Promise<ControllerResponse<IGetUserResponse[]>> {
		const rawUsers = await this.userService.findAll();
		return await Promise.all(
			rawUsers.map(async (user): Promise<IGetUserResponse> => {
				const { id, createdAt } = user;
				return {
					id,
					numberOfCollectedTweets: user.tweets.length,
					createdAt,
				};
			}),
		);
	}
}
