import { BadRequestException, ConsoleLogger, Controller, Get, Query } from '@nestjs/common';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LastIdQuery, LimitQuery, OldTweetResponse, OrderParam, OrderQuery } from '../../../types/dto/old.tweet';
import { OldTweetErrorCode } from '@error/old.tweet';

@ApiTags('Tweet')
@Controller('old/tweets')
export class OldTweetController {
	constructor(private readonly oldTweetService: OldTweetService, private readonly logger: ConsoleLogger) {
		this.logger.setContext(OldTweetController.name);
	}

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
			throw new BadRequestException(OldTweetErrorCode.LIMIT_QUERY_PARAM_TOO_BIG);
		}
		if (order !== 'asc' && order !== 'desc') {
			throw new BadRequestException(OldTweetErrorCode.ORDER_QUERY_PARAM_INVALID);
		}
		const lastIdQuery = lastId || '0';
		const lastIdNumber = parseInt(lastIdQuery, 10);

		if (lastId) {
			if (!isNaN(lastIdNumber) && lastIdNumber < 1) {
				throw new BadRequestException('Last id must be an integer greater than 0');
			}
		}
		const { result, totalNumberOfTweets } = await this.oldTweetService.findSome(limitQuery, order, lastIdNumber);
		const lastTweet = result[result.length - 1];
		return {
			tweets: result,
			lastId: lastTweet ? lastTweet.id : null,
			totalNumberOfTweets,
		};
	}
}
