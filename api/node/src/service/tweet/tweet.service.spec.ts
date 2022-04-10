import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsHubLogger } from '@common/logger.service';
import { Tweet } from './tweet.entity';
import { TweetService } from './tweet.service';
import { User } from '../user/user.entity';
import { CreateTweet } from '../../types/dto/tweet';
import { TweetEntitiesV2 } from 'twitter-api-v2/dist/types/v2/tweet.definition.v2';
import { Author } from './author/tweet.author.entity';
import { TwitterApiException } from '../../types/error/general';
import { TweetErrorCode } from '../../types/error/tweet';

describe('TweetService', () => {
	let service: TweetService;
	let repository: Repository<Tweet>;
	const tweets: Tweet[] = [new Tweet(), new Tweet()];

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				TweetService,
				{
					provide: getRepositoryToken(Tweet),
					useValue: {
						findOne: jest.fn().mockResolvedValue(tweets[0]),
						find: jest.fn().mockResolvedValue(tweets),
						save: jest.fn().mockResolvedValue(tweets[0]),
						count: jest.fn().mockResolvedValue(tweets.length),
					},
				},
				{
					provide: NewsHubLogger,
					useValue: {
						setContext: jest.fn(),
					},
				},
			],
		}).compile();

		service = moduleRef.get(TweetService);
		repository = moduleRef.get(getRepositoryToken(Tweet));
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findByIdAndUser', () => {
		it('should return a tweet', async () => {
			const tweet = await service.findByIdAndUser('testId', new User());
			expect(tweet).toBe(tweets[0]);
			expect(repository.findOne).toHaveBeenCalledWith({ id: 'testId', user: new User() });
		});
	});

	describe('create', () => {
		let createParams: CreateTweet;
		beforeEach(() => {
			createParams = {
				url: 'https://twitter.com/test/status/123',
				tweetData: {
					id: '123',
					text: 'test',
					created_at: '2020-01-01',
					lang: 'de',
					public_metrics: {
						reply_count: 1,
						retweet_count: 2,
						like_count: 10,
						quote_count: 3,
					},
					entities: {
						hashtags: [
							{
								tag: 'test',
								start: 10,
								end: 14,
							},
						],
					} as TweetEntitiesV2,
				},
				author: new Author(),
				user: new User(),
			};
		});
		it('should create a tweet', async () => {
			const tweet = await service.create(createParams);
			expect(tweet).toBe(tweets[0]);
		});

		it('should throw an error if no public metric is provided', async () => {
			delete createParams.tweetData.public_metrics;
			await expect(service.create(createParams)).rejects.toThrowError(
				new TwitterApiException(TweetErrorCode.TWITTER_API_PUBLIC_METRICS_MISSING),
			);
		});

		it('should throw an error if no entities are provided', async () => {
			delete createParams.tweetData.entities;
			await expect(service.create(createParams)).rejects.toThrowError(
				new TwitterApiException(TweetErrorCode.TWITTER_API_ENTITIES_MISSING),
			);
		});
	});

	describe('finAllByUserId', () => {
		it('should return all tweets for a given user', async () => {
			const tweets = await service.findAllByUserId('testId');
			expect(tweets).toBe(tweets);
			expect(repository.find).toHaveBeenCalledWith({
				where: { user: { id: 'testId' } },
				relations: ['author', 'hashtags', 'webContents'],
			});
		});
	});

	describe('count', () => {
		it('should return the number of tweets for a given user', async () => {
			const count = await service.count();
			expect(count).toBe(tweets.length);
			expect(repository.count).toHaveBeenCalled();
		});
	});
});
