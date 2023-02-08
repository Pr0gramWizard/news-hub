import { ApiProperty } from '@nestjs/swagger';
import { TweetResponse } from '@type/dto/tweet';
import { UserRole } from '@user/user.entity';
import { IsDate, IsDefined, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

	@IsOptional()
	role?: UserRole;
}

export class UserResponse {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty({ type: [TweetResponse] })
	tweets!: TweetResponse[];
}

export class ResetPasswordRequest {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	oldPassword!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	newPassword!: string;
}

export class ChangeBasicInformationRequest {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	email!: string;
}

export class ChangeUserRoleRequest {
	@ApiProperty()
	@IsDefined()
	role!: UserRole;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	userId!: string;
}

export class UserForAdminDashboard {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty()
	role!: UserRole;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	updatedAt!: Date;

	@ApiProperty()
	numberOfCollectedTweets!: number;
}
