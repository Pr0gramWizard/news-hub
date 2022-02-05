import { IsArray, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type OrderParam = 'asc' | 'desc';

// Controller DTOs
export class LimitQuery {
	@ApiProperty({ description: 'Limit query', default: '10', required: false })
	limit?: string;
}

export class OrderQuery {
	@ApiProperty({ description: 'In what order to sort the results', default: 'asc', required: false })
	order?: OrderParam;
}

export class LastIdQuery {
	@ApiProperty({ description: 'Lower bound for the id of the returned tweets', required: false })
	lastId?: string;
}

export class FetchedOldTweet {
	@ApiProperty({ description: 'The internal id of the tweet', required: true })
	id!: string;

	@ApiProperty({ description: 'The text of the tweet', required: true })
	text!: string;

	@ApiProperty({ description: 'The description of the tweet author', required: false })
	description!: string;

	@ApiProperty({ description: 'The internal tweet id as fetched by the Twitter API', required: true })
	tweetId!: string;

	@ApiProperty({ description: 'The username of the author', required: true })
	userName!: string;

	@ApiProperty({ description: 'The country of the author', required: false })
	country!: string;

	@ApiProperty({ description: 'Is the user verified on twitter', required: true })
	isVerified!: string;

	@ApiProperty({ description: 'The date the tweet was created', required: true })
	createdAt!: string;

	@ApiProperty({ description: 'Tweet source (check with Poornima)', required: true })
	source!: string;

	@ApiProperty({ description: 'Sentiment Analysis score', required: true })
	score!: number;

	@ApiProperty({ description: 'Sentiment Analysis related score', required: true })
	magnitude!: number;

	@ApiProperty({ description: 'Number of accounts the author follows', required: true })
	userFriendCount!: number;

	@ApiProperty({ description: 'Number of followers the author has', required: true })
	userFollowerCount!: number;
}

export class OldTweetResponse {
	@ApiProperty({ description: 'List of old tweets', type: [FetchedOldTweet] })
	@IsArray()
	@ValidateNested()
	tweets!: FetchedOldTweet[];

	@ApiProperty({ description: 'The id of the last tweet', required: false, type: String })
	@IsString()
	@ValidateIf((object, value) => value !== null)
	lastId!: string | null;
}
