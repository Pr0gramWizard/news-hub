import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from '../article/article.entity';

@Entity()
export class NewsSource {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	name!: string;

	@Column({ default: '' })
	brand!: string;

	@Column()
	url!: string;

	@Column({ default: '' })
	description!: string;

	@OneToMany((type) => Article, (article) => article.newsSource)
	articles!: Article[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt!: Date;

	constructor(partial: Partial<NewsSource> = {}) {
		Object.assign(this, partial);
	}
}
