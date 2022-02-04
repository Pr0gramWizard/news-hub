import { ICreateWebContent, TweetEntityUrlImageV2 } from '@interface/webcontent';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tweet } from '@tweet/tweet.entity';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { WebContent } from './webcontent.entity';

@Injectable()
export class WebContentService {
	private readonly logger = new ConsoleLogger(WebContentService.name);

	constructor(
		@InjectRepository(WebContent)
		private readonly webContentRepository: Repository<WebContent>,
	) {}

	async findByUrl(url: string) {
		return this.webContentRepository.findOne({ url });
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
			const urlMedia = twitterApiUrl.images as unknown as TweetEntityUrlImageV2[];
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
