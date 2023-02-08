import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsPageDto } from '@type/dto/news.source';
import { Repository } from 'typeorm';
import { TweetLink } from '../tweet/tweet.service';
import { NewsPage } from './news.page.entity';

export interface CheckUrlResponse {
	isNews: boolean;
	checkedUrl: string;
	fullUrl: string;
	newsPage?: NewsPage;
}

export interface NewsLinks {
	isNews: boolean;
	checkedUrl: string;
	fullUrl: string;
	newsPage: NewsPage;
}

@Injectable()
export class NewsPageService {
	private readonly excludedDomains: string[];
	constructor(
		@InjectRepository(NewsPage)
		private readonly newsPageRepository: Repository<NewsPage>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(NewsPageService.name);
		this.excludedDomains = ['twitter.com'];
	}

	async create(createNewsPageDto: CreateNewsPageDto): Promise<NewsPage> {
		this.logger.debug(`Creating news page ${createNewsPageDto.url}`);
		const newsPage = new NewsPage(createNewsPageDto);
		return this.newsPageRepository.save(newsPage);
	}

	async findOneByUrl(url: string) {
		return this.newsPageRepository.findOne({
			where: {
				url,
			},
		});
	}

	async areNewsLinks(tweetLinks: TweetLink[]): Promise<CheckUrlResponse[]> {
		return Promise.all(tweetLinks.map((tw) => this.isNewsLink(tw)));
	}

	async isNewsLink(url: TweetLink): Promise<CheckUrlResponse> {
		if (this.excludedDomains.includes(url.urlDomain)) {
			this.logger.debug(`URL ${url.urlDomain} is excluded`);
			return {
				isNews: false,
				checkedUrl: url.urlDomain,
				fullUrl: url.fullUrl,
			};
		}
		this.logger.debug(`Checking if ${url.urlDomain} is a news link`);
		const newsPage = await this.findOneByUrl(url.urlDomain);
		return {
			newsPage: newsPage ?? undefined,
			isNews: !!newsPage,
			checkedUrl: url.urlDomain,
			fullUrl: url.fullUrl,
		};
	}
}
