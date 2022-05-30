import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { AuthorType } from '@tweet/author/tweet.author.entity';

export class AuthorResponse {
	@ApiProperty({ type: String, nullable: true })
	avatar!: string | null;

	@ApiProperty()
	bio?: string;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	id!: string;

	@ApiProperty()
	isVerified!: boolean;

	@ApiProperty()
	location?: string;

	@ApiProperty()
	numberOfFollowers!: number;

	@ApiProperty()
	numberOfTweets!: number;

	@ApiProperty({ enum: ['NEWS_OUTLET', 'DEFAULT'] })
	type!: AuthorType;

	@ApiProperty({ type: Date, nullable: true })
	updatedAt!: Date | null;

	@ApiProperty()
	username!: string;
}

// Database DTOs
export class CreateAuthor {
	@IsString()
	id!: string;

	@IsString()
	username!: string;

	@IsString()
	location?: string;

	@IsString()
	bio?: string;

	@IsBoolean()
	isVerified?: boolean;

	@IsNumber()
	numberOfFollowers!: number;

	@IsNumber()
	numberOfTweets!: number;

	@IsString()
	@IsOptional()
	avatar?: string;
}
