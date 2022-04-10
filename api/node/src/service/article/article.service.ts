import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from '@type/dto/article';

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(Article)
		private readonly articleRepository: Repository<Article>,
		private readonly logger: NewsHubLogger,
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
		return this.articleRepository.findOne({ url }, { relations: ['newsSource'] });
	}
}
