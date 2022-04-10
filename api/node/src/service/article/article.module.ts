import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from './article.service';
import { Article } from './article.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Article])],
	providers: [ArticleService],
	exports: [ArticleService],
})
export class ArticleModule {}
