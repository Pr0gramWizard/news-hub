import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@user/user.module';
import { OldTweet } from '@tweet/old_tweets/old.tweets.entity';
import { OldTweetController } from '@tweet/old_tweets/old.tweets.controller';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';

@Module({
	imports: [TypeOrmModule.forFeature([OldTweet]), UserModule],
	controllers: [OldTweetController],
	providers: [OldTweetService],
})
export class OldTweetModule {}
