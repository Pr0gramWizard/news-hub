import {IsDate, IsEmail, IsNotEmpty, IsNumber, IsString, Min} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Register DTOs

export class RegisterUserRequest {
	@ApiProperty({ example: 'test@test.com' })
	@IsString()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({ example: 'securePassword' })
	@IsString()
	@IsNotEmpty()
	password!: string;
}

export class RegisterUserResponse {
	@ApiProperty()
	token!: string;
}

// Login DTOs

export class LoginUserRequest {
	@ApiProperty({ example: 'test@test.de' })
	@IsString()
	@IsNotEmpty()
	email!: string;

	@ApiProperty({ example: 'securePassword' })
	@IsString()
	@IsNotEmpty()
	password!: string;
}

export class LoginUserResponse {
	@ApiProperty()
	token!: string;
}

// Database DTOs

export class GetUserResponse {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	id!: string;

	@ApiProperty()
	@IsNumber()
	@Min(0)
	numberOfCollectedTweets!: number;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	email!: string;

	@ApiProperty()
	@IsDate()
	createdAt!: Date;
}

export class CreateUserDTO {
	@IsString()
	@IsNotEmpty()
	password!: string;

	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email!: string;
}
