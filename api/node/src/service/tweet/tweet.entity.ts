import { User } from '@user/user.entity';
import { TweetEntitiesV2 } from 'twitter-api-v2';
import {
	AfterLoad,
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { TweetProps } from '@type/dto/tweet';
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

	@Column({ type: 'boolean', default: false, name: 'is_news_related' })
	isNewsRelated!: boolean;

	@Column({
		default: null,
		nullable: true,
		type: 'set',
		enum: TweetType,
	})
	userClassification!: TweetType[];

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

	@ManyToOne(() => Author, { onDelete: 'CASCADE' })
	author!: Author;

	@Column({ type: 'json', nullable: true })
	entities?: TweetEntitiesV2;

	@ManyToOne('User', { onDelete: 'CASCADE' })
	user!: User;

	@Column({ name: 'created_at' })
	createdAt!: Date;

	@Column({ name: 'seen_at' })
	seenAt!: Date;

	constructor(props?: TweetProps) {
		Object.assign(this, props);
	}

	@AfterLoad()
	afterLoad() {
		if (!this.userClassification) {
			return;
		}

		this.isNewsRelated =
			this.userClassification.includes(TweetType.CONTAINS_NEWS_ARTICLE) ||
			this.userClassification.includes(TweetType.AUTHOR_IS_NEWS_OUTLET);
	}
}
