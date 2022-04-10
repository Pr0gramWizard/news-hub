import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebContent } from './webcontent.entity';
import { WebContentService } from './webcontent.service';

@Module({
	imports: [TypeOrmModule.forFeature([WebContent])],
	providers: [WebContentService],
	exports: [WebContentService],
})
export class WebContentModule {}
