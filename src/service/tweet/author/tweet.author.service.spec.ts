import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConsoleLogger } from '@nestjs/common';
import { TweetAuthorService } from './tweet.author.service';
import { Author } from './tweet.author.entity';
import { Repository } from 'typeorm';
import { UserV2 } from 'twitter-api-v2';
import { TwitterApiErrorCode } from '../../../types/error/twitter.api';
import { TwitterApiException } from '../../../types/error/general';
import * as util from '../../../common/util';

describe('WebContentService', () => {
	let service: TweetAuthorService;
	let repository: Repository<Author>;
	const author = new Author({
		userId: '12345',
		bio: 'Author description',
		isVerified: true,
		location: 'de',
		username: 'news-hub',
		numberOfFollower: 3,
		numberOfTweets: 3,
	});

	beforeEach(async () => {
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
					provide: ConsoleLogger,
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
				name: "NewsHub"
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
	});

	describe('count', () => {
		it('should return the length of the list of tweet authors', async () => {
			const result = await service.count();
			expect(result).toBe(1);
			expect(repository.count).toHaveBeenCalled();
		});
	});
});
