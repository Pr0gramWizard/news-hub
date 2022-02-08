import { ApiProperty } from '@nestjs/swagger';
import { OldTweetFrequencyResponse, OldTweetTopTweetersResponse, OldTweetUserGroupResponse } from './old.tweet';

export class StatsResponse {
	@ApiProperty()
	numberOfTweets!: number;

	@ApiProperty()
	numberOfOldTweets!: number;

	@ApiProperty()
	numberOfAuthors!: number;

	@ApiProperty()
	numberOfUsers!: number;

	@ApiProperty()
	oldTweetsUserGroups!: OldTweetUserGroupResponse;

	@ApiProperty()
	oldTweetsFrequencyByDay!: OldTweetFrequencyResponse;

	@ApiProperty()
	topTweeters!: OldTweetTopTweetersResponse;
}
