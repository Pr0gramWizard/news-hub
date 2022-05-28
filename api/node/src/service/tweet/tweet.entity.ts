import { User } from '@user/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TweetProps } from '../../types/dto/tweet';
import { Article } from '../article/article.entity';
import { Author } from './author/tweet.author.entity';
import { Hashtag } from './hashtag/hashtag.entity';

export enum TweetType {
	NORMAL = 'NORMAL',
	CONTAINS_NEWS_ARTICLE = 'CONTAINS_NEWS_ARTICLE',
	AUTHOR_IS_NEWS_OUTLET = 'AUTHOR_IS_NEWS_OUTLET',
}

@Entity()
export class Tweet {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'text' })
	tweetId!: string;

	@Column({ type: 'text', nullable: true })
	text?: string;

	@Column({ default: 0 })
	retweets!: number;

	@Column({ default: 0 })
	likes!: number;

	@Column({
		type: 'set',
		enum: TweetType,
		default: [TweetType.NORMAL],
	})
	type!: TweetType[];

	@Column({ default: 0 })
	totalComments!: number;

	@Column({ default: 0 })
	totalQuotes!: number;

	@Column({ length: 500 })
	url!: string;

	@Column({ length: 50, nullable: true })
	language?: string;

	@OneToMany(() => Article, (article) => article.tweet)
	articles?: Article[];

	@ManyToMany(() => Hashtag, (hashtag) => hashtag.tweets)
	@JoinTable({ name: 'tweet_hashtag' })
	hashtags!: Hashtag[];

	@ManyToOne(() => Author)
	author!: Author;

	@ManyToOne('User')
	user!: User;

	@Column({ name: 'created_at' })
	createdAt!: Date;

	constructor(props?: TweetProps) {
		this.type = [TweetType.NORMAL];
		Object.assign(this, props);
		this.createdAt = new Date();
	}
}
