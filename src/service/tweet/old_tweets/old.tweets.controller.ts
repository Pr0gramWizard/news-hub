import { NewsHubLogger } from '@common/logger.service';
import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';
import { LastIdQuery, LimitQuery, OldTweetResponse, OrderQuery } from '@type/dto/old.tweet';
import { OldTweetErrorCode } from '@type/error/old.tweet';

@ApiTags('Tweet')
@Controller('old/tweets')
export class OldTweetController {
	constructor(private readonly oldTweetService: OldTweetService, private readonly logger: NewsHubLogger) {
		this.logger.setContext(OldTweetController.name);
	}

	@Get('/')
	@ApiQuery({ name: 'limit', type: LimitQuery })
	@ApiQuery({ name: 'order', type: OrderQuery })
	@ApiQuery({ name: 'last_id', type: LastIdQuery })
	@ApiOkResponse({ type: OldTweetResponse, description: 'List of old tweets' })
	@ApiBadRequestResponse({ description: 'Invalid query parameter' })
	async getById(
		@Query('limit') limit?: number,
		@Query('order') order = 'asc',
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
		if (lastId && (isNaN(lastIdNumber) || lastIdNumber < 1)) {
			throw new BadRequestException(OldTweetErrorCode.LAST_ID_QUERY_PARAM_INVALID);
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
