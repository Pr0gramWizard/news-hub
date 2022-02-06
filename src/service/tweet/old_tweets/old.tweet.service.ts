import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, LessThan, MoreThan, Repository } from 'typeorm';
import { OldTweet } from './old.tweets.entity';
import { OrderParam } from '../../../types/dto/old.tweet';

@Injectable()
export class OldTweetService {
	private readonly logger = new ConsoleLogger(OldTweetService.name);

	constructor(
		@InjectRepository(OldTweet)
		private readonly oldTweetRepository: Repository<OldTweet>,
	) {}

	async findSome(limit: number, order: OrderParam, lastId?: number): Promise<OldTweet[]> {
		const params: FindManyOptions<OldTweet> = {
			order: {
				id: order === 'asc' ? 'ASC' : 'DESC',
			},
			take: limit,
		};
		if (lastId) {
			if (order === 'asc') {
				params.where = {
					id: MoreThan(lastId),
				};
			} else {
				params.where = {
					id: LessThan(lastId),
				};
			}
		}
		this.logger.log(`Fetching ${limit} old tweets with last id ${lastId} and sorted by ${order}`);
		return await this.oldTweetRepository.find(params);
	}
}
