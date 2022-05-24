import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './hashtag.entity';
import { HashtagService } from '@tweet/hashtag/hashtag.service';

@Module({
	imports: [TypeOrmModule.forFeature([Hashtag])],
	providers: [HashtagService],
	exports: [HashtagService],
})
export class HashtagModule {}
