import { User } from '@user/user.entity';
import { TweetV2 } from 'twitter-api-v2';
import { Author } from '../../service/tweet/author/tweet.author.entity';
import { Hashtag } from '../../service/tweet/hashtag/hashtag.entity';
import { WebContent } from '../../service/webcontent/webcontent.entity';

export interface ICreateAuthor {
	userId: string;
	username: string;
	location?: string;
	bio?: string;
	isVerified?: boolean;
	numberOfFollower?: number;
	numberOfTweets?: number;
}

export interface IStoreTweetPayload {
	url: string;
}

export interface ICreateTweetParams {
	url: string;
	tweetData: TweetV2;
	author: Author;
	user: User;
}
export interface ICreateTweet {
	id: string;
	text: string;
	retweets?: number;
	likes?: number;
	totalComments?: number;
	totalQuotes?: number;
	url: string;
	language?: string;
	hashtags: Hashtag[];
	author: Author;
	webContents?: WebContent[];
	user: User;
}
