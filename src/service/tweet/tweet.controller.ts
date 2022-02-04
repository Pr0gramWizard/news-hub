import { TwitterService } from '@common/twitter.service';
import { isUndefinedOrEmptyObject } from '@common/util';
import { InternalServerException, TwitterApiException } from '@error/general';
import { UserNotFoundException } from '@error/user';
import { IStoreTweetPayload } from '@interface/tweet';
import { BadRequestException, Body, ConsoleLogger, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { URL } from 'url';
import { UserContext } from '../../decorator/user.decorator';
import { AuthGuard } from '../../guard/auth.guard';
import { JwtPayload } from '../auth/auth.service';
import { WebContentService } from '../webcontent/webcontent.service';
import { TweetAuthorService } from './author/tweet.author.service';
import { TweetService } from './tweet.service';

@Controller('tweet')
export class TweetController {
	private readonly logger = new ConsoleLogger(TweetController.name);
	private readonly supportedSocialMediaLinks = ['twitter.com'];

	constructor(
		private readonly tweetService: TweetService,
		private readonly userService: UserService,
		private readonly twitterService: TwitterService,
		private readonly authorService: TweetAuthorService,
		private readonly webContentService: WebContentService,
	) {}

	@Get(':id')
	async getTweetsByUserToken(@Param('id') id: string) {
		return await this.tweetService.findAllByUserId(id);
	}

	@Post('')
	@UseGuards(new AuthGuard())
	async create(@Body() body: IStoreTweetPayload, @UserContext() jwtPayload: JwtPayload) {
		const { sub } = jwtPayload;
		const { url } = body;
		// Check if requesting user exists
		const user = await this.userService.findById(sub);
		if (!user) {
			throw new UserNotFoundException();
		}
		// Parse and validate passed url. Currently, we only support twitter.com
		const { pathname, hostname } = new URL(url);
		if (!this.supportedSocialMediaLinks.includes(hostname)) {
			throw new BadRequestException(`Currently we do not support ${hostname}`);
		}

		// The tweet id should always be the last path name
		const pathNames = pathname.split('/');
		const tweetId = pathNames.pop();
		if (!tweetId) {
			throw new BadRequestException("The tweet's url is invalid");
		}

		// If the requesting user already has an entry in the database we just return nothing
		const existingTweet = await this.tweetService.findByIdAndUser(tweetId, user);
		if (existingTweet) {
			this.logger.warn('There is already a tweet with this id for the given user');
			return;
		}

		// This is the actual call to the Twitter API
		const twitterApiResponse = await this.twitterService.client.v2.singleTweet(tweetId, {
			expansions: ['author_id', 'attachments.media_keys'],
			'tweet.fields': ['public_metrics', 'source', 'text', 'created_at', 'lang', 'entities'],
			'user.fields': ['id', 'username', 'public_metrics', 'verified', 'name', 'description', 'location'],
		});

		// Parse and validate the response from the Twitter API
		const { data, includes } = twitterApiResponse;
		if (isUndefinedOrEmptyObject(data)) {
			throw new TwitterApiException('Twitter API returned empty data object');
		}
		if (isUndefinedOrEmptyObject(includes)) {
			throw new TwitterApiException('Twitter API returned empty includes object');
		}
		if (isUndefinedOrEmptyObject(data.entities)) {
			throw new TwitterApiException('Twitter API returned empty entities object');
		}
		const listOfRelatedUsers = includes.users;
		if (!listOfRelatedUsers) {
			throw new TwitterApiException('Twitter API returned no list of users for the tweet');
		}
		const tweetAuthor = listOfRelatedUsers.find((u) => u.id === data.author_id);
		if (!tweetAuthor) {
			this.logger.error(`The twitter API did not return any author object for url '${url}'`);
			throw new InternalServerException('The twitter API did not return any author object for url');
		}

		// Create author entity if it does not exist
		let author = await this.authorService.findById(tweetAuthor.id);
		if (!author) {
			author = await this.authorService.create(tweetAuthor);
			this.logger.debug(`There was no author with id '${tweetAuthor.id}' in the database, created a new one`);
		}

		// Create new tweet entity
		const tweet = await this.tweetService.createTweet({ url, author, user, tweetData: data });
		// Create web content entities for the tweet
		await this.webContentService.createMany(data.entities.urls, tweet);
	}

	@Get('hashtag/:hashtag')
	async getTweetsByHashtag(@Param('hashtag') hashtag: string) {
		// Search all is not available unless you get the Academic access
		// Search only returns the tweets of the last 7 days
		const twitterApiResponse = await this.twitterService.client.v2.search(`#${hashtag}`, {
			expansions: ['author_id', 'attachments.media_keys'],
			'tweet.fields': ['public_metrics', 'source', 'text', 'created_at', 'lang', 'entities'],
			'user.fields': ['id', 'username', 'public_metrics', 'verified', 'name', 'description', 'location'],
			'media.fields': ['type'],
			max_results: 10,
		});

		const { data } = twitterApiResponse;

		// const tweets = data.data.map((t) => {
		// 	const { id, text, created_at, author_id, entities } = t;
		// 	const { media } = entities;
		// 	const mediaType = media ? media[0].type : undefined;
		// 	return { id, text, created_at, author_id, mediaType };
		// });

		return twitterApiResponse;
	}
}
