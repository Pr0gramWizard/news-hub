import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsPageDto } from '@type/dto/news.source';
import { TweetEntityUrlV2 } from 'twitter-api-v2';
import { Repository } from 'typeorm';
import { URL } from 'url';
import { NewsPage } from './news.page.entity';

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
		const newsPage = new NewsPage(createNewsPageDto);
		return this.newsPageRepository.save(newsPage);
	}

	async findOneByUrl(url: string): Promise<NewsPage | undefined> {
		return this.newsPageRepository.findOne({ url });
	}

	async isNewsLink(url: TweetEntityUrlV2): Promise<CheckUrlResponse> {
		const urlToCheck = url.unwound_url || url.expanded_url || url.url;
		const urlDomain = new URL(urlToCheck).hostname;
		const urlDomainWithoutSubdomain = urlDomain.indexOf('www') === 0 ? urlDomain.substring(4) : urlDomain;
		this.logger.debug(`Checking if ${urlDomainWithoutSubdomain} is a news link`);
		const newsPage = await this.findOneByUrl(urlDomainWithoutSubdomain);
		return {
			isNews: !!newsPage,
			checkedUrl: urlToCheck,
			urlDomain,
		};
	}
}
