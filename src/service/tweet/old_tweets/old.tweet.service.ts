import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, LessThan, MoreThan, Repository } from 'typeorm';
import { OldTweet } from './old.tweets.entity';
import {
	OldTweetFrequency,
	OldTweetFrequencyResponse,
	OldTweetsPerUser,
	OldTweetTopTweetersResponse,
	OldTweetUserGroupResponse,
	OldTweetUserGroups,
	OrderParam,
} from '../../../types/dto/old.tweet';
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

	async getTweetFrequency(): Promise<OldTweetFrequencyResponse> {
		const startDateString = new Date('2020-05-23');
		const endDateString = new Date('2020-07-28');
		const allDates = generateAllDatesBetweenTwoDates(startDateString, endDateString);
		// TODO: use a query builder instead of a raw SQL query
		const data = (await this.oldTweetRepository.query(
			`SELECT CASE
                        ${allDates.map((e) => `WHEN created_at LIKE '%${e.date}%' THEN '${e.id}'`).join('\n')}
                        END     CollectionDate,
                    COUNT(*) AS TweetsPerDay
             FROM old_tweets
             GROUP BY 1;`,
		)) as OldTweetFrequency[];
		const labels = data.map((e: OldTweetFrequency) => parseInt(e.CollectionDate, 10));
		const values = data.map((e: OldTweetFrequency) => parseInt(e.TweetsPerDay, 10));
		return { labels, values };
	}

	async getTopNTweetUsers(n: number): Promise<OldTweetTopTweetersResponse> {
		const data = await this.oldTweetRepository
			.createQueryBuilder('ot')
			.select('ot.user_name', 'user_name')
			.addSelect('ot.is_verified', 'is_verified')
			.addSelect('COUNT(*)', 'number_of_tweets')
			.groupBy('ot.user_name')
			.orderBy('number_of_tweets', 'DESC')
			.take(n)
			.getRawMany<OldTweetsPerUser>();
		return {
			numberOfTweets: data.map((e: OldTweetsPerUser) => parseInt(e.number_of_tweets, 10)),
			userNames: data.map((e: OldTweetsPerUser) => e.user_name),
			verifiedStatus: data.map((e: OldTweetsPerUser) => e.is_verified === 'true'),
		};
	}

	async countUsers(): Promise<OldTweetUserGroupResponse> {
		const numberOfUsersGrouped = await this.oldTweetRepository
			.createQueryBuilder('old_tweet')
			.select(
				`CASE
                        WHEN old_tweet.is_verified = 'true' THEN 'Verified'
                        WHEN old_tweet.is_verified = 'false' THEN 'Not Verified'
                        END                   AS Status`,
			)
			.addSelect('COUNT(DISTINCT user_name) AS NumberOfUsers')
			.groupBy('Status')
			.cache(minutesToMilliseconds(60))
			.getRawMany();
		const numberOfUnverifiedUsers = numberOfUsersGrouped.find(
			(e: OldTweetUserGroups) => e.Status === 'Not Verified',
		);
		const numberOfVerifiedUsers = numberOfUsersGrouped.find((e: OldTweetUserGroups) => e.Status === 'Verified');
		return {
			unverified: (numberOfUnverifiedUsers && parseInt(numberOfUnverifiedUsers.NumberOfUsers)) || 0,
			verified: (numberOfVerifiedUsers && parseInt(numberOfVerifiedUsers.NumberOfUsers)) || 0,
		};
	}
}
