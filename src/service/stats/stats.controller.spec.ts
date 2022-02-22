import { Test } from '@nestjs/testing';
import { StatsResponse } from '@type/dto/stats';
import { TweetAuthorService } from '../tweet/author/tweet.author.service';
import { OldTweetService } from '../tweet/old_tweets/old.tweet.service';
import { TweetService } from '../tweet/tweet.service';
import { UserService } from '../user/user.service';
import { NewsHubLogger } from '@common/logger.service';
import { StatsController } from './stats.controller';

describe('StatsController', () => {
	let controller: StatsController;
	let userService: UserService;
	let tweetService: TweetService;
	let oldTweetService: OldTweetService;
	let authorService: TweetAuthorService;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [StatsController],
			providers: [
				{
					provide: TweetService,
					useValue: {
						count: jest.fn().mockResolvedValue(1),
					},
				},
				{
					provide: OldTweetService,
					useValue: {
						count: jest.fn().mockResolvedValue(1),
						countUsers: jest.fn().mockResolvedValue({ unverified: 1, verified: 2 }),
						getTweetFrequency: jest.fn().mockResolvedValue({ labels: [1], values: [1] }),
						getTopNTweetUsers: jest.fn().mockResolvedValue({
							userNames: ['Bob'],
							numberOfTweets: [10],
							verifiedStatus: [true],
						}),
					},
				},
				{
					provide: TweetAuthorService,
					useValue: {
						count: jest.fn().mockResolvedValue(1),
					},
				},
				{
					provide: UserService,
					useValue: {
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

		controller = moduleRef.get(StatsController);
		userService = moduleRef.get(UserService);
		tweetService = moduleRef.get(TweetService);
		oldTweetService = moduleRef.get(OldTweetService);
		authorService = moduleRef.get(TweetAuthorService);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getStats', () => {
		it('should return stats', async () => {
			const expectedResult: StatsResponse = {
				numberOfAuthors: 1,
				numberOfTweets: 1,
				numberOfOldTweets: 1,
				numberOfUsers: 1,
				oldTweetsUserGroups: { unverified: 1, verified: 2 },
				oldTweetsFrequencyByDay: { labels: [1], values: [1] },
				topTweeters: {
					userNames: ['Bob'],
					numberOfTweets: [10],
					verifiedStatus: [true],
				},
			};
			const result = await controller.getStats();
			expect(result).toStrictEqual(expectedResult);
			expect(userService.count).toHaveBeenCalledTimes(1);
			expect(tweetService.count).toHaveBeenCalledTimes(1);
			expect(authorService.count).toHaveBeenCalledTimes(1);
			expect(oldTweetService.count).toHaveBeenCalledTimes(1);
			expect(oldTweetService.countUsers).toHaveBeenCalledTimes(1);
			expect(oldTweetService.getTweetFrequency).toHaveBeenCalledTimes(1);
			expect(oldTweetService.getTopNTweetUsers).toHaveBeenCalledWith(10);
		});
	});
});
