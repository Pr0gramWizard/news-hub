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
		return this.userRepository.findOne(id);
	}

	async findAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	async findByMail(email: string): Promise<User | undefined> {
		return this.userRepository.findOne({ email });
	}

	async create(body: CreateUserDTO): Promise<User> {
		const { email, password } = body;
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = new User({ email, password: hashedPassword });
		await this.userRepository.save(user);
		return user;
	}

	async count(): Promise<number> {
		return this.userRepository.count();
	}
}
