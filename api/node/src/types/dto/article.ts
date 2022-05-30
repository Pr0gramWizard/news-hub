import { NewsPage } from '../../service/news-page/news.page.entity';
import { Tweet } from '@tweet/tweet.entity';
import { ApiProperty } from '@nestjs/swagger';
import { NewsPageResponse } from '@type/dto/news.page';

export class OpenGraph {
	@ApiProperty()
	description?: string;

	@ApiProperty()
	image?: string;

	@ApiProperty()
	locale?: string;

	@ApiProperty()
	site_name?: string;

	@ApiProperty()
	title?: string;

	@ApiProperty()
	type?: string;

	@ApiProperty()
	url?: string;
}

export class ArticleMetaData {
	@ApiProperty()
	author?: string;

	@ApiProperty()
	date?: Date;

	@ApiProperty()
	description?: string;

	@ApiProperty({ type: OpenGraph })
	og?: OpenGraph;

	@ApiProperty()
	publisher?: string;

	@ApiProperty()
	robots?: string;

	@ApiProperty()
	viewport?: string;
}

export class ArticleResponse {
	@ApiProperty()
	authors!: string[];

	@ApiProperty()
	html!: string;

	@ApiProperty()
	images!: string[];

	@ApiProperty()
	keywords!: string[];

	@ApiProperty({ type: ArticleMetaData })
	metaData!: ArticleMetaData;

	@ApiProperty({ type: NewsPageResponse })
	newsPage!: NewsPageResponse;

	@ApiProperty({ nullable: true, type: Date })
	publishedAt!: Date | null;

	@ApiProperty()
	summary!: string;

	@ApiProperty()
	tags!: string[];

	@ApiProperty()
	text!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	topImage!: string;

	@ApiProperty()
	url!: string;

	@ApiProperty()
	videos?: string[];
}

export interface CreateArticleDto {
	authors?: string[];
	html?: string;
	images?: string[];
	keywords?: string[];
	metaData?: ArticleMetaData;
	publishedAt?: Date;
	summary?: string;
	tags?: string[];
	text?: string;
	title?: string;
	topImage?: string;
	url: string;
	videos?: string[];
	newsPage: NewsPage;
	tweet: Tweet;
}
