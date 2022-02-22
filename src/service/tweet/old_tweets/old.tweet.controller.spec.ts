import { Test } from '@nestjs/testing';
import { BadRequestException, ConsoleLogger } from '@nestjs/common';
import { OldTweetController } from './old.tweets.controller';
import { OldTweetService } from './old.tweet.service';
import {OldTweetResponse, OrderParam} from '../../../types/dto/old.tweet';
import { OldTweet } from './old.tweets.entity';
import { OldTweetErrorCode } from '../../../types/error/old.tweet';

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

		it('should return an array of tweets (limit)', async () => {
			const result = await controller.getById(1);
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(1, 'asc', 0);
		});

		it('should return an array of tweets (limit, order)', async () => {
			const result = await controller.getById(1, 'desc');
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(1, 'desc', 0);
		});

		it('should return an array of tweets (limit, order, lastId)', async () => {
			const result = await controller.getById(1, 'desc', '10');
			expect(result).toStrictEqual(expectedResponse);
			expect(oldTweetService.findSome).toHaveBeenCalledWith(1, 'desc', 10);
		});

		it('should throw an error for limit > 100', async () => {
			await expect(controller.getById(500)).rejects.toThrowError(
				new BadRequestException(OldTweetErrorCode.LIMIT_QUERY_PARAM_TOO_BIG),
			);
		});

		it('should throw an error if the order is not "asc" or "desc"', async () => {
			await expect(controller.getById(60, 'test' as OrderParam)).rejects.toThrowError(
				new BadRequestException(OldTweetErrorCode.ORDER_QUERY_PARAM_INVALID),
			);
		});
	});
});
