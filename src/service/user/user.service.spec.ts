import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
	let service: UserService;
	let bcryptSpy: jest.SpyInstance;
	let userRepository: Repository<User>;
	const user: User = {
		id: '1',
		password: 'test',
		email: 'test@mail.com',
		createdAt: new Date(),
		tweets: [],
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				UserService,
				{
					provide: getRepositoryToken(User),
					useValue: {
						findOne: jest.fn().mockResolvedValue(user),
						find: jest.fn().mockResolvedValue([user]),
						save: jest.fn().mockResolvedValue(user),
						count: jest.fn().mockResolvedValue(1),
					},
				},
			],
		}).compile();

		service = moduleRef.get(UserService);
		bcryptSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));
		userRepository = moduleRef.get(getRepositoryToken(User));
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findById', () => {
		it('should return a user if found', async () => {
			const params = '1';
			const result = await service.findById(params);
			expect(result).toEqual(user);
			expect(userRepository.findOne).toHaveBeenCalledWith(params);
		});

		it('should return undefined if no user was found', async () => {
			userRepository.findOne = jest.fn().mockResolvedValue(undefined);
			const params = '1';
			const result = await service.findById(params);
			expect(result).toEqual(undefined);
			expect(userRepository.findOne).toHaveBeenCalledWith(params);
		});
	});

	describe('findAll', () => {
		it('should return a list of users', async () => {
			const result = await service.findAll();
			expect(result).toEqual([user]);
			expect(userRepository.find).toHaveBeenCalled();
		});
	});

	describe('findByMail', () => {
		it('should return a user if found', async () => {
			const result = await service.findByMail(user.email);
			expect(result).toEqual(user);
			expect(userRepository.findOne).toHaveBeenCalledWith({ email: user.email });
		});

		it('should return undefined if no user is found', async () => {
			userRepository.findOne = jest.fn().mockResolvedValue(undefined);
			const result = await service.findByMail(user.email);
			expect(result).toEqual(undefined);
			expect(userRepository.findOne).toHaveBeenCalledWith({ email: user.email });
		});
	});

	describe('create', () => {
		it('should create a new user', async () => {
			const payload = {
				email: 'test@mail.com',
				password: 'test',
			};
			const result = await service.create(payload);
			expect(result).toEqual(user);
			expect(userRepository.save).toHaveBeenCalled();
			expect(bcryptSpy).toHaveBeenCalledWith(payload.password, 12);
		});
	});

	describe('count', () => {
		it('should return the length of the list of users', async () => {
			const result = await service.count();
			expect(result).toEqual(1);
			expect(userRepository.count).toHaveBeenCalled();
		});
	});
});
