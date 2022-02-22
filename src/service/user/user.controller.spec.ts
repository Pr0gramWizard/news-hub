import { Test } from '@nestjs/testing';
import { NewsHubLogger } from '../../common/logger.service';
import { GetUserResponse } from '../../types/dto/user';
import { UserNotFoundException } from '../../types/error/user';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserController', () => {
	let controller: UserController;
	let userService: UserService;
	let logger: NewsHubLogger;
	let transformUserSpy: jest.SpyInstance;
	const user: User = {
		email: 'test@mail.com',
		password: 'test',
		id: '123',
		tweets: [],
		createdAt: new Date(),
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				UserService,
				{
					provide: UserService,
					useValue: {
						findById: jest.fn().mockResolvedValue(user),
						findAll: jest.fn().mockResolvedValue([user]),
					},
				},
				NewsHubLogger,
				{
					provide: NewsHubLogger,
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
				new NewsHubLogger('TestLogger', {
					logLevels: ['error'],
				}),
			)
			.compile();

		controller = moduleRef.get(UserController);
		userService = moduleRef.get(UserService);
		logger = moduleRef.get(NewsHubLogger);
		transformUserSpy = jest
			.spyOn(UserController.prototype, 'transformUserToUserResponse')
			.mockImplementation((user: User) => {
				return {
					id: user.id,
					createdAt: user.createdAt,
					email: user.email,
					numberOfCollectedTweets: user.tweets.length,
				};
			});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getUserById', () => {
		let expectedResult: GetUserResponse;

		beforeEach(() => {
			expectedResult = {
				id: user.id,
				email: user.email,
				numberOfCollectedTweets: user.tweets.length,
				createdAt: user.createdAt,
			};
			jest.spyOn(userService, 'findById').mockResolvedValue(user);
		});

		it('should return a user entity', async () => {
			const result = await controller.getUserById(user.id);
			expect(result).toStrictEqual(expectedResult);
			expect(userService.findById).toHaveBeenCalledWith(user.id);
			expect(logger.log).toHaveBeenCalledWith(`User with id ${user.id} was found`);
			expect(transformUserSpy).toHaveBeenCalledWith(user);
		});

		it('should throw error if user not found', async () => {
			userService.findById = jest.fn().mockResolvedValue(undefined);
			await expect(controller.getUserById(user.id)).rejects.toThrowError(new UserNotFoundException());
			expect(userService.findById).toHaveBeenCalledWith(user.id);
		});
	});

	describe('getAllUsers', () => {
		let expectedResult: GetUserResponse[];
		beforeEach(() => {
			expectedResult = [
				{
					id: user.id,
					email: user.email,
					numberOfCollectedTweets: user.tweets.length,
					createdAt: user.createdAt,
				},
			];
		});

		it('should return a list of user entities', async () => {
			const result = await controller.getAllUsers();
			expect(result).toStrictEqual(expectedResult);
			expect(userService.findAll).toBeCalled();
		});
	});

	describe('transformUserToUserResponse', () => {
		it('should return a user response', () => {
			transformUserSpy.mockRestore();
			const result = controller.transformUserToUserResponse(user);
			expect(result).toStrictEqual({
				id: user.id,
				email: user.email,
				numberOfCollectedTweets: user.tweets.length,
				createdAt: user.createdAt,
			});
		});
	});
});
