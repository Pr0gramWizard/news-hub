import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './tweet.author.entity';
import { TweetAuthorService } from './tweet.author.service';
import { TweetAuthorController } from '@tweet/author/tweet.author.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Author])],
	controllers: [TweetAuthorController],
	providers: [TweetAuthorService],
	exports: [TweetAuthorService],
})
export class TweetAuthorModule {}
