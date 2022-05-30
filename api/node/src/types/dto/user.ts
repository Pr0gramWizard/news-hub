import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { UserRole } from '@user/user.entity';

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

	@ApiProperty({ example: 'Max Mustermann' })
	@IsString()
	@IsNotEmpty()
	name!: string;
}

export class RegisterUserResponse {
	@ApiProperty()
	token!: string;

	@ApiProperty()
	name!: string;
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

	@ApiProperty()
	name!: string;
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
	name!: string;

	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsEnum(UserRole)
	@IsOptional()
	role?: UserRole;
}
