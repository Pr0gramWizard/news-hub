import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { NewsPageModule } from 'service/news-source/news.source.module';
import { ArticleModule } from '../article/article.module';
import { Author } from './author/tweet.author.entity';
import { TweetAuthorService } from './author/tweet.author.service';
import { TweetController } from './tweet.controller';
import { Tweet } from './tweet.entity';
import { TweetService } from './tweet.service';
import { HashtagModule } from '@tweet/hashtag/hashtag.module';

@Module({
	imports: [TypeOrmModule.forFeature([Tweet, Author]), UserModule, NewsPageModule, ArticleModule, HashtagModule],
	controllers: [TweetController],
	providers: [TweetService, TweetAuthorService],
	exports: [TweetService, TweetAuthorService],
})
export class TweetModule {}
