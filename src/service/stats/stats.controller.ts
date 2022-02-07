import { ConsoleLogger, Controller, Get, Injectable } from '@nestjs/common';
import { TweetService } from '@tweet/tweet.service';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';
import { TweetAuthorService } from '@tweet/author/tweet.author.service';
import { StatsResponse } from '../../types/dto/stats';
import { UserService } from '@user/user.service';

@Injectable()
@Controller('stats')
export class StatsController {
	private readonly logger = new ConsoleLogger(StatsController.name);

	constructor(
		private readonly tweetService: TweetService,
		private readonly oldTweetService: OldTweetService,
		private readonly authorService: TweetAuthorService,
		private readonly userService: UserService,
	) {}

	@Get('')
	async getStats(): Promise<StatsResponse> {
		this.logger.log('Getting stats');
		const numberOfTweets = await this.tweetService.count();
		const numberOfOldTweets = await this.oldTweetService.count();
		const numberOfAuthors = await this.authorService.count();
		const numberOfUsers = await this.userService.count();
		return {
			numberOfTweets,
			numberOfOldTweets,
			numberOfAuthors,
			numberOfUsers,
			numberOfHashtags: 0,
			numberOfLanguages: 0,
			numberOfVerifiedUsers: 0,
			oldTweetGroupedByMonth: [],

		};
	}
}
