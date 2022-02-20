import { ICreateWebContent } from '../../types/dto/webcontent';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from '@tweet/tweet.entity';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { WebContent } from './webcontent.entity';

@Injectable()
export class WebContentService {
	constructor(
		@InjectRepository(WebContent)
		private readonly webContentRepository: Repository<WebContent>,
		private readonly logger: ConsoleLogger,
	) {
		this.logger.setContext(WebContentService.name);
	}

	async create(webContentParams: ICreateWebContent) {
		const webContent = new WebContent(webContentParams);
		await this.webContentRepository.save(webContent);
		this.logger.debug(`Created a new web content entity with id '${webContent.id}'`);
		return webContent;
	}

	async createMany(twitterApiUrls: TweetEntityUrlV2[], tweet: Tweet) {
		const webContents: WebContent[] = [];
		for (const twitterApiUrl of twitterApiUrls) {
			const urlMedia = twitterApiUrl.images;
			const media = urlMedia ? [urlMedia[0].url] : [];
			const webContent = await this.create({
				url: twitterApiUrl.unwound_url,
				content: twitterApiUrl.description,
				tweet,
				media,
			});
			webContents.push(webContent);
		}
		return webContents;
	}
}
