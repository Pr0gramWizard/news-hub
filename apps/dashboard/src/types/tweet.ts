export interface Author {
	bio: string;
	createdAt: string;
	id: string;
	isVerified: boolean;
	location: string | null;
	numberOfFollowers: number;
	numberOfTweets: number;
	username: string;
	avatar?: string;
	updatedAt: string;
	type: AuthorType;
}

export interface Tweet {
	id: string;
	tweetId: string;
	text: string;
	likes: number;
	language?: string;
	retweets: number;
	totalComments: number;
	totalQuotes: number;
	url: string;
	createdAt: string;
	seenAt: string;
	hashtags: Hashtag[];
	author: Author;
	entities?: Entities;
	type: TweetType[];
	isNewsRelated: boolean;
	userClassification: TweetType[] | null;
}

interface Hashtag {
	id: string;
	createdAt: string;
	name: string;
}

export enum TweetType {
	NORMAL = 'NORMAL',
	CONTAINS_NEWS_ARTICLE = 'CONTAINS_NEWS_ARTICLE',
	AUTHOR_IS_NEWS_OUTLET = 'AUTHOR_IS_NEWS_OUTLET',
}

enum AuthorType {
	NEWS_OUTLET = 'NEWS_OUTLET',
	DEFAULT = 'DEFAULT',
}

export interface Entities {
	annotations?: Annotation[];
	urls?: TweetUrl[];
}

export interface Annotation {
	start: number;
	end: number;
	normalized_text: string;
	type: string;
	probability: number;
}

export interface TweetUrl {
	url: string;
	expanded_url: string;
	display_url: string;
	start: number;
	end: number;
}
