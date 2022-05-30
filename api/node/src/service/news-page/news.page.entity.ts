import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from '../article/article.entity';

@Entity()
export class NewsPage {
	@PrimaryGeneratedColumn()
	id!: string;

	@Column({ unique: true })
	url!: string;

	@Column({ default: null, name: 'lang' })
	language!: string;

	@Column({ nullable: true, default: null })
	topic?: string;

	@Column({ nullable: true, default: null })
	country?: string;

	@OneToMany(() => Article, (article) => article.newsPage)
	articles!: Article[];

	constructor(partial: Partial<NewsPage> = {}) {
		Object.assign(this, partial);
	}
}
