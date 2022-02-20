import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
	let service: AuthService;
	let bcryptSpy: jest.SpyInstance;
	let jwtService: JwtService;
	const token = 'some-token';
	const user: User = {
		id: '123',
		password: 'test',
		email: 'test@mail.com',
		tweets: [],
		createdAt: new Date(),
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn().mockReturnValue(token),
					},
				},
			],
		}).compile();

		service = moduleRef.get(AuthService);
		bcryptSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
		jwtService = moduleRef.get(JwtService);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('validateUser', () => {
		it('should validate user', async () => {
			const password = 'test';
			const result = await service.validateUser(user, password);
			expect(bcryptSpy).toHaveBeenCalledWith(password, user.password);
			expect(result).toBe(true);
		});
	});

	describe('login', () => {
		it('should generate access token', async () => {
			const result = await service.login(user);
			expect(result).toBe(token);
			expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
		});
	});
});
