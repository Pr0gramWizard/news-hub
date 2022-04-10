import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsSource } from './news.source.entity';
import { NewsSourceService } from './news.source.service';

@Module({
	imports: [TypeOrmModule.forFeature([NewsSource])],
	providers: [NewsSourceService],
	exports: [NewsSourceService],
})
export class NewsSourceModule {}
