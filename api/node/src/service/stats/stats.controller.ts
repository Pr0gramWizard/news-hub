import { NewsHubLogger } from '@common/logger.service';
import { BadRequestException, Controller, Get, Injectable, UseGuards } from '@nestjs/common';
import { TweetAuthorService } from '@tweet/author/tweet.author.service';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';
import { TweetService } from '@tweet/tweet.service';
import { StatsResponse } from '@type/dto/stats';
import { UserErrorCodes } from '@type/error/user';
import { UserService } from '@user/user.service';
import { UserContext } from '../../decorator/user.decorator';
import { AuthGuard } from '../../guard/auth.guard';
import { JwtPayload } from '../auth/auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

class UserStats {
	@ApiProperty()
	@IsNumber()
	value!: number;

	@ApiProperty()
	@IsString()
	label!: string;
}

@Injectable()
@Controller('stats')
@ApiTags('Stats')
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

	@Get('old/tweets')
	@ApiOkResponse({ type: StatsResponse })
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
	@ApiOkResponse({ type: [UserStats] })
	@ApiBearerAuth()
	async getOwnStats(@UserContext() jwtPayload: JwtPayload): Promise<UserStats[]> {
		const { sub } = jwtPayload;
		const user = await this.userService.findById(sub);
		if (!user) {
			throw new BadRequestException(UserErrorCodes.USER_NOT_FOUND);
		}
		const totalTweetsCollected = await this.tweetService.countByUserId(sub);
		const tweetsCollectedInTheLast24Hours = await this.tweetService.countLastDayByUserId(sub);
		const numberOfAuthors = await this.tweetService.countAuthors(sub);
		return [
			{ label: 'Collected tweets', value: totalTweetsCollected },
			{ label: 'Collected tweets in the last 24 hours', value: tweetsCollectedInTheLast24Hours },
			{ label: 'Unique Authors', value: numberOfAuthors },
		];
	}
}
