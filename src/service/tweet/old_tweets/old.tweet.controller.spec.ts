import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { BadRequestException, ConflictException, ConsoleLogger } from '@nestjs/common';
import {LoginUserRequest, RegisterUserRequest} from "../../types/dto/user";

describe('AuthController', () => {
	let controller: AuthController;
	let authService: AuthService;
	let userService: UserService;
	let logger: ConsoleLogger;
	const token = 'some-token';
	const user = {
		email: 'test@mail.com',
		password: 'test',
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				AuthService,
				{
					provide: AuthService,
					useValue: {
						login: jest.fn().mockResolvedValue(token),
						validateUser: jest.fn().mockResolvedValue(true),
					},
				},
				UserService,
				{
					provide: UserService,
					useValue: {
						findByMail: jest.fn().mockResolvedValue(user),
						create: jest.fn().mockResolvedValue(user),
					},
				},
				ConsoleLogger,
				{
					provide: ConsoleLogger,
					useValue: {
						log: jest.fn(),
						debug: jest.fn(),
						error: jest.fn(),
						warn: jest.fn(),
						setContext: jest.fn(),
					},
				},
			],
		})
			.setLogger(
				new ConsoleLogger('TestLogger', {
					logLevels: ['error'],
				}),
			)
			.compile();

		controller = moduleRef.get(AuthController);
		authService = moduleRef.get(AuthService);
		userService = moduleRef.get(UserService);
		logger = moduleRef.get(ConsoleLogger);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('register', () => {
		const payload: RegisterUserRequest = {
			email: 'test@mail.com',
			password: 'test',
		}
		const expectedResult = {
			token,
		};
		it('should register a user', async () => {
			userService.findByMail = jest.fn().mockResolvedValue(undefined);
			const result = await controller.register(payload);
			expect(result).toStrictEqual(expectedResult);
			expect(userService.create).toBeCalledWith({
				email: payload.email,
				password: payload.password,
			});
			expect(authService.login).toBeCalledWith(user);
		});

		it('should throw an error if user already exists', async () => {
			await expect(controller.register(payload)).rejects.toThrowError(ConflictException);
		});
	});

	describe('login', () => {
		const payload: LoginUserRequest = {
			email: 'test@mail.com',
			password: 'test',
		};
		const expectedResult = {
			token,
		};
		it('should return a token', async () => {
			const result = await controller.login(payload);
			expect(result).toStrictEqual(expectedResult);
			expect(userService.findByMail).toBeCalledWith(user.email);
			expect(authService.validateUser).toBeCalledWith(user, user.password);
			expect(authService.login).toBeCalledWith(user);
		});

		it('should throw error if user not found', async () => {
			userService.findByMail = jest.fn().mockResolvedValue(undefined);
			await expect(controller.login(user)).rejects.toThrowError(new BadRequestException());
			expect(logger.debug).toHaveBeenCalledTimes(1);
		});

		it('should throw error if user not validated', async () => {
			authService.validateUser = jest.fn().mockResolvedValue(false);
			await expect(controller.login(user)).rejects.toThrowError(new BadRequestException());
			expect(logger.debug).toHaveBeenCalledTimes(1);
		});
	});
});

