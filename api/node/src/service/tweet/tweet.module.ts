import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { NewsPageModule } from 'service/news-page/news.page.module';
import { ArticleModule } from '../article/article.module';
import { TweetController } from './tweet.controller';
import { Tweet } from './tweet.entity';
import { TweetService } from './tweet.service';
import { HashtagModule } from '@tweet/hashtag/hashtag.module';
import { TweetAuthorModule } from '@tweet/author/tweet.author.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Tweet]),
		UserModule,
		NewsPageModule,
		ArticleModule,
		HashtagModule,
		TweetAuthorModule,
	],
	controllers: [TweetController],
	providers: [TweetService],
	exports: [TweetService],
})
export class TweetModule {}
