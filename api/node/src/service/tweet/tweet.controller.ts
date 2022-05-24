import { NewsHubLogger } from '@common/logger.service';
import { TwitterService } from '@common/twitter.service';
import { isUndefinedOrEmptyObject } from '@common/util';
import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { StoreTweetRequest, TweetResponse } from '@type/dto/tweet';
import { TwitterApiException } from '@type/error/general';
import { TweetErrorCode } from '@type/error/tweet';
import { UserErrorCodes } from '@type/error/user';
import { UserService } from '@user/user.service';
import { NewsLinks, NewsPageService } from 'service/news-source/news.page.service';
import { URL } from 'url';
import { UserContext } from '../../decorator/user.decorator';
import { AuthGuard } from '../../guard/auth.guard';
import { ArticleService } from '../article/article.service';
import { JwtPayload } from '../auth/auth.service';
import { WebContentService } from '../webcontent/webcontent.service';
import { TweetAuthorService } from './author/tweet.author.service';
import { TweetType } from './tweet.entity';
import { TweetService } from './tweet.service';
import { AuthorType } from '@tweet/author/tweet.author.entity';

@ApiTags('Tweet')
@Controller('tweet')
export class TweetController {
	private readonly supportedSocialMediaLinks = ['twitter.com', 'twitter.de', 'twitter.fr', 'twitter.co.uk'];

	constructor(
		private readonly tweetService: TweetService,
		private readonly userService: UserService,
		private readonly twitterService: TwitterService,
		private readonly authorService: TweetAuthorService,
		private readonly webContentService: WebContentService,
		private readonly logger: NewsHubLogger,
		private readonly articleService: ArticleService,
		private readonly newsPageService: NewsPageService,
	) {
		this.logger.setContext(TweetController.name);
	}

	@Get(':user_id')
	@ApiOkResponse({
		description: 'Get all tweets by a user id',
		type: [TweetResponse],
	})
	async getTweetsByUserToken(@Param('user_id') id: string): Promise<TweetResponse[]> {
		return this.tweetService.findAllByUserId(id);
	}

	@Post('')
	@UseGuards(new AuthGuard())
	@ApiBearerAuth()
	@ApiCreatedResponse({
		description: 'Stored the tweet in the database',
	})
	@ApiNotFoundResponse({
		description: 'User not found',
	})
	@ApiBadRequestResponse({
		description: 'Either the tweet url is not valid or there was an error with the data the Twitter API returned',
	})
	async create(@Body() body: StoreTweetRequest, @UserContext() jwtPayload: JwtPayload): Promise<void> {
		const { sub } = jwtPayload;
		const { url } = body;
		// Check if requesting user exists
		const user = await this.userService.findById(sub);
		if (!user) {
			throw new BadRequestException(UserErrorCodes.USER_NOT_FOUND);
		}
		// Parse and validate passed url. Currently, we only support twitter.com
		const { pathname, hostname } = new URL(url);
		if (!this.supportedSocialMediaLinks.includes(hostname)) {
			this.logger.debug(`Unsupported social media link: ${hostname}`);
			throw new BadRequestException(`${TweetErrorCode.UNSUPPORTED_URL_HOST}: ${hostname}`);
		}

		// The tweet id should always be the last path name
		const pathNames = pathname.split('/');
		const tweetId = pathNames.pop();
		if (!tweetId) {
			throw new BadRequestException(TweetErrorCode.INVALID_TWEET_URL);
		}

		// If the requesting user already has an entry in the database we just return nothing
		const existingTweet = await this.tweetService.findByIdAndUser(tweetId, user);
		if (existingTweet) {
			this.logger.warn('There is already a tweet with this id for the given user');
			return;
		}

		// This is the actual call to the Twitter API
		const twitterApiResponse = await this.twitterService.findTweetById(tweetId);

		// Parse and validate the response from the Twitter API
		const { data, includes } = twitterApiResponse;
		if (isUndefinedOrEmptyObject(data)) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_DATA_MISSING);
		}
		if (isUndefinedOrEmptyObject(includes)) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_INCLUDES_MISSING);
		}
		if (isUndefinedOrEmptyObject(data.entities)) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_ENTITIES_MISSING);
		}
		const listOfRelatedUsers = includes.users;
		if (!listOfRelatedUsers) {
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_RELATED_USERS_MISSING);
		}
		const tweetAuthor = listOfRelatedUsers.find((u) => u.id === data.author_id);
		if (!tweetAuthor) {
			this.logger.error(`The twitter API did not return any author object for url '${url}'`);
			throw new TwitterApiException(TweetErrorCode.TWITTER_API_AUTHOR_MISSING);
		}

		// Create author entity if it does not exist
		let author = await this.authorService.findById(tweetAuthor.id);
		if (!author) {
			author = await this.authorService.create(tweetAuthor);
			this.logger.debug(`There was no author with id '${tweetAuthor.id}' in the database, created a new one`);
		}

		const tweetType = [];
		if (author.type === AuthorType.NEWS_OUTLET) {
			tweetType.push(TweetType.AUTHOR_IS_NEWS_OUTLET);
		}

		const tweet = await this.tweetService.create({
			url,
			author,
			user,
			tweetData: data,
			type: tweetType,
		});

		if (data.entities.urls) {
			const linksInTweet = this.tweetService.getLinksFromTweet(data.entities.urls);
			const classifiedLinks = await this.newsPageService.areNewsLinks(linksInTweet);
			const newsLinks = classifiedLinks.filter((l) => l.isNews && l.newsPage !== undefined) as NewsLinks[];

			if (classifiedLinks.length > 0) {
				await this.tweetService.addTweetType(tweet, TweetType.CONTAINS_NEWS_ARTICLE);
			}
			const articles = await this.articleService.createManyByUrl(newsLinks, tweet);
		}
	}

	/* istanbul ignore next */
	@Get('hashtag/:hashtag')
	async getTweetsByHashtag(@Param('hashtag') hashtag: string) {
		// Search all is not available unless you get the Academic access
		// Search only returns the tweets of the last 7 days
		const twitterApiResponse = await this.twitterService.findTweetsByHashtag(hashtag);

		const { data } = twitterApiResponse;

		this.logger.debug(`Twitter API returned ${data}  for hashtag '${hashtag}'`);

		// const tweets = data.data.map((t) => {
		// 	const { id, text, created_at, author_id, entities } = t;
		// 	const { media } = entities;
		// 	const mediaType = media ? media[0].type : undefined;
		// 	return { id, text, created_at, author_id, mediaType };
		// });

		return twitterApiResponse;
	}
}
