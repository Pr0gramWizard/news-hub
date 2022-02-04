import { Tweet } from '@tweet/tweet.entity';

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
