import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsPage } from './news.page.entity';
import { NewsPageService } from './news.page.service';

@Module({
	imports: [TypeOrmModule.forFeature([NewsPage])],
	providers: [NewsPageService],
	exports: [NewsPageService],
})
export class NewsSourceModule {}
