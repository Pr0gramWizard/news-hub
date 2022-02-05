import { TwitterApiException } from '@error/general';
import { CreateTweet, TweetProps, TweetResponse } from '../../types/dto/tweet';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@user/user.entity';
import { Repository } from 'typeorm';
import { Hashtag } from './hashtag/hashtag.entity';
import { Tweet } from './tweet.entity';

@Injectable()
export class TweetService {
	private readonly logger = new ConsoleLogger(TweetService.name);

	constructor(
		@InjectRepository(Tweet)
		private readonly tweetRepository: Repository<Tweet>,
	) {}

	async findByIdAndUser(id: string, user: User) {
		return this.tweetRepository.findOne({ id, user });
	}

	async createTweet({ url, tweetData, author, user }: CreateTweet): Promise<Tweet> {
		const { public_metrics, text, id, lang, entities } = tweetData;
		if (!public_metrics) {
			throw new TwitterApiException('Twitter API did not return public metrics for the tweet');
		}
		if (!entities) {
			throw new TwitterApiException('Twitter API did not return entities for the tweet');
		}
		const { retweet_count, like_count, reply_count, quote_count } = public_metrics;
		const listOfHashtags = entities.hashtags.map((h) => {
			return new Hashtag(h.tag);
		});
		const tweetParams: TweetProps = {
			hashtags: listOfHashtags,
			language: lang,
			totalQuotes: quote_count,
			totalComments: reply_count,
			likes: like_count,
			retweets: retweet_count,
			id,
			text,
			user,
			author,
			url,
		};
		const tweet = new Tweet(tweetParams);
		await this.tweetRepository.save(tweet);
		this.logger.debug(`Created a new tweet with id '${tweet.id}'`);
		return tweet;
	}

	async findAllByUserId(id: string): Promise<TweetResponse[]> {
		return this.tweetRepository.find({ where: { user: { id } }, relations: ['author', 'hashtags', 'webContents'] });
	}
}
