import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTweet, TweetProps, TweetResponse } from '@type/dto/tweet';
import { TwitterApiException } from '@type/error/general';
import { TweetErrorCode } from '@type/error/tweet';
import { User } from '@user/user.entity';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { URL } from 'url';
import { Tweet, TweetType } from './tweet.entity';

export interface TweetLink {
	fullUrl: string;
	urlDomain: string;
}

@Injectable()
export class TweetService {
	constructor(
		@InjectRepository(Tweet)
		private readonly tweetRepository: Repository<Tweet>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(TweetService.name);
	}

	async findAll(): Promise<Tweet[]> {
		return await this.tweetRepository.find();
	}

	async findByIdAndUser(id: string, user: User): Promise<Tweet | undefined> {
		return this.tweetRepository.findOne({ id, user });
	}

	async findByTweetIdAndUser(id: string, user: User): Promise<Tweet | undefined> {
		return this.tweetRepository.findOne({ tweetId: id, user });
	}

	async addTweetType(tweet: Tweet, tweetType: TweetType): Promise<Tweet> {
		tweet.type = [...tweet.type, tweetType];
		return this.tweetRepository.save(tweet);
	}

	async create({ url, tweetData, author, user, type }: CreateTweet): Promise<Tweet> {
		const { public_metrics, text, id, lang, entities } = tweetData;
		if (!public_metrics) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_PUBLIC_METRICS_MISSING);
		}
		if (!entities) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_ENTITIES_MISSING);
		}
		const { retweet_count, like_count, reply_count, quote_count } = public_metrics;
		const tweetParams: TweetProps = {
			language: lang,
			totalQuotes: quote_count,
			totalComments: reply_count,
			likes: like_count,
			retweets: retweet_count,
			tweetId: id,
			text,
			user,
			author,
			url,
			type,
		};
		const tweet = new Tweet(tweetParams);
		return await this.tweetRepository.save(tweet);
	}

	async findAllByUserId(id: string): Promise<TweetResponse[]> {
		return this.tweetRepository.find({ where: { user: { id } }, relations: ['author', 'hashtags'] });
	}

	async countByUserId(id: string): Promise<number> {
		return this.tweetRepository.count({ where: { user: { id } } });
	}

	async countLastDayByUserId(id: string): Promise<number> {
		const today = new Date();
		const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
		const x = await this.tweetRepository
			.createQueryBuilder('tweet')
			.select('COUNT(*)', 'count')
			.where(
				`user_id = '${id}' AND created_at BETWEEN '${yesterday.toISOString()}' AND '${today.toISOString()}'`,
			);
		const result = await x.getRawOne();
		return result.count;
	}

	getLinksFromTweet(urls: TweetEntityUrlV2[]): TweetLink[] {
		return urls.map((url) => {
			const urlToCheck = url.unwound_url || url.expanded_url || url.url;
			const urlDomain = new URL(urlToCheck).hostname;
			const urlDomainWithoutSubdomain = urlDomain.indexOf('www') === 0 ? urlDomain.substring(4) : urlDomain;
			return {
				fullUrl: urlToCheck,
				urlDomain: urlDomainWithoutSubdomain,
			};
		});
	}

	async countAuthors(id: string): Promise<number> {
		const result = await this.tweetRepository.query(
			`SELECT COUNT(DISTINCT author_id) as 'count' FROM tweet WHERE user_id = '${id}'`,
		);
		return result[0].count;
	}

	async count(): Promise<number> {
		return this.tweetRepository.count();
	}
}
