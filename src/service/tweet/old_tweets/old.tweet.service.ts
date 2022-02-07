import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, LessThan, MoreThan, Repository } from 'typeorm';
import { OldTweet } from './old.tweets.entity';
import { OrderParam } from '../../../types/dto/old.tweet';
import { generateAllDatesBetweenTwoDates, minutesToMilliseconds } from '@common/util';

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

	async count(): Promise<number> {
		return await this.oldTweetRepository.count({ cache: minutesToMilliseconds(60) });
	}

	async getTweetFrequency(): Promise<any> {
		const startDateString = new Date('2020-05-23');
		const endDateString = new Date('2020-07-28');
		const allDates = generateAllDatesBetweenTwoDates(startDateString, endDateString);
		const data = await this.oldTweetRepository.query(
			`SELECT CASE
                        ${allDates.map((e) => `WHEN created_at LIKE '%${e.date}%' THEN '${e.name}'`).join('\n')}
                        END     DateRange,
                    COUNT(*) AS TweetsPerDay
             FROM old_tweets
             GROUP BY 1;`,
		);
		return data;
		// const tweets = await this.oldTweetRepository.createQueryBuilder('q').
		// return tweets.length;
	}
}
