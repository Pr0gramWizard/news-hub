import { Global, Module } from '@nestjs/common';
import { TwitterService } from './twitter.service';

@Global()
@Module({
	controllers: [],
	providers: [TwitterService],
	exports: [TwitterService],
})
export class CommonModule {}
