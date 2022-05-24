import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hashtag } from '@tweet/hashtag/hashtag.entity';
import { Tweet } from '@tweet/tweet.entity';

@Injectable()
export class HashtagService {
	constructor(
		@InjectRepository(Hashtag)
		private readonly hashtagRepository: Repository<Hashtag>,
	) {}

	async findByName(name: string): Promise<Hashtag | undefined> {
		return this.hashtagRepository.findOne(name);
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
