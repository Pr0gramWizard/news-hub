import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NewsSource } from '../news-source/news.source.entity';
import { ArticleMetaData } from '@type/dto/article';

@Entity()
export class Article {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('simple-array')
	authors!: string[];

	@Column('text', { default: '' })
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

	@Column({ default: '' })
	text!: string;

	@Column({ default: '' })
	title!: string;

	@Column({ name: 'top_image', default: '' })
	topImage!: string;

	@Column({ length: 500 })
	url!: string;

	@Column('simple-array')
	videos!: string[];

	@ManyToOne((type) => NewsSource, (newsSource) => newsSource.articles)
	newsSource!: NewsSource;

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	constructor(props: Partial<Article> = {}) {
		Object.assign(this, props);
	}
}
