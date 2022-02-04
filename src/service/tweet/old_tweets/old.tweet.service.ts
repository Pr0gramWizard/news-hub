import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OldTweet } from './old.tweets.entity';

@Injectable()
export class OldTweetService {
	private readonly logger = new ConsoleLogger(OldTweetService.name);
	constructor(
		@InjectRepository(OldTweet)
		private readonly oldTweetRepository: Repository<OldTweet>,
	) {}

	async findAll(): Promise<OldTweet[]> {
		this.logger.log('Fetching all old tweets');
		return await this.oldTweetRepository.find({
			take: 10,
		});
	}

}
