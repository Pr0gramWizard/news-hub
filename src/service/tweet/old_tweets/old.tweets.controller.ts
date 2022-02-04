import { ConsoleLogger, Controller, Get } from '@nestjs/common';
import { OldTweetService } from '@tweet/old_tweets/old.tweet.service';

@Controller('old/tweets')
export class OldTweetController {
	private readonly logger = new ConsoleLogger(OldTweetController.name);

	constructor(private readonly oldTweetService: OldTweetService) {}

	@Get()
	async getAll() {
		return await this.oldTweetService.findAll();
	}
}
