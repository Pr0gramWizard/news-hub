import {ApiProperty} from '@nestjs/swagger';
import {Author} from '@tweet/author/tweet.author.entity';
import {User} from '@user/user.entity';
import {IsArray, IsBoolean, IsDate, IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString} from 'class-validator';
import {TweetEntitiesV2, TweetV2} from 'twitter-api-v2';
import {TweetType} from '../../service/tweet/tweet.entity';
import {ArticleMetaData, ArticleResponse} from './article';
import {AuthorResponse} from './author';
import {HashtagResponse} from './hashtag';

// Controller DTOs
export class TweetResponse {
	@ApiProperty({ type: [ArticleResponse] })
	articles?: ArticleResponse[];

	@ApiProperty({ type: [AuthorResponse] })
	author!: AuthorResponse;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	entities?: TweetEntitiesV2;

	@ApiProperty({ type: [HashtagResponse] })
	hashtags!: HashtagResponse[];

	@ApiProperty()
	id!: string;

	@ApiProperty()
	isNewsRelated!: boolean;

	@ApiProperty()
	language?: string;

	@ApiProperty()
	likes!: number;

	@ApiProperty()
	retweets!: number;

	@ApiProperty()
	seenAt!: Date;

	@ApiProperty()
	text?: string;

	@ApiProperty()
	totalComments!: number;

	@ApiProperty()
	totalQuotes!: number;

	@ApiProperty()
	tweetId!: string;

	@ApiProperty({ enum: ['NORMAL', 'CONTAINS_NEWS_ARTICLE', 'AUTHOR_IS_NEWS_OUTLET'], isArray: true })
	type!: TweetType[];

	@ApiProperty()
	url!: string;

	@ApiProperty({ enum: ['NORMAL', 'CONTAINS_NEWS_ARTICLE', 'AUTHOR_IS_NEWS_OUTLET'], isArray: true, nullable: true })
	userClassification!: TweetType[] | null;
}

export class PaginatedTweetResponse {
	@ApiProperty({ type: [TweetResponse] })
	tweets!: TweetResponse[];

	@ApiProperty()
	total!: number;
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

	@IsDefined()
	@IsArray()
	type!: TweetType[];
}

export class TweetProps {
	@IsString()
	tweetId!: string;

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

	@IsDefined()
	author!: Author;

	@IsDefined()
	user!: User;

	@IsDefined()
	@IsArray()
	type!: TweetType[];

	@IsOptional()
	@IsBoolean()
	isNewsRelated?: boolean;

	@IsOptional()
	entities?: TweetEntitiesV2;

	@IsDefined()
	@IsDate()
	seenAt!: Date;

	@IsDefined()
	@IsDate()
	createdAt!: Date;
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

export interface TweetQueryParameter {
	searchTerm?: string;
	limit?: number;
	page?: number;
	sort?: string;
	order?: 'asc' | 'desc';
}

export class SearchTermQuery {
	@ApiProperty({ description: 'Search term query', required: false, default: '' })
	searchTerm?: string;
}

export class LimitQuery {
	@ApiProperty({ description: 'Number of returned tweets', default: 20, required: false })
	limit?: number;
}

export class PageQuery {
	@ApiProperty({ description: 'Current page', required: false, default: 1 })
	page?: string;
}

export class SortQuery {
	@ApiProperty({ description: 'Property to sort by', required: false, default: 'seenAt' })
	sort?: string;
}

export class OrderQuery {
	@ApiProperty({ description: 'Direction to order', required: false, default: 'DESC' })
	order?: 'ASC' | 'DESC';
}

export class ClassifyTweetDto {
	@ApiProperty()
	@IsString()
	tweetId!: string;

	@ApiProperty({ enum: ['NORMAL', 'CONTAINS_NEWS_ARTICLE', 'AUTHOR_IS_NEWS_OUTLET'], isArray: true })
	@IsArray()
	@IsOptional()
	classifications!: TweetType[];
}
