import { NewsPage } from '../../service/news-page/news.page.entity';
import { Tweet } from '../../service/tweet/tweet.entity';

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

export interface OpenGraph {
	description: string;
	image: string;
	locale: string;
	site_name: string;
	title: string;
	type: string;
	url: string;
}

export interface ArticleMetaData {
	author?: string;
	date?: Date;
	description?: string;
	og?: OpenGraph;
	publisher?: string;
	robots: string;
	viewport?: string;
}
