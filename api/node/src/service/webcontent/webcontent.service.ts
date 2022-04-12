import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from '@tweet/tweet.entity';
import { ICreateWebContent } from '@type/dto/webcontent';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { WebContent } from './webcontent.entity';

@Injectable()
export class WebContentService {
	constructor(
		@InjectRepository(WebContent)
		private readonly webContentRepository: Repository<WebContent>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(WebContentService.name);
	}

	async create(webContentParams: ICreateWebContent) {
		this.logger.debug(
			`Creating web content for tweet ${webContentParams.tweet.id} with data ${JSON.stringify(webContentParams)}`,
		);
		const webContent = new WebContent(webContentParams);
		return this.webContentRepository.save(webContent);
	}

	async createMany(twitterApiUrls: TweetEntityUrlV2[], tweet: Tweet) {
		const webContents: WebContent[] = [];
		for (const twitterApiUrl of twitterApiUrls) {
			const urlMedia = twitterApiUrl.images;
			const media = urlMedia ? [urlMedia[0].url] : [];
			const webContent = await this.create({
				url: twitterApiUrl.unwound_url || twitterApiUrl.url,
				content: twitterApiUrl.description,
				tweet,
				media,
			});
			webContents.push(webContent);
		}
		return webContents;
	}
}
