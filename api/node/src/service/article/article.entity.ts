import { ArticleMetaData } from '@type/dto/article';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NewsPage } from '../news-source/news.page.entity';
import { Tweet } from '../tweet/tweet.entity';

@Entity()
export class Article {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('simple-array')
	authors!: string[];

	@Column('longtext', { default: '' })
	html!: string;

	@Column('simple-array')
	images!: string[];

	@Column('simple-array', { name: 'key_words' })
	keywords!: string[];

	@Column('simple-json', { name: 'meta_data' })
	metaData!: ArticleMetaData;

	@Column('datetime', { name: 'published_at', nullable: true })
	publishedAt!: Date | null;

	@Column('text', { default: '' })
	summary!: string;

	@Column('simple-array')
	tags!: string[];

	@Column({ type: 'longtext', default: '' })
	text!: string;

	@Column({ default: '' })
	title!: string;

	@Column({ name: 'top_image', default: '' })
	topImage!: string;

	@Column({ length: 500 })
	url!: string;

	@Column('simple-array')
	videos!: string[];

	@ManyToOne(() => NewsPage, (newsPage) => newsPage.articles)
	newsPage!: NewsPage;

	@ManyToOne(() => Tweet, (tweet) => tweet.articles)
	tweet!: Tweet;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	constructor(props: Partial<Article> = {}) {
		Object.assign(this, props);
	}
}
