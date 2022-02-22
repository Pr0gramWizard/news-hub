import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NewsHubLogger } from '../../../common/logger.service';
import { OldTweetResponse } from '../../../types/dto/old.tweet';
import { OldTweetErrorCode } from '../../../types/error/old.tweet';
import { OldTweetService } from './old.tweet.service';
import { OldTweetController } from './old.tweets.controller';
import { OldTweet } from './old.tweets.entity';

describe('OldTweetController', () => {
	let controller: OldTweetController;
	let oldTweetService: OldTweetService;
	const oldTweet = new OldTweet();
	oldTweet.id = '1';
	const listOfOldTweets: OldTweet[] = [oldTweet, oldTweet];
	const totalNumberOfTweets = 10;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [OldTweetController],
			providers: [
				{
					provide: OldTweetService,
					useValue: {
						findSome: jest.fn().mockResolvedValue({
							result: listOfOldTweets,
							totalNumberOfTweets,
						}),
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

		controller = moduleRef.get(OldTweetController);
		oldTweetService = moduleRef.get(OldTweetService);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getById', () => {
		let expectedResponse: OldTweetResponse;
		beforeEach(() => {
			expectedResponse = {
				tweets: listOfOldTweets,
				totalNumberOfTweets,
				lastId: oldTweet.id,
			};
		});

		it('should return an array of tweets (no params)', async () => {
			const result = await controller.getById();
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(10, 'asc', 0);
		});

		it('should return an array of tweets (limit)', async () => {
			const result = await controller.getById(1);
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(1, 'asc', 0);
		});

		it('should return an array of tweets (limit, order = "desc")', async () => {
			const result = await controller.getById(1, 'desc');
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(1, 'desc', 0);
		});

		it('should return an array of tweets (limit, order = "asc")', async () => {
			const result = await controller.getById(1, 'asc');
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(1, 'asc', 0);
		});

		it('should return an array of tweets (limit, order, lastId)', async () => {
			const result = await controller.getById(1, 'desc', '10');
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(1, 'desc', 10);
		});

		it('should return null for lastId if the result is empty (no params)', async () => {
			oldTweetService.findSome = jest.fn().mockResolvedValue({
				result: [],
				totalNumberOfTweets,
			});
			expectedResponse.lastId = null;
			const result = await controller.getById();
			expect(result).toStrictEqual({
				tweets: [],
				totalNumberOfTweets,
				lastId: null,
			});
			expect(oldTweetService.findSome).toHaveBeenCalledWith(10, 'asc', 0);
		});

		it('should throw an error for limit > 100', async () => {
			await expect(controller.getById(500)).rejects.toThrowError(
				new BadRequestException(OldTweetErrorCode.LIMIT_QUERY_PARAM_TOO_BIG),
			);
		});

		it('should throw an error if the order is not "asc" or "desc"', async () => {
			await expect(controller.getById(60, 'test')).rejects.toThrowError(
				new BadRequestException(OldTweetErrorCode.ORDER_QUERY_PARAM_INVALID),
			);
		});

		it('should throw an error if lastId is not a valid number', async () => {
			await expect(controller.getById(60, 'asc', 'not-a-number')).rejects.toThrowError(
				new BadRequestException(OldTweetErrorCode.LAST_ID_QUERY_PARAM_INVALID),
			);
		});

		it('should throw an error if lastId is 0', async () => {
			await expect(controller.getById(60, 'asc', '0')).rejects.toThrowError(
				new BadRequestException(OldTweetErrorCode.LAST_ID_QUERY_PARAM_INVALID),
			);
		});

		it('should throw an error if lastId is negative', async () => {
			await expect(controller.getById(60, 'asc', '-1651')).rejects.toThrowError(
				new BadRequestException(OldTweetErrorCode.LAST_ID_QUERY_PARAM_INVALID),
			);
		});
	});
});
