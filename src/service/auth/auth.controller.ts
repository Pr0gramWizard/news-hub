import { NewsHubLogger } from '@common/logger.service';
import { BadRequestException, Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserRequest, LoginUserResponse, RegisterUserRequest, RegisterUserResponse } from '@type/dto/user';
import { UserService } from '@user/user.service';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private logger: NewsHubLogger,
	) {
		this.logger.setContext(AuthController.name);
	}

	@Post('register')
	@ApiCreatedResponse({
		description: 'The record has been successfully created.',
		type: RegisterUserResponse,
	})
	@ApiConflictResponse({
		description: 'There is already a user with given mail',
	})
	async register(@Body() body: RegisterUserRequest): Promise<RegisterUserResponse> {
		const { password, email } = body;
		const existingUser = await this.userService.findByMail(email);
		if (existingUser) {
			throw new ConflictException('There is already a user with given mail');
		}
		const user = await this.userService.create({ email, password });
		const jwtToken = await this.authService.login(user);
		return {
			token: jwtToken,
		};
	}

	@Post('login')
	@ApiCreatedResponse({
		description: 'The record has been successfully created.',
		type: LoginUserResponse,
	})
	@ApiBadRequestResponse({
		description: 'Either email or password is wrong',
	})
	async login(@Body() body: LoginUserRequest): Promise<LoginUserResponse> {
		const { email, password } = body;
		const user = await this.userService.findByMail(email);
		if (!user) {
			this.logger.debug(`There is no user with mail ${email}`);
			throw new BadRequestException();
		}
		const isPasswordCorrect = await this.authService.validateUser(user, password);
		if (!isPasswordCorrect) {
			this.logger.debug(`Password is not correct for user with mail ${email}`);
			throw new BadRequestException();
		}
		const jwtToken = await this.authService.login(user);
		return {
			token: jwtToken,
		};
	}
}
