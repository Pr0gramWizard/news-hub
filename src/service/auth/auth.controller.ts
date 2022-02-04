import { ICreateUserRequest, ICreateUserResponse, ILoginUserRequest } from '@interface/user';
import { BadRequestException, Body, ConflictException, ConsoleLogger, Controller, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	private readonly logger = new ConsoleLogger(AuthController.name);
	constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

	@Post('register')
	async register(@Body() body: ICreateUserRequest): Promise<ICreateUserResponse> {
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
	async login(@Body() body: ILoginUserRequest) {
		const { email, password } = body;
		this.logger.debug(email);
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
		this.logger.debug(jwtToken);
		return {
			token: jwtToken,
		};
	}
}
