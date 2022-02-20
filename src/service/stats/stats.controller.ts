import { ConsoleLogger, Controller, Get, Injectable } from '@nestjs/common';
import { TweetService } from '@tweet/tweet.service';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';
import { TweetAuthorService } from '@tweet/author/tweet.author.service';
import { StatsResponse } from '../../types/dto/stats';
import { UserService } from '@user/user.service';

@Injectable()
@Controller('stats')
export class StatsController {
	constructor(
		private readonly tweetService: TweetService,
		private readonly oldTweetService: OldTweetService,
		private readonly authorService: TweetAuthorService,
		private readonly userService: UserService,
		private readonly logger: ConsoleLogger,
	) {
		this.logger.setContext(StatsController.name);
	}

	@Get('')
	async getStats(): Promise<StatsResponse> {
		const numberOfTweets = await this.tweetService.count();
		const numberOfOldTweets = await this.oldTweetService.count();
		const numberOfAuthors = await this.authorService.count();
		const numberOfUsers = await this.userService.count();
		const oldTweetsFrequencyByDay = await this.oldTweetService.getTweetFrequency();
		const oldTweetsUserGroups = await this.oldTweetService.countUsers();
		const topTweeters = await this.oldTweetService.getTopNTweetUsers(10)
		return {
			numberOfTweets,
			numberOfOldTweets,
			numberOfAuthors,
			numberOfUsers,
			oldTweetsUserGroups,
			topTweeters,
			oldTweetsFrequencyByDay,
		};
	}
}
