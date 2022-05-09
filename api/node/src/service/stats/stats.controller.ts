import { NewsHubLogger } from '@common/logger.service';
import { BadRequestException, Controller, Get, Injectable, UseGuards } from '@nestjs/common';
import { TweetAuthorService } from '@tweet/author/tweet.author.service';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';
import { TweetService } from '@tweet/tweet.service';
import { StatsResponse } from '@type/dto/stats';
import { UserService } from '@user/user.service';
import { UserContext } from '../../decorator/user.decorator';
import { AuthGuard } from '../../guard/auth.guard';
import { UserErrorCodes } from '@type/error/user';
import { JwtPayload } from '../auth/auth.service';

interface UserStats {
	value: string | number;
	label: string;
}

@Injectable()
@Controller('stats')
export class StatsController {
	constructor(
		private readonly tweetService: TweetService,
		private readonly oldTweetService: OldTweetService,
		private readonly authorService: TweetAuthorService,
		private readonly userService: UserService,
		private readonly logger: NewsHubLogger,
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
		const topTweeters = await this.oldTweetService.getTopNTweetUsers(10);
		return {
			numberOfTweets,
			numberOfOldTweets,
			numberOfAuthors,
			numberOfUsers,
			topTweeters,
			oldTweetsFrequencyByDay,
		};
	}

	@Get('/me')
	@UseGuards(new AuthGuard())
	async getOwnStats(@UserContext() jwtPayload: JwtPayload): Promise<UserStats[]> {
		const { sub } = jwtPayload;
		const user = await this.userService.findById(sub);
		if (!user) {
			throw new BadRequestException(UserErrorCodes.USER_NOT_FOUND);
		}
		const numberOfCollectedTweets = await this.tweetService.countByUserId(sub);
		return [{ label: 'Collected tweets', value: numberOfCollectedTweets }];
	}
}
