import { isUndefinedOrEmptyObject } from '@common/util';
import { TwitterApiException } from '@error/general';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { Author } from './tweet.author.entity';
import { CreateAuthor } from '../../../types/dto/author';
import { TwitterApiErrorCode } from '@error/twitter.api';

@Injectable()
export class TweetAuthorService {
	constructor(
		@InjectRepository(Author)
		private readonly authorRepository: Repository<Author>,
		private readonly logger: ConsoleLogger,
	) {
		this.logger.setContext(TweetAuthorService.name);
	}

	async findById(id: string): Promise<Author | undefined> {
		return this.authorRepository.findOne(id);
	}

	async create(tweetAuthor: UserV2): Promise<Author> {
		const { id, description, verified, location, username, public_metrics } = tweetAuthor;
		if (isUndefinedOrEmptyObject(public_metrics)) {
			throw new TwitterApiException(TwitterApiErrorCode.NO_PUBLIC_METRIC);
		}
		const { tweet_count, followers_count } = public_metrics;
		const authorParams: CreateAuthor = {
			userId: id,
			bio: description,
			isVerified: verified,
			location,
			username,
			numberOfFollower: followers_count || 0,
			numberOfTweets: tweet_count || 0,
		};
		const author = new Author(authorParams);
		return this.authorRepository.save(author);
	}

	async count(): Promise<number> {
		return this.authorRepository.count();
	}
}
