import { NewsHubLogger } from '@common/logger.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNewsSourceDto } from '@type/dto/news.source';
import { Repository } from 'typeorm';
import { NewsSource } from './news.source.entity';

@Injectable()
export class NewsSourceService {
	constructor(
		@InjectRepository(NewsSource)
		private readonly newsSourceRepository: Repository<NewsSource>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(NewsSourceService.name);
	}

	async create(createNewsSourceDto: CreateNewsSourceDto): Promise<NewsSource> {
		this.logger.debug(`Creating news source ${createNewsSourceDto.name}`);
		const newsSource = new NewsSource(createNewsSourceDto);
		return this.newsSourceRepository.save(newsSource);
	}

	async findOneByName(name: string): Promise<NewsSource | undefined> {
		this.logger.debug(`Finding news source ${name}`);
		return this.newsSourceRepository.findOne({ name }, { relations: ['articles'] });
	}

	async findOneByUrl(url: string): Promise<NewsSource | undefined> {
		this.logger.debug(`Finding news source ${url}`);
		return this.newsSourceRepository.findOne({ url });
	}
}
