import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';

export class AuthorResponse {
	@ApiProperty()
	@IsString()
	username!: string;

	@ApiProperty()
	@IsString()
	location!: string;

	@ApiProperty()
	@IsString()
	bio!: string;

	@ApiProperty()
	@IsBoolean()
	isVerified!: boolean;

	@ApiProperty()
	@IsNumber()
	numberOfTweets!: number;

	@ApiProperty()
	@IsNumber()
	numberOfFollowers!: number;

	@ApiProperty()
	@IsDate()
	createdAt!: Date;
}

// Database DTOs
export class CreateAuthor {
	@IsString()
	userId!: string;

	@IsString()
	username!: string;

	@IsString()
	location?: string;

	@IsString()
	bio?: string;

	@IsBoolean()
	isVerified?: boolean;

	@IsNumber()
	numberOfFollower!: number;

	@IsNumber()
	numberOfTweets!: number;
}