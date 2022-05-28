export interface Author {
	bio: string;
	createdAt: string;
	id: string;
	isVerified: boolean;
	location: string | null;
	numberOfFollowers: number;
	numberOfTweets: number;
	type: string;
	username: string;
	avatar?: string;
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
	createdAt: string;
	author: Author;
}
