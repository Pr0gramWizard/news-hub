import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TwitterApi from 'twitter-api-v2';
import { assertMany } from './util';

@Injectable()
export class TwitterService {
	readonly client: TwitterApi;

	constructor(private readonly configService: ConfigService) {
		const bearerToken = this.configService.get('TWITTER_BEARER_TOKEN');
		assertMany(bearerToken);
		this.client = new TwitterApi(bearerToken);
	}
}
