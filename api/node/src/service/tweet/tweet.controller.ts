import { NewsHubLogger } from '@common/logger.service';
import { TwitterService } from '@common/twitter.service';
import { isUndefinedOrEmptyObject } from '@common/util';
import { BadRequestException, Body, Controller, Get, Param, Post, Query, Res, StreamableFile } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { AuthorType } from '@tweet/author/tweet.author.entity';
import { HashtagService } from '@tweet/hashtag/hashtag.service';
import {
	ClassifyTweetDto,
	FileExportFormat,
	LimitQuery,
	OrderQuery,
	PageQuery,
	PaginatedTweetResponse,
	SearchTermQuery,
	SortQuery,
	StoreTweetRequest,
	TweetQueryParameter,
	TweetResponse,
} from '@type/dto/tweet';
import { TwitterApiException } from '@type/error/general';
import { TweetErrorCode } from '@type/error/tweet';
import { UserService } from '@user/user.service';
import { NewsLinks, NewsPageService } from 'service/news-page/news.page.service';
import { URL } from 'url';
import { UserContext } from '../../decorator/user.decorator';
import { ArticleService } from '../article/article.service';
import { JwtPayload } from '../auth/auth.service';
import { TweetAuthorService } from './author/tweet.author.service';
import { TweetType } from './tweet.entity';
import { TweetService } from './tweet.service';
import { Auth } from '../../decorator/auth.decorator';
import { UserRole } from '@user/user.entity';
import { rm, writeFile } from 'fs/promises';
import { createReadStream } from 'fs';
import * as json2csv from 'json2csv';
import { Response } from 'express';

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
	@Auth()
	@ApiOkResponse({
		description: 'Get all tweets of requesting user',
		type: PaginatedTweetResponse,
	})
	@ApiBearerAuth()
	@ApiQuery({ name: 'searchTerm', type: SearchTermQuery })
	@ApiQuery({ name: 'limit', type: LimitQuery })
	@ApiQuery({ name: 'page', type: PageQuery })
	@ApiQuery({ name: 'sort', type: SortQuery })
	@ApiQuery({ name: 'order', type: OrderQuery })
	async getTweetsByUserToken(
		@UserContext() jwtPayload: JwtPayload,
		@Query() queryParameter: TweetQueryParameter,
	): Promise<PaginatedTweetResponse> {
		const { sub } = jwtPayload;
		// Check if requesting user exists
		const user = await this.userService.findByIdOrFail(sub);
		const { tweets, total } = await this.tweetService.findAllByUserId(user.id, queryParameter);
		return {
			tweets,
			total,
		};
	}

	@Get(':tweet_id')
	@Auth()
	@ApiOkResponse({
		description: 'Get tweet info by id',
		type: [TweetResponse],
	})
	@ApiBadRequestResponse({
		description: TweetErrorCode.TWEET_NOT_FOUND,
	})
	async getTweetByUserAndTweetId(
		@Param('tweet_id') tweetId: string,
		@UserContext() jwtPayload: JwtPayload,
	): Promise<TweetResponse> {
		const { sub } = jwtPayload;
		// Check if requesting user exists
		const user = await this.userService.findByIdOrFail(sub);
		const isAdmin = this.userService.isAdmin(user);
		if (isAdmin) {
			const tweet = await this.tweetService.findById(tweetId);
			if (!tweet) {
				throw new BadRequestException(TweetErrorCode.TWEET_NOT_FOUND);
			}
			return tweet;
		}
		const tweet = await this.tweetService.findByIdAndUser(tweetId, user);
		if (!tweet) {
			throw new BadRequestException(TweetErrorCode.TWEET_NOT_FOUND);
		}
		return tweet;
	}

	@Get('is/news')
	@Auth()
	@ApiOkResponse({
		description: 'Get all news related tweets of requesting user',
		type: [TweetResponse],
	})
	@ApiBadRequestResponse({
		description: 'User not found',
	})
	async getAllNewsRelatedTweetsByUser(@UserContext() jwtPayload: JwtPayload): Promise<TweetResponse[]> {
		const { sub } = jwtPayload;
		// Check if requesting user exists
		const user = await this.userService.findByIdOrFail(sub);
		const tweets = await this.tweetService.findAllNewsRelatedTweetsByUser(user);
		this.logger.debug(`Found ${tweets.length} news related tweets`);
		return tweets;
	}

	@Get('')
	@Auth()
	@ApiOkResponse({
		description: 'Get all tweets',
		type: [TweetResponse],
	})
	@ApiQuery({ name: 'searchTerm', type: SearchTermQuery })
	@ApiQuery({ name: 'limit', type: LimitQuery })
	@ApiQuery({ name: 'page', type: PageQuery })
	@ApiQuery({ name: 'sort', type: SortQuery })
	@ApiQuery({ name: 'order', type: OrderQuery })
	async getAllTweets(@Query() queryParameter: TweetQueryParameter): Promise<PaginatedTweetResponse> {
		return this.tweetService.findPaginated(queryParameter);
	}

	@Post('')
	@Auth()
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
		const user = await this.userService.findByIdOrFail(sub);
		// Parse and validate passed url. Currently, we only support Twitter urls
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

		const tweetType = [TweetType.NORMAL];
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

	@Post('/classify')
	@Auth()
	@ApiCreatedResponse({
		description: 'Stored the tweet in the database',
	})
	@ApiNotFoundResponse({
		description: 'User not found',
	})
	@ApiBadRequestResponse({
		description: 'Either the tweet url is not valid or there was an error with the data the Twitter API returned',
	})
	async classifyTweet(@UserContext() jwtUser: JwtPayload, @Body() data: ClassifyTweetDto) {
		const user = await this.userService.findByIdOrFail(jwtUser.sub);
		const { tweetId, classifications } = data;
		const tweet = await this.tweetService.findByIdAndUser(tweetId, user);
		if (!tweet) {
			throw new BadRequestException(TweetErrorCode.TWEET_NOT_FOUND);
		}
		await this.tweetService.setUserClassification(tweet.id, classifications);
	}

	@Get('export/:format')
	@Auth(UserRole.ADMIN)
	@ApiCreatedResponse({
		description: 'Stored the tweet in the database',
	})
	async exportTweets(
		@Param() params: FileExportFormat,
		@Res({ passthrough: true }) res: Response,
	): Promise<StreamableFile> {
		const { format } = params;
		const allTweets = await this.tweetService.findAll();
		const csvFileName = 'tweets.csv';
		const jsonFileName = 'tweets.json';

		this.logger.debug(`Exporting ${allTweets.length} tweets to ${format}`);
		if (format !== 'csv' && format !== 'json') {
			throw new BadRequestException(TweetErrorCode.INVALID_FORMAT);
		}
		if (format === 'json') {
			// Export to JSON
			await rm(jsonFileName, { force: true });
			await writeFile(jsonFileName, JSON.stringify(allTweets), { encoding: 'utf8', flag: 'w+' });
			const file = await createReadStream(jsonFileName, { encoding: 'utf8' });
			res.set({
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename=${jsonFileName}`,
			});
			return new StreamableFile(file);
		}
		// Export to CSV
		await rm(csvFileName, { force: true });
		const csvData = json2csv.parse(allTweets);
		await writeFile(csvFileName, csvData, { encoding: 'utf8', flag: 'w+' });
		const csvFile = await createReadStream(csvFileName, { encoding: 'utf8' });
		res.set({
			'Content-Type': 'text/csv',
			'Content-Disposition': `attachment; filename=${csvFileName}`,
		});
		return new StreamableFile(csvFile);
	}
}
