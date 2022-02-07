import { BadRequestException, ConsoleLogger, Controller, Get, Query } from '@nestjs/common';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LastIdQuery, LimitQuery, OldTweetResponse, OrderParam, OrderQuery } from '../../../types/dto/old.tweet';

@ApiTags('Tweet')
@Controller('old/tweets')
export class OldTweetController {
	private readonly logger = new ConsoleLogger(OldTweetController.name);

	constructor(private readonly oldTweetService: OldTweetService) {}

	@Get('/')
	@ApiQuery({ name: 'limit', type: LimitQuery })
	@ApiQuery({ name: 'order', type: OrderQuery })
	@ApiQuery({ name: 'last_id', type: LastIdQuery })
	@ApiOkResponse({ type: OldTweetResponse, description: 'List of old tweets' })
	@ApiBadRequestResponse({ description: 'Invalid query parameter' })
	async getById(
		@Query('limit') limit: number,
		@Query('order') order: OrderParam = 'asc',
		@Query('last_id') lastId?: string,
	): Promise<OldTweetResponse> {
		const limitQuery = limit || 10;
		if (limitQuery > 100) {
			throw new BadRequestException('Limit must be less equal than 100');
		}
		const lastIdQuery = lastId || '0';
		if (order !== 'asc' && order !== 'desc') {
			throw new BadRequestException(`Order must be 'asc' or 'desc'`);
		}
		const lastIdNumber = parseInt(lastIdQuery, 10);

		if (lastId) {
			if (!isNaN(lastIdNumber) && lastIdNumber < 1) {
				throw new BadRequestException('Last id must be an integer greater than 0');
			}
		}
		this.logger.log(`getById: Find ${limitQuery} tweets after last id ${lastIdQuery}`);
		const tweets = await this.oldTweetService.findSome(limitQuery, order, lastIdNumber);
		const lastTweet = tweets[tweets.length - 1];
		return {
			tweets,
			lastId: lastTweet ? lastTweet.id : null,
		};
	}

	@Get('/stats')
	async getStats(): Promise<any> {
		return this.oldTweetService.getTweetFrequency();
	}
}
