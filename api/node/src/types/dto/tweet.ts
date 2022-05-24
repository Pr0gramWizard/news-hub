import { ApiProperty } from '@nestjs/swagger';
import { Author } from '@tweet/author/tweet.author.entity';
import { Hashtag } from '@tweet/hashtag/hashtag.entity';
import { User } from '@user/user.entity';
import { IsArray, IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TweetV2 } from 'twitter-api-v2';
import { TweetType } from '../../service/tweet/tweet.entity';
import { WebContent } from '../../service/webcontent/webcontent.entity';
import { ArticleMetaData } from './article';
import { AuthorResponse } from './author';
import { HashtagResponse } from './hashtag';
import { WebContentResponse } from './webcontent';

// Controller DTOs
export class TweetResponse {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	text?: string;

	@ApiProperty()
	retweets!: number;

	@ApiProperty()
	likes!: number;

	@ApiProperty()
	totalComments!: number;

	@ApiProperty()
	totalQuotes!: number;

	@ApiProperty()
	url!: string;

	@ApiProperty()
	language?: string;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty({ type: [HashtagResponse] })
	hashtags!: HashtagResponse[];

	@ApiProperty({ type: [AuthorResponse] })
	author!: AuthorResponse;

	@ApiProperty({ type: [WebContentResponse] })
	webContents!: WebContentResponse[];
}

export class StoreTweetRequest {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	url!: string;
}

export class CreateTweet {
	@IsString()
	@IsNotEmpty()
	url!: string;

	@IsDefined()
	tweetData!: TweetV2;

	@IsDefined()
	author!: Author;

	@IsDefined()
	user!: User;

	@IsOptional()
	@IsArray()
	type?: TweetType[] = [];
}

export class TweetProps {
	@IsString()
	id!: string;

	@IsString()
	text!: string;

	@IsNumber()
	@IsOptional()
	retweets?: number;

	@IsNumber()
	@IsOptional()
	likes?: number;

	@IsNumber()
	@IsOptional()
	totalComments?: number;

	@IsNumber()
	@IsOptional()
	totalQuotes?: number;

	@IsString()
	url!: string;

	@IsString()
	@IsOptional()
	language?: string;

	@IsArray()
	@IsArray()
	hashtags!: Hashtag[];

	@IsDefined()
	author!: Author;

	@IsOptional()
	webContents?: WebContent[];

	@IsDefined()
	user!: User;

	@IsOptional()
	@IsArray()
	type?: TweetType[] = [];
}

export interface NewsParserResponse {
	authors: string[];
	html: string;
	images: string[];
	keywords: string[];
	meta_data: ArticleMetaData;
	publish_date: string;
	summary: string;
	tags: string[];
	text: string;
	title: string;
	top_image: string;
	videos: string[];
}
