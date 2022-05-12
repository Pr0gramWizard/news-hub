import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsPageDto } from '@type/dto/news.source';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { NewsPage } from './news.page.entity';
import * as psl from 'psl';

interface CheckUrlResponse {
	isNews: boolean;
	checkedUrl: string;
	urlDomain: string;
}

@Injectable()
export class NewsPageService {
	constructor(
		@InjectRepository(NewsPage)
		private readonly newsPageRepository: Repository<NewsPage>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(NewsPageService.name);
	}

	async create(createNewsPageDto: CreateNewsPageDto): Promise<NewsPage> {
		this.logger.debug(`Creating news page ${createNewsPageDto.url}`);
		const newsSource = new NewsPage(createNewsPageDto);
		return this.newsPageRepository.save(newsSource);
	}

	async findOneByUrl(url: string): Promise<NewsPage | undefined> {
		return this.newsPageRepository.findOne({ url });
	}

	async isNewsLink(url: TweetEntityUrlV2): Promise<CheckUrlResponse> {
		this.logger.debug(`Checking if ${url.expanded_url} is a news link`);
		const urlToCheck = url.unwound_url || url.expanded_url || url.url;
		const urlDomain = psl.parse(urlToCheck).domain;
		const newsSource = await this.findOneByUrl(urlDomain);
		return {
			isNews: !!newsSource,
			checkedUrl: urlToCheck,
			urlDomain,
		};
	}
}
