import { ApiProperty } from '@nestjs/swagger';
import { Tweet } from '@tweet/tweet.entity';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class WebContentResponse {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	url!: string;

	@ApiProperty()
	@IsString()
	content?: string;

	@ApiProperty()
	@IsString({ each: true })
	media: string[] = [];

	@ApiProperty()
	@IsDate()
	createdAt!: Date;
}

export interface ICreateWebContent {
	url: string;
	media: string[];
	content?: string;
	tweet: Tweet;
}
export interface TweetEntityUrlImageV2 {
	url: string;
	width: number;
	height: number;
}
