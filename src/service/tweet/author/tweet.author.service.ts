import { isUndefinedOrEmptyObject } from '@common/util';
import { TwitterApiException } from '@error/general';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { Author } from './tweet.author.entity';
import { CreateAuthor } from '../../../types/dto/author';

@Injectable()
export class TweetAuthorService {
	private readonly logger = new ConsoleLogger(TweetAuthorService.name);
	constructor(
		@InjectRepository(Author)
		private readonly authorRepository: Repository<Author>,
	) {}

	async findById(id: string) {
		return this.authorRepository.findOne(id);
	}

	async create(tweetAuthor: UserV2): Promise<Author> {
		const { id, description, verified, location, username, public_metrics } = tweetAuthor;
		if (isUndefinedOrEmptyObject(public_metrics)) {
			throw new TwitterApiException('Twitter API did not return public metrics for the author');
		}
		const { tweet_count, followers_count } = public_metrics;
		const authorParams: CreateAuthor = {
			userId: id,
			bio: description,
			isVerified: verified,
			location,
			username,
			numberOfFollower: followers_count,
			numberOfTweets: tweet_count,
		};
		const author = new Author(authorParams);
		await this.authorRepository.save(author);
		this.logger.debug(`Created a new author with id '${author.id}'`);
		return author;
	}
}
