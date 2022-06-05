import { NewsHubLogger } from '@common/logger.service';
import { Controller, Get, Injectable } from '@nestjs/common';
import { TweetService } from '@tweet/tweet.service';
import { UserService } from '@user/user.service';
import { UserContext } from '../../decorator/user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorator/auth.decorator';
import { UserStats } from '@type/dto/stats';

@Injectable()
@Controller('stats')
@ApiTags('Stats')
export class StatsController {
	constructor(
		private readonly tweetService: TweetService,
		private readonly userService: UserService,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(StatsController.name);
	}

	@Get('/me')
	@Auth()
	@ApiOkResponse({ type: [UserStats] })
	async getOwnStats(@UserContext() jwtPayload: JwtPayload): Promise<UserStats[]> {
		const { sub } = jwtPayload;
		const user = await this.userService.findByIdOrFail(sub);
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
