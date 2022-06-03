import { TweetAuthorService } from '@tweet/author/tweet.author.service';
import { NewsHubLogger } from '@common/logger.service';
import { Controller, Get } from '@nestjs/common';
import { Auth } from '../../../decorator/auth.decorator';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthorResponse, AuthorUserCount } from '@type/dto/author';
import { UserContext } from '../../../decorator/user.decorator';
import { JwtPayload } from '../../auth/auth.service';

@ApiTags('Author')
@Controller('author')
export class TweetAuthorController {
	constructor(private readonly authorService: TweetAuthorService, private readonly logger: NewsHubLogger) {
		this.logger.setContext(TweetAuthorController.name);
	}

	@Get('news')
	@Auth()
	@ApiOkResponse({
		description: 'Get top ten news related authors',
		type: [AuthorResponse],
	})
	async getTopTenNewsRelatedAuthors(@UserContext() jwtPayload: JwtPayload): Promise<AuthorUserCount[]> {
		const { sub } = jwtPayload;
		const globalTopTenAuthors = await this.authorService.getTopTenNewsRelatedAuthors();
		const topTenAuthorUsernames = globalTopTenAuthors.map((author) => author.username);
		const userTopTenAuthors = await this.authorService.getNumberOfTweetsByUserAndAuthors(
			sub,
			topTenAuthorUsernames,
		);
		const result: AuthorUserCount[] = [];

		globalTopTenAuthors.forEach((globalAuthor) => {
			const author = userTopTenAuthors.find((localAuthor) => localAuthor.username === globalAuthor.username);
			result.push({
				username: globalAuthor.username,
				totalNumberOfTweets: globalAuthor.tweetCount,
				numberOfTweetsByUser: author ? author.tweetCount : '0',
			});
		});
		return result;
	}
}
