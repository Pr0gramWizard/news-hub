import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTweet, PaginatedTweetResponse, TweetProps, TweetQueryParameter } from '@type/dto/tweet';
import { InternalServerException, TwitterApiException } from '@type/error/general';
import { TweetErrorCode } from '@type/error/tweet';
import { User } from '@user/user.entity';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { FindManyOptions, Like, Repository } from 'typeorm';
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

	async findPaginated(queryParameter: TweetQueryParameter, userId?: string): Promise<PaginatedTweetResponse> {
		const page = queryParameter?.page || 1;
		const limit = queryParameter?.limit || 20;
		const offset = (page - 1) * limit;
		const order = queryParameter?.order || 'DESC';
		const orderBy = queryParameter?.sort || 'seenAt';
		const searchTerm = queryParameter?.searchTerm;

		const whereOptions: FindManyOptions<Tweet> = {
			relations: ['author', 'hashtags', 'articles', 'articles.newsPage'],
			order: { [orderBy]: order },
			skip: offset,
			take: limit,
		};
		// TODO: Refactor this
		if (searchTerm) {
			if (searchTerm.startsWith('author:')) {
				whereOptions.where = {
					author: { username: Like(`%${searchTerm.split(':')[1]}%`) },
				};
			} else if (searchTerm.startsWith('lang:') || searchTerm.startsWith('language:')) {
				whereOptions.where = {
					language: Like(`%${searchTerm.split(':')[1]}%`),
				};
			} else if (searchTerm.startsWith('verified:')) {
				const verifiedStatus = searchTerm.split(':')[1] === 'true';
				whereOptions.where = {
					author: {
						isVerified: verifiedStatus,
					},
				};
			} else {
				whereOptions.where = {
					text: Like(`%${searchTerm}%`),
				};
			}
		}
		if (userId) {
			whereOptions.where = {
				...(whereOptions.where as object),
				user: { id: userId },
			};
		}
		const [tweets, total] = await this.tweetRepository.findAndCount(whereOptions);
		return { tweets, total };
	}

	async findByIdAndUser(id: string, user: User) {
		return this.tweetRepository.findOne({
			where: {
				id,
				user: {
					id: user.id,
				},
			},
			relations: ['author', 'hashtags', 'articles', 'articles.newsPage'],
		});
	}

	async findAll(): Promise<Tweet[]> {
		return this.tweetRepository.find();
	}

	async findById(id: string) {
		return this.tweetRepository.findOne({
			where: {
				id,
			},
			relations: ['author', 'hashtags', 'articles', 'articles.newsPage'],
		});
	}

	async findAllNewsRelatedTweetsByUser(user: User): Promise<Tweet[]> {
		return this.tweetRepository.find({
			where: {
				user: {
					id: user.id,
				},
				isNewsRelated: true,
			},
			relations: ['author', 'hashtags', 'articles', 'articles.newsPage'],
		});
	}

	async findByTweetIdAndUser(id: string, user: User) {
		return this.tweetRepository.findOne({
			where: {
				tweetId: id,
				user: {
					id: user.id,
				},
			},
		});
	}

	async addTweetType(tweet: Tweet, tweetType: TweetType): Promise<Tweet> {
		tweet.type = [...tweet.type, tweetType];
		return this.tweetRepository.save(tweet);
	}

	async create({ url, tweetData, author, user, type }: CreateTweet): Promise<Tweet> {
		const { public_metrics, text, id, lang, entities, created_at } = tweetData;
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
			entities,
			isNewsRelated: type.length > 1,
			seenAt: new Date(),
			createdAt: created_at ? new Date(created_at) : new Date(),
		};
		const tweet = new Tweet(tweetParams);
		return await this.tweetRepository.save(tweet);
	}

	async findAllByUserId(id: string, queryParameter: TweetQueryParameter): Promise<PaginatedTweetResponse> {
		return this.findPaginated(queryParameter, id);
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

	async setUserClassification(id: string, classification: TweetType[]): Promise<void> {
		const updateResult = await this.tweetRepository.update({ id }, { userClassification: classification });
		if (updateResult.affected === 0) {
			this.logger.debug(updateResult);
			throw new InternalServerException();
		}
	}
}
