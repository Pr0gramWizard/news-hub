import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@user/user.entity';

export interface JwtPayload {
	sub: string;
	email: string;
	role: string;
}

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}

	async validateUser(user: User, password: string): Promise<boolean> {
		return bcrypt.compare(password, user.password);
	}

	async login(user: User): Promise<string> {
		const { id, email, role } = user;
		const payload: JwtPayload = { sub: id, email, role };
		return this.jwtService.sign(payload);
	}
}
