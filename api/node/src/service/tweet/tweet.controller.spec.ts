import { Test } from '@nestjs/testing';
import { NewsHubLogger } from '../../common/logger.service';
import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';
import { UserService } from '../user/user.service';
import { TwitterService } from '../../common/twitter.service';
import { TweetAuthorService } from './author/tweet.author.service';
import { StoreTweetRequest } from '../../types/dto/tweet';
import { JwtPayload } from '../auth/auth.service';
import { TweetV2SingleResult } from 'twitter-api-v2';
import { TweetEntitiesV2 } from 'twitter-api-v2/dist/types/v2/tweet.definition.v2';
import { BadRequestException } from '@nestjs/common';
import { UserErrorCodes } from '../../types/error/user';
import { TweetErrorCode } from '../../types/error/tweet';
import { TwitterApiException } from '../../types/error/general';

describe('TweetController', () => {
	let controller: TweetController;
	let tweetService: TweetService;
	let userService: UserService;
	let twitterService: TwitterService;
	let authorService: TweetAuthorService;
	let authorId: string;
	let twitterApiMockResponse: TweetV2SingleResult;

	beforeEach(async () => {
		authorId = '123';
		twitterApiMockResponse = {
			data: {
				id: '123',
				text: 'test',
				author_id: authorId,
				entities: {
					urls: [],
				} as unknown as TweetEntitiesV2,
			},
			includes: {
				users: [
					{
						id: authorId,
						name: 'Test User',
						username: 'testUser',
					},
				],
			},
		};
		const moduleRef = await Test.createTestingModule({
			controllers: [TweetController],
			providers: [
				{
					provide: TweetService,
					useValue: {
						findAllByUserId: jest.fn().mockResolvedValue([]),
						findByIdAndUser: jest.fn().mockResolvedValue(undefined),
						create: jest.fn().mockResolvedValue({}),
					},
				},
				{
					provide: UserService,
					useValue: {
						findById: jest.fn().mockResolvedValue({}),
					},
				},
				{
					provide: TwitterService,
					useValue: {
						findTweetById: jest.fn().mockResolvedValue(twitterApiMockResponse),
					},
				},
				{
					provide: TweetAuthorService,
					useValue: {
						findById: jest.fn().mockResolvedValue({}),
						create: jest.fn().mockResolvedValue({}),
					},
				},
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
		}).compile();

		controller = moduleRef.get(TweetController);
		tweetService = moduleRef.get(TweetService);
		userService = moduleRef.get(UserService);
		twitterService = moduleRef.get(TwitterService);
		authorService = moduleRef.get(TweetAuthorService);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getTweetsByUserToken', () => {
		it('should return tweets', async () => {
			const userId = 'userId';
			const result = await controller.getTweetsByUserToken(userId);
			expect(result).toStrictEqual([]);
			expect(tweetService.findAllByUserId).toBeCalledWith(userId);
		});
	});

	describe('create', () => {
		let requestPayload: StoreTweetRequest;
		let jwtPayload: JwtPayload;
		let tweetId: string;
		beforeEach(() => {
			tweetId = '12345';
			requestPayload = {
				url: `https://twitter.com/user/status/${tweetId}`,
			};
			jwtPayload = {
				sub: 'random-user-id',
				email: 'test@test.com',
			};
		});
		it('should create a new tweet entity', async () => {
			const result = await controller.create(requestPayload, jwtPayload);
			expect(result).toBeUndefined();
			expect(userService.findById).toBeCalledWith(jwtPayload.sub);
			expect(tweetService.findByIdAndUser).toBeCalledWith(tweetId, {});
			expect(twitterService.findTweetById).toBeCalledWith(tweetId);
			expect(authorService.findById).toBeCalledWith(authorId);
			expect(tweetService.create).toHaveBeenCalledWith({
				url: requestPayload.url,
				author: {},
				user: {},
				tweetData: twitterApiMockResponse.data,
			});
		});

		it('should create a new tweet and author entity', async () => {
			authorService.findById = jest.fn().mockResolvedValue(undefined);
			const result = await controller.create(requestPayload, jwtPayload);
			expect(result).toBeUndefined();
			expect(userService.findById).toBeCalledWith(jwtPayload.sub);
			expect(tweetService.findByIdAndUser).toBeCalledWith(tweetId, {});
			expect(twitterService.findTweetById).toBeCalledWith(tweetId);
			expect(authorService.findById).toBeCalledWith(authorId);
			expect(authorService.create).toBeCalled();
			expect(tweetService.create).toHaveBeenCalledWith({
				url: requestPayload.url,
				author: {},
				user: {},
				tweetData: twitterApiMockResponse.data,
			});
		});

		it('should do nothing if the tweet is already stored in the database', async () => {
			tweetService.findByIdAndUser = jest.fn().mockResolvedValue({});
			const result = await controller.create(requestPayload, jwtPayload);
			expect(result).toBeUndefined();
		});

		it('should throw BadRequestException if no user is found', async () => {
			userService.findById = jest.fn().mockResolvedValue(undefined);
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new BadRequestException(UserErrorCodes.USER_NOT_FOUND),
			);
		});

		it('should throw BadRequestException if passed url is not a twitter URL', async () => {
			requestPayload.url = 'https://example.org';
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new BadRequestException(`${TweetErrorCode.UNSUPPORTED_URL_HOST}: example.org`),
			);
		});

		it('should throw BadRequestException if passed url is not a valid twitter status URL', async () => {
			requestPayload.url = 'https://twitter.de/';
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new BadRequestException(TweetErrorCode.INVALID_TWEET_URL),
			);
		});

		it('should throw TwitterApiException if the twitter api did not return a data object', async () => {
			twitterService.findTweetById = jest.fn().mockResolvedValue({
				data: undefined,
			});
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new TwitterApiException(TweetErrorCode.TWITTER_API_DATA_MISSING),
			);
		});

		it('should throw TwitterApiException if the twitter api did not return an includes object', async () => {
			twitterService.findTweetById = jest.fn().mockResolvedValue({
				...twitterApiMockResponse,
				includes: undefined,
			});
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new TwitterApiException(TweetErrorCode.TWITTER_API_INCLUDES_MISSING),
			);
		});

		it('should throw TwitterApiException if the twitter api did not return an entity object', async () => {
			twitterService.findTweetById = jest.fn().mockResolvedValue({
				...twitterApiMockResponse,
				data: {
					entities: undefined,
				},
			});
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new TwitterApiException(TweetErrorCode.TWITTER_API_ENTITIES_MISSING),
			);
		});

		it('should throw TwitterApiException if the twitter api did not return related users object', async () => {
			twitterService.findTweetById = jest.fn().mockResolvedValue({
				...twitterApiMockResponse,
				includes: {
					users: undefined,
				},
			});
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new TwitterApiException(TweetErrorCode.TWITTER_API_RELATED_USERS_MISSING),
			);
		});

		it('should throw TwitterApiException if the twitter api did not return the author of the tweet', async () => {
			twitterService.findTweetById = jest.fn().mockResolvedValue({
				...twitterApiMockResponse,
				includes: {
					users: [],
				},
			});
			await expect(controller.create(requestPayload, jwtPayload)).rejects.toThrowError(
				new TwitterApiException(TweetErrorCode.TWITTER_API_AUTHOR_MISSING),
			);
		});
	});
});
