import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { TweetModule } from '@tweet/tweet.module';
import { UserModule } from '@user/user.module';
import { OldTweetModule } from '@tweet/old_tweets/old.tweet.module';

@Module({
	imports: [TweetModule, UserModule, OldTweetModule],
	controllers: [StatsController],
	providers: [],
})
export class StatsModule {}
