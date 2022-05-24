import { User } from '@user/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TweetProps } from '../../types/dto/tweet';
import { Article } from '../article/article.entity';
import { WebContent } from '../webcontent/webcontent.entity';
import { Author } from './author/tweet.author.entity';
import { Hashtag } from './hashtag/hashtag.entity';

export enum TweetType {
	NORMAL = 'NORMAL',
	CONTAINS_NEWS_ARTICLE = 'CONTAINS_NEWS_ARTICLE',
	AUTHOR_IS_NEWS_OUTLET = 'AUTHOR_IS_NEWS_OUTLET',
}

@Entity()
export class Tweet {
	@PrimaryColumn({ unique: true })
	id!: string;

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

	@ManyToMany(() => Hashtag, (hashtag) => hashtag.tweets, { cascade: true })
	@JoinTable({ name: 'tweet_hashtag' })
	hashtags!: Hashtag[];

	@ManyToOne(() => Author, { cascade: true })
	author!: Author;

	@OneToMany(() => WebContent, (webContent) => webContent.tweet)
	webContents!: WebContent[];

	@ManyToOne('User')
	user!: User;

	@Column()
	createdAt!: Date;

	constructor(props?: TweetProps) {
		Object.assign(this, props);
		this.createdAt = new Date();
	}
}
