export enum TweetErrorCode {
	TWITTER_API_PUBLIC_METRICS_MISSING = 'Twitter API did not return public metrics for the tweet',
	TWITTER_API_ENTITIES_MISSING = 'Twitter API did not return entities for the tweet',
	UNSUPPORTED_URL_HOST = 'Unsupported URL host',
	INVALID_TWEET_URL = 'Invalid tweet URL',
	TWITTER_API_DATA_MISSING = 'Twitter API did not return data for the tweet',
	TWITTER_API_INCLUDES_MISSING = 'Twitter API did not return includes for the tweet',
	TWITTER_API_RELATED_USERS_MISSING = 'Twitter API did not return related users for the tweet',
	TWITTER_API_AUTHOR_MISSING = 'Twitter API did not return author for the tweet',
}
