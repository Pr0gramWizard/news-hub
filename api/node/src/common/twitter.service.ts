import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TwitterApi, { TweetSearchRecentV2Paginator, TweetV2SingleResult } from 'twitter-api-v2';
import { assertMany } from './util';

@Injectable()
export class TwitterService {
	readonly client: TwitterApi;

	constructor(private readonly configService: ConfigService) {
		const bearerToken = this.configService.get('twitter.bearerToken');
		assertMany(bearerToken);
		this.client = new TwitterApi(bearerToken);
	}

	async findTweetById(id: string): Promise<TweetV2SingleResult> {
		return await this.client.v2.singleTweet(id, {
			expansions: ['author_id', 'attachments.media_keys'],
			'tweet.fields': ['public_metrics', 'source', 'text', 'created_at', 'lang', 'entities'],
			'user.fields': ['id', 'username', 'public_metrics', 'verified', 'name', 'description', 'location'],
		});
	}

	async findTweetsByHashtag(hashtag: string): Promise<TweetSearchRecentV2Paginator> {
		return await this.client.v2.search(`#${hashtag}`, {
			expansions: ['author_id', 'attachments.media_keys'],
			'tweet.fields': ['public_metrics', 'source', 'text', 'created_at', 'lang', 'entities'],
			'user.fields': ['id', 'username', 'public_metrics', 'verified', 'name', 'description', 'location'],
			'media.fields': ['type'],
			max_results: 10,
		});
	}
}
