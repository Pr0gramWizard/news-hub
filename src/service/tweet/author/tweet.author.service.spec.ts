import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TweetAuthorService } from './tweet.author.service';
import { Author } from './tweet.author.entity';
import { Repository } from 'typeorm';
import { UserV2 } from 'twitter-api-v2';
import { TwitterApiErrorCode } from '@type/error/twitter.api';
import { TwitterApiException } from '@type/error/general';
import * as util from '@common/util';
import { NewsHubLogger } from '@common/logger.service';

describe('WebContentService', () => {
	let service: TweetAuthorService;
	let repository: Repository<Author>;
	let author: Author;

	beforeEach(async () => {
		author = new Author({
			userId: '12345',
			bio: 'Author description',
			isVerified: true,
			location: 'de',
			username: 'news-hub',
			numberOfFollower: 3,
			numberOfTweets: 3,
		});
		const moduleRef = await Test.createTestingModule({
			providers: [
				TweetAuthorService,
				{
					provide: getRepositoryToken(Author),
					useValue: {
						findOne: jest.fn().mockResolvedValue(author),
						save: jest.fn().mockResolvedValue(author),
						count: jest.fn().mockResolvedValue(1),
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

		service = moduleRef.get(TweetAuthorService);
		repository = moduleRef.get(getRepositoryToken(Author));
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findById', () => {
		it('should return an author if found', async () => {
			const params = '1';
			const result = await service.findById(params);
			expect(result).toEqual(author);
			expect(repository.findOne).toHaveBeenCalledWith(params);
		});

		it('should return undefined if no author was found', async () => {
			repository.findOne = jest.fn().mockResolvedValue(undefined);
			const params = '1';
			const result = await service.findById(params);
			expect(result).toEqual(undefined);
			expect(repository.findOne).toHaveBeenCalledWith(params);
		});
	});

	describe('create', () => {
		let params: UserV2;
		beforeEach(() => {
			params = {
				id: author.id,
				description: author.bio,
				verified: author.isVerified,
				location: author.location,
				username: author.username,
				public_metrics: {
					followers_count: author.numberOfFollowers,
					tweet_count: author.numberOfTweets,
				},
				name: 'NewsHub',
			};
		});
		it('should return an author if created', async () => {
			const result = await service.create(params);
			expect(result).toEqual(author);
			expect(repository.save).toHaveBeenCalledWith(author);
		});

		it('should throw an error if no public metric is provided', async () => {
			jest.spyOn(util, 'isUndefinedOrEmptyObject').mockReturnValue(true);
			await expect(service.create(params)).rejects.toThrowError(
				new TwitterApiException(TwitterApiErrorCode.NO_PUBLIC_METRIC),
			);
		});

		it('should use default value if no follower count is passed', async () => {
			params = {
				...params,
				public_metrics: {
					...params.public_metrics,
					followers_count: undefined,
				},
			};
			const result = await service.create(params);
			author.numberOfFollowers = 0;
			expect(result).toEqual(author);
			expect(repository.save).toHaveBeenCalledWith(author);
		});

		it('should use default value if no tweet count is passed', async () => {
			params = {
				...params,
				public_metrics: {
					...params.public_metrics,
					tweet_count: undefined,
				},
			};
			const result = await service.create(params);
			author.numberOfTweets = 0;
			expect(result).toEqual(author);
			expect(repository.save).toHaveBeenCalledWith(author);
		});
	});

	describe('count', () => {
		it('should return the length of the list of tweet authors', async () => {
			const result = await service.count();
			expect(result).toBe(1);
			expect(repository.count).toHaveBeenCalled();
		});
	});
});
