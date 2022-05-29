import { NewsHubLogger } from '@common/logger.service';
import { TwitterService } from '@common/twitter.service';
import { isUndefinedOrEmptyObject } from '@common/util';
import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { AuthorType } from '@tweet/author/tweet.author.entity';
import { HashtagService } from '@tweet/hashtag/hashtag.service';
import { PaginatedTweetResponse, StoreTweetRequest, TweetQueryParamter, TweetResponse } from '@type/dto/tweet';
import { TwitterApiException } from '@type/error/general';
import { TweetErrorCode } from '@type/error/tweet';
import { UserErrorCodes } from '@type/error/user';
import { UserRole } from '@user/user.entity';
import { UserService } from '@user/user.service';
import { NewsLinks, NewsPageService } from 'service/news-page/news.page.service';
import { URL } from 'url';
import { UserContext } from '../../decorator/user.decorator';
import { AuthGuard } from '../../guard/auth.guard';
import { RoleGuard } from '../../guard/role.guard';
import { ArticleService } from '../article/article.service';
import { JwtPayload } from '../auth/auth.service';
import { TweetAuthorService } from './author/tweet.author.service';
import { TweetType } from './tweet.entity';
import { TweetService } from './tweet.service';

@ApiTags('Tweet')
@Controller('tweet')
export class TweetController {
	private readonly supportedSocialMediaLinks = ['twitter.com', 'twitter.de', 'twitter.fr', 'twitter.co.uk'];

	constructor(
		private readonly tweetService: TweetService,
		private readonly userService: UserService,
		private readonly twitterService: TwitterService,
		private readonly authorService: TweetAuthorService,
		private readonly logger: NewsHubLogger,
		private readonly articleService: ArticleService,
		private readonly newsPageService: NewsPageService,
		private readonly hashtagService: HashtagService,
	) {
		this.logger.setContext(TweetController.name);
	}

	@Get('user')
	@UseGuards(new AuthGuard())
	@ApiOkResponse({
		description: 'Get all tweets of requesting user',
		type: PaginatedTweetResponse,
	})
	async getTweetsByUserToken(
		@UserContext() jwtPayload: JwtPayload,
		@Query() queryParameter: TweetQueryParamter,
	): Promise<PaginatedTweetResponse> {
		const { sub } = jwtPayload;
		// Check if requesting user exists
		const user = await this.userService.findById(sub);
		if (!user) {
			throw new BadRequestException(UserErrorCodes.USER_NOT_FOUND);
		}
		const { tweets, total } = await this.tweetService.findAllByUserId(user.id, queryParameter);
		return {
			tweets,
			total,
		};
	}

	@Get(':tweet_id')
	@UseGuards(new AuthGuard())
	@ApiOkResponse({
		description: 'Get tweet info by id',
		type: [TweetResponse],
	})
	async getTweetByUserAndTweetId(
		@Param('tweet_id') tweetId: string,
		@UserContext() jwtPayload: JwtPayload,
	): Promise<TweetResponse> {
		const { sub } = jwtPayload;
		// Check if requesting user exists
		const user = await this.userService.findById(sub);
		if (!user) {
			throw new BadRequestException(UserErrorCodes.USER_NOT_FOUND);
		}
		const tweet = await this.tweetService.findByIdAndUser(tweetId, user);
		if (!tweet) {
			throw new BadRequestException(TweetErrorCode.TWEET_NOT_FOUND);
		}

		return tweet;
	}

	@Get('')
	@UseGuards(new AuthGuard())
	@UseGuards(new RoleGuard(UserRole.ADMIN))
	@ApiOkResponse({
		description: 'Get all tweets',
		type: [TweetResponse],
	})
	async getAllTweets(): Promise<TweetResponse[]> {
		return this.tweetService.findAll();
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
		const existingTweet = await this.tweetService.findByTweetIdAndUser(tweetId, user);
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
		} else {
			const authorUpdatedAt = author.updatedAt?.getTime() || 0;
			const now = new Date().getTime();
			if (now - authorUpdatedAt > 30 * 24 * 60 * 60 * 1000) {
				this.logger.debug(
					`The author with id '${tweetAuthor.id}' was updated more than 30 days ago, updating it`,
				);
				await this.authorService.update(author, tweetAuthor);
			}
		}

		const tweetType = [];
		if (author.type === AuthorType.NEWS_OUTLET) {
			this.logger.debug(`The author with id '${tweetAuthor.id}' is a news outlet`);
			tweetType.push(TweetType.AUTHOR_IS_NEWS_OUTLET);
		}

		const tweet = await this.tweetService.create({
			url,
			author,
			user,
			tweetData: data,
			type: tweetType,
		});

		if (data.entities.hashtags) {
			for (const hashtag of data.entities.hashtags) {
				const hashtagEntity = await this.hashtagService.findByName(hashtag.tag);
				if (!hashtagEntity) {
					await this.hashtagService.create(hashtag.tag, [tweet]);
				} else {
					await this.hashtagService.addTweet(hashtagEntity, tweet);
				}
			}
		}

		if (data.entities.urls) {
			const linksInTweet = this.tweetService.getLinksFromTweet(data.entities.urls);
			const classifiedLinks = await this.newsPageService.areNewsLinks(linksInTweet);
			const newsLinks = classifiedLinks.filter((l) => l.isNews && l.newsPage !== undefined) as NewsLinks[];

			if (classifiedLinks.length > 0) {
				await this.tweetService.addTweetType(tweet, TweetType.CONTAINS_NEWS_ARTICLE);
			}
			await this.articleService.createManyByUrl(newsLinks, tweet);
		}
	}
}
