import {ApiProperty} from '@nestjs/swagger';

export class ChartData {
	@ApiProperty()
	label!: string;

	@ApiProperty()
	value!: number;
}

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
    numberOfHashtags!: number;

    @ApiProperty()
    numberOfLanguages!: number;

    @ApiProperty()
    numberOfVerifiedUsers!: number;

    @ApiProperty()
    oldTweetGroupedByMonth!: ChartData[];
}
