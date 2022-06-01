import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../../types/dto/user';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async findById(id: string): Promise<User | undefined> {
		return this.userRepository.findOne(id, {
			relations: ['tweets', 'tweets.author', 'tweets.articles', 'tweets.articles.newsPage', 'tweets.hashtags'],
		});
	}

	async findAll(): Promise<User[]> {
		return this.userRepository.find({
			relations: ['tweets', 'tweets.author', 'tweets.articles', 'tweets.articles.newsPage', 'tweets.hashtags'],
		});
	}

	async findAllWithNewsTweets(): Promise<User[]> {
		return this.userRepository
			.createQueryBuilder('user')
			.select(['user.id', 'user.name', 'user.email', 'user.createdAt'])
			.leftJoinAndSelect('user.tweets', 'tweet')
			.leftJoinAndSelect('tweet.author', 'author')
			.leftJoinAndSelect('tweet.hashtags', 'hashtags')
			.leftJoinAndSelect('tweet.articles', 'article')
			.leftJoinAndSelect('article.newsPage', 'newsPage')
			.where('tweet.isNewsRelated = :isNews', { isNews: true })
			.getMany();
	}

	async findByMail(email: string): Promise<User | undefined> {
		return this.userRepository.findOne({ email });
	}

	async create(body: CreateUserDTO): Promise<User> {
		const { email, password, name } = body;
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = new User({ email, password: hashedPassword, name });
		return this.userRepository.save(user);
	}

	async count(): Promise<number> {
		return this.userRepository.count();
	}
}
