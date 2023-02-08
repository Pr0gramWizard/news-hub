import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from '@tweet/hashtag/hashtag.entity';
import { Tweet } from '@tweet/tweet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HashtagService {
	constructor(
		@InjectRepository(Hashtag)
		private readonly hashtagRepository: Repository<Hashtag>,
	) {}

	async findByName(name: string) {
		return this.hashtagRepository.findOne({
			where: {
				name,
			},
			relations: ['hashtags'],
		});
	}

	async create(hashtag: string, tweets: Tweet[]): Promise<Hashtag> {
		const hashtagEntity = new Hashtag(hashtag);
		hashtagEntity.tweets = tweets;
		return this.hashtagRepository.save(hashtagEntity);
	}

	async addTweet(hashtag: Hashtag, tweet: Tweet): Promise<Hashtag> {
		hashtag.tweets.push(tweet);
		return this.hashtagRepository.save(hashtag);
	}
}
