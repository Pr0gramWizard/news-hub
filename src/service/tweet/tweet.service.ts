import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TwitterApiException } from '@type/error/general';
import { User } from '@user/user.entity';
import { Repository } from 'typeorm';
import { CreateTweet, TweetProps, TweetResponse } from '@type/dto/tweet';
import { Hashtag } from './hashtag/hashtag.entity';
import { Tweet } from './tweet.entity';
import { NewsHubLogger } from '@common/logger.service';
import { TweetErrorCode } from '@type/error/tweet';

@Injectable()
export class TweetService {
	constructor(
		@InjectRepository(Tweet)
		private readonly tweetRepository: Repository<Tweet>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(TweetService.name);
	}

	async findByIdAndUser(id: string, user: User): Promise<Tweet | undefined> {
		return this.tweetRepository.findOne({ id, user });
	}

	async create({ url, tweetData, author, user }: CreateTweet): Promise<Tweet> {
		const { public_metrics, text, id, lang, entities } = tweetData;
		if (!public_metrics) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_PUBLIC_METRICS_MISSING);
		}
		if (!entities) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_ENTITIES_MISSING);
		}
		const { retweet_count, like_count, reply_count, quote_count } = public_metrics;
		const listOfTweetHashtags = entities.hashtags;
		let hashtags: Hashtag[] = [];
		if (listOfTweetHashtags && listOfTweetHashtags.length > 0) {
			hashtags = entities.hashtags.map((h) => {
				return new Hashtag(h.tag);
			});
		}
		const tweetParams: TweetProps = {
			hashtags,
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
		return await this.tweetRepository.save(tweet);
	}

	async findAllByUserId(id: string): Promise<TweetResponse[]> {
		return this.tweetRepository.find({ where: { user: { id } }, relations: ['author', 'hashtags', 'webContents'] });
	}

	async count(): Promise<number> {
		return this.tweetRepository.count();
	}
}
