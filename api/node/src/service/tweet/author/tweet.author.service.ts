import { NewsHubLogger } from '@common/logger.service';
import { isUndefinedOrEmptyObject } from '@common/util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorWithCount, CreateAuthor } from '@type/dto/author';
import { TwitterApiException } from '@type/error/general';
import { TwitterApiErrorCode } from '@type/error/twitter.api';
import { UserV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { Author } from './tweet.author.entity';

@Injectable()
export class TweetAuthorService {
	constructor(
		@InjectRepository(Author)
		private readonly authorRepository: Repository<Author>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(TweetAuthorService.name);
	}

	async findById(id: string) {
		return this.authorRepository.findOne({
			where: {
				id,
			},
		});
	}

	async create(tweetAuthor: UserV2): Promise<Author> {
		const { id, description, verified, location, username, public_metrics, profile_image_url, created_at } =
			tweetAuthor;
		if (isUndefinedOrEmptyObject(public_metrics)) {
			throw new TwitterApiException(TwitterApiErrorCode.NO_PUBLIC_METRIC);
		}
		const { tweet_count, followers_count } = public_metrics;
		const authorParams: CreateAuthor = {
			id: id,
			bio: description,
			isVerified: verified,
			location,
			username,
			numberOfFollowers: followers_count || 0,
			numberOfTweets: tweet_count || 0,
			avatar: profile_image_url,
		};
		const author = new Author(authorParams);
		return this.authorRepository.save(author);
	}

	async update(oldAuthor: Author, tweetAuthor: UserV2): Promise<void> {
		const { description, verified, location, username, public_metrics, profile_image_url } = tweetAuthor;
		if (isUndefinedOrEmptyObject(public_metrics)) {
			throw new TwitterApiException(TwitterApiErrorCode.NO_PUBLIC_METRIC);
		}
		const { tweet_count, followers_count } = public_metrics;
		const updatedAuthor: Partial<Author> = {
			bio: description,
			isVerified: verified,
			location,
			username,
			numberOfFollowers: followers_count || 0,
			numberOfTweets: tweet_count || 0,
			avatar: profile_image_url,
			updatedAt: new Date(),
		};
		this.logger.debug(updatedAuthor);
		await this.authorRepository.update(oldAuthor.id, updatedAuthor);
	}

	async count(): Promise<number> {
		return this.authorRepository.count();
	}

	async getTopTenNewsRelatedAuthors(): Promise<AuthorWithCount[]> {
		return await this.authorRepository
			.createQueryBuilder('author')
			.select('author.id', 'id')
			.addSelect('author.username', 'username')
			.leftJoinAndSelect('author.tweets', 'tweet')
			.addSelect('COUNT(tweet.id)', 'tweetCount')
			.where('tweet.isNewsRelated = :isNewsRelated', { isNewsRelated: true })
			.groupBy('author.id')
			.orderBy('COUNT(tweet.id)', 'DESC')
			.limit(10)
			.getRawMany();
	}

	async getNumberOfTweetsByUserAndAuthors(sub: string, authors: string[]): Promise<AuthorWithCount[]> {
		return await this.authorRepository
			.createQueryBuilder('author')
			.select('author.id', 'id')
			.addSelect('author.username', 'username')
			.leftJoinAndSelect('author.tweets', 'tweet')
			.addSelect('COUNT(tweet.id)', 'tweetCount')
			.where('tweet.isNewsRelated = :isNewsRelated', { isNewsRelated: true })
			.where('tweet.user = :user', { user: sub })
			.andWhere('author.username IN (:...authors)', { authors })
			.groupBy('author.id')
			.orderBy('COUNT(tweet.id)', 'DESC')
			.getRawMany();
	}
}
