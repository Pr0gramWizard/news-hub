import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OldTweetService } from './old.tweet.service';
import { FindManyOptions, LessThan, MoreThan, Repository } from 'typeorm';
import { NewsHubLogger } from '@common/logger.service';
import { OldTweet } from './old.tweets.entity';
import * as util from '../../../common/util';
import { OldTweetTopTweetersResponse } from '../../../types/dto/old.tweet';

describe('OldTweetService', () => {
	let service: OldTweetService;
	let repository: Repository<OldTweet>;
	const oldTweet: OldTweet = new OldTweet();
	const totalNumberOfTweets = 10;
	const topTweeters = [
		{
			number_of_tweets: 1,
			user_name: 'test',
			is_verified: 'true',
		},
		{
			number_of_tweets: 9,
			user_name: 'test2',
			is_verified: 'false',
		},
	];

	const tweetFrequency = [
		{ CollectionDate: '100', TweetsPerDay: '10' },
		{ CollectionDate: '101', TweetsPerDay: '20' },
	];

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				OldTweetService,
				{
					provide: getRepositoryToken(OldTweet),
					useValue: {
						find: jest.fn().mockResolvedValue([oldTweet]),
						save: jest.fn().mockResolvedValue(oldTweet),
						count: jest.fn().mockResolvedValue(totalNumberOfTweets),
						query: jest.fn().mockResolvedValue(tweetFrequency),
						createQueryBuilder: jest.fn().mockReturnValue({
							select: jest.fn().mockReturnThis(),
							where: jest.fn().mockReturnThis(),
							orderBy: jest.fn().mockReturnThis(),
							addSelect: jest.fn().mockReturnThis(),
							groupBy: jest.fn().mockReturnThis(),
							take: jest.fn().mockReturnThis(),
							getRawMany: jest.fn().mockResolvedValue(topTweeters),
						}),
					},
				},
				{
					provide: NewsHubLogger,
					useValue: {
						setContext: jest.fn(),
						log: jest.fn(),
					},
				},
			],
		}).compile();

		service = moduleRef.get(OldTweetService);
		repository = moduleRef.get(getRepositoryToken(OldTweet));
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findSome', () => {
		let params: FindManyOptions<OldTweet>;
		beforeEach(() => {
			params = {
				order: {
					id: 'ASC',
				},
				take: 1,
				where: {},
			};
		});
		it('should return some old tweets (limit, order = "asc")', async () => {
			const result = await service.findSome(1, 'asc');
			expect(result).toStrictEqual({
				result: [oldTweet],
				totalNumberOfTweets,
			});
			expect(repository.find).toHaveBeenCalledWith(params);
			expect(repository.count).toHaveBeenCalledWith({
				where: params.where,
			});
		});

		it('should return some old tweets (limit, order = "desc")', async () => {
			params = {
				...params,
				order: {
					id: 'DESC',
				},
			};
			const result = await service.findSome(1, 'desc');
			expect(result).toStrictEqual({
				result: [oldTweet],
				totalNumberOfTweets,
			});
			expect(repository.find).toHaveBeenCalledWith(params);
			expect(repository.count).toHaveBeenCalledWith({
				where: params.where,
			});
		});

		it('should return some old tweets (limit, order = "asc", lastId)', async () => {
			const lastId = 10;
			params = {
				...params,
				where: {
					id: MoreThan(lastId),
				},
			};
			const result = await service.findSome(1, 'asc', lastId);
			expect(result).toStrictEqual({
				result: [oldTweet],
				totalNumberOfTweets,
			});
			expect(repository.find).toHaveBeenCalledWith(params);
			expect(repository.count).toHaveBeenCalledWith({
				where: params.where,
			});
		});

		it('should return some old tweets (limit, order = "desc", lastId)', async () => {
			const lastId = 10;
			params = {
				...params,
				order: {
					id: 'DESC',
				},
				where: {
					id: LessThan(lastId),
				},
			};
			const result = await service.findSome(1, 'desc', lastId);
			expect(result).toStrictEqual({
				result: [oldTweet],
				totalNumberOfTweets,
			});
			expect(repository.find).toHaveBeenCalledWith(params);
			expect(repository.count).toHaveBeenCalledWith({
				where: params.where,
			});
		});
	});

	describe('count', () => {
		it('should return the number of old tweets', async () => {
			const result = await service.count();
			expect(result).toStrictEqual(totalNumberOfTweets);
			expect(repository.count).toHaveBeenCalledWith({
				cache: 60 * 60 * 1000,
			});
		});
	});

	describe('getTweetFrequency', () => {
		it('should return the number of old tweets', async () => {
			const dates = [
				{ id: 1, date: '2020-05-23' },
				{ id: 2, date: '2020-05-24' },
			];
			jest.spyOn(util, 'generateAllDatesBetweenTwoDates').mockReturnValue(dates);
			const result = await service.getTweetFrequency();
			expect(result).toStrictEqual({
				labels: tweetFrequency.map((e) => parseInt(e.CollectionDate, 10)),
				values: tweetFrequency.map((e) => parseInt(e.TweetsPerDay, 10)),
			});
			expect(repository.query)
				.toHaveBeenCalledWith(`SELECT CASE WHEN created_at LIKE '%2020-05-23%' THEN '1'\nWHEN created_at LIKE '%2020-05-24%' THEN '2'
                        END     CollectionDate,
                    COUNT(*) AS TweetsPerDay
             FROM old_tweets
             GROUP BY 1;`);
		});
	});

	describe('getTopNTweetUsers', () => {
		it('should return OldTweetTopTweetersResponse', async () => {
			const expectedResult: OldTweetTopTweetersResponse = {
				numberOfTweets: [1, 9],
				userNames: ['test', 'test2'],
				verifiedStatus: [true, false],
			};

			const result = await service.getTopNTweetUsers(10);
			expect(result).toStrictEqual(expectedResult);
			expect(repository.createQueryBuilder().take).toHaveBeenCalledWith(10);
		});
	});
});
