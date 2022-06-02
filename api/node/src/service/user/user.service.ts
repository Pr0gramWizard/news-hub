import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { ChangeBasicInformationRequest, CreateUserDTO, GetUserResponse } from '../../types/dto/user';
import { User, UserRole } from './user.entity';
import { InternalServerException } from '@type/error/general';
import { NewsHubLogger } from '@common/logger.service';
import { UserErrorCodes } from '@type/error/user';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly logger: NewsHubLogger,
	) {
		this.logger.setContext(UserService.name);
	}

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

	async updatePassword(user: User, oldPassword: string, newPassword: string): Promise<void> {
		const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
		if (!isPasswordCorrect) {
			this.logger.debug('Old Password is not correct');
			throw new BadRequestException(UserErrorCodes.USER_PASSWORD_CHANGE_FAILED);
		}
		const hashedPassword = await bcrypt.hash(newPassword, 12);
		const result = await this.userRepository.update(user.id, { password: hashedPassword });
		if (result.affected === 0) {
			this.logger.debug(result);
			throw new BadRequestException(UserErrorCodes.USER_PASSWORD_CHANGE_FAILED);
		}
	}

	async updateEmail(id: string, payload: ChangeBasicInformationRequest): Promise<void> {
		const { email, name } = payload;
		const result = await this.userRepository.update(id, { email, name });
		if (result.affected === 0) {
			this.logger.debug(result);
			throw new InternalServerException();
		}
	}

	async updateRole(id: string, role: UserRole): Promise<void> {
		const result = await this.userRepository.update(id, { role });
		if (result.affected === 0) {
			this.logger.debug(result);
			throw new InternalServerException();
		}
	}

	transformUserToUserResponse(user: User): GetUserResponse {
		const { id, createdAt, email } = user;
		return {
			id,
			createdAt,
			email,
			numberOfCollectedTweets: user.tweets.length,
		};
	}
}
