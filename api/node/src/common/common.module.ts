import { Global, Module } from '@nestjs/common';
import { NewsHubLogger } from './logger.service';
import { TwitterService } from './twitter.service';

@Global()
@Module({
	controllers: [],
	providers: [TwitterService, NewsHubLogger],
	exports: [TwitterService, NewsHubLogger],
})
export class CommonModule {}
