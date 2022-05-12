import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { NewsSourceModule } from 'service/news-source/news.source.module';
import { WebContentModule } from '../webcontent/webcontent.module';
import { Author } from './author/tweet.author.entity';
import { TweetAuthorService } from './author/tweet.author.service';
import { Hashtag } from './hashtag/hashtag.entity';
import { TweetController } from './tweet.controller';
import { Tweet } from './tweet.entity';
import { TweetService } from './tweet.service';

@Module({
	imports: [TypeOrmModule.forFeature([Tweet, Author, Hashtag]), UserModule, WebContentModule, NewsSourceModule],
	controllers: [TweetController],
	providers: [TweetService, TweetAuthorService],
	exports: [TweetService, TweetAuthorService],
})
export class TweetModule {}
