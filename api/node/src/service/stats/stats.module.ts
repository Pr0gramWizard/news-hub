import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { TweetModule } from '@tweet/tweet.module';
import { UserModule } from '@user/user.module';

@Module({
	imports: [TweetModule, UserModule],
	controllers: [StatsController],
	providers: [],
})
export class StatsModule {}
