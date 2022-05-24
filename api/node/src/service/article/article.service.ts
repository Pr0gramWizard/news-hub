import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from '@type/dto/article';
import axios from 'axios';
import { Repository } from 'typeorm';
import { NewsParserResponse } from '../../types/dto/tweet';
import { NewsLinks } from '../news-source/news.page.service';
import { Tweet } from '../tweet/tweet.entity';
import { Article } from './article.entity';

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(Article)
		private readonly articleRepository: Repository<Article>,
		private readonly logger: NewsHubLogger,
		private readonly configService: ConfigService,
	) {
		this.logger.setContext(ArticleService.name);
	}

	async create(createArticleDto: CreateArticleDto): Promise<Article> {
		this.logger.debug(`Creating new article`);
		const article = new Article(createArticleDto);
		return this.articleRepository.save(article);
	}

	async findByUrl(url: string): Promise<Article | undefined> {
		this.logger.debug(`Finding article by url: ${url}`);
		return this.articleRepository.findOne({ url }, { relations: ['newsPage'] });
	}

	async createManyByUrl(newsLinks: NewsLinks[], tweet: Tweet): Promise<Article[]> {
		const pythonApiUrl = this.configService.get('PYTHON_API_URL');
		const articles: Article[] = [];
		for (const url of newsLinks) {
			const article = await this.findByUrl(url.fullUrl);
			if (article) {
				this.logger.debug(`Article ${url.fullUrl} already exists`);
				articles.push(article);
			} else {
				this.logger.debug(`Article ${url.fullUrl} does not exist`);
				try {
					const pythonApiResponse = await axios.post<NewsParserResponse>(
						`${pythonApiUrl}/parse`,
						{ url: url.fullUrl },
						{
							headers: {
								'Content-Type': 'application/json',
							},
						},
					);
					const {
						authors,
						html,
						images,
						keywords,
						meta_data,
						publish_date,
						summary,
						tags,
						text,
						title,
						top_image,
						videos,
					} = pythonApiResponse.data;
					const article = await this.create({
						url: url.fullUrl,
						authors,
						html,
						images,
						keywords,
						metaData: meta_data,
						publishedAt: new Date(publish_date),
						summary,
						tags,
						text,
						title,
						topImage: top_image,
						videos,
						newsPage: url.newsPage,
						tweet,
					});
					articles.push(article);
				} catch (e) {
					this.logger.error(e);
				}
			}
		}
		return articles;
	}
}
