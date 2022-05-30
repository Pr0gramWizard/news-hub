import { Tweet } from '@tweet/tweet.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum AuthorType {
	NEWS_OUTLET = 'NEWS_OUTLET',
	DEFAULT = 'DEFAULT',
}

@Entity()
export class Author {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	username!: string;

	@Column({ nullable: true })
	avatar!: string;

	@Column({ nullable: true })
	location?: string;

	@Column({ type: 'text', nullable: true })
	bio?: string;

	@Column()
	isVerified!: boolean;

	@Column({ type: 'enum', enum: AuthorType, default: AuthorType.DEFAULT })
	type!: AuthorType;

	@Column()
	numberOfTweets!: number;

	@Column()
	numberOfFollowers!: number;

	@OneToMany(() => Tweet, (tweet) => tweet.author)
	tweets!: Tweet[];

	@CreateDateColumn()
	createdAt!: Date;

	@Column({ type: 'datetime', nullable: true, name: 'updated_at' })
	updatedAt: Date | null;

	constructor(props?: Partial<Author>) {
		Object.assign(this, props);
		this.updatedAt = new Date();
	}
}
