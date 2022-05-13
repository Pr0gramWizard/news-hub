import { User } from '@user/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { TweetProps } from '../../types/dto/tweet';
import { WebContent } from '../webcontent/webcontent.entity';
import { Author } from './author/tweet.author.entity';
import { Hashtag } from './hashtag/hashtag.entity';

@Entity()
export class Tweet {
	@PrimaryColumn({ unique: true })
	id!: string;

	@Column({ type: 'text', nullable: true })
	text?: string;

	@Column()
	retweets!: number;

	@Column()
	likes!: number;

	@Column()
	totalComments!: number;

	@Column()
	totalQuotes!: number;

	@Column({ length: 500 })
	url!: string;

	@Column({ length: 50, nullable: true })
	language?: string;

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
		if (props) {
			const {
				id,
				author,
				hashtags,
				language,
				likes,
				retweets,
				text,
				totalComments,
				totalQuotes,
				url,
				user,
				webContents,
			} = props;
			this.id = id;
			this.author = author;
			this.hashtags = hashtags;
			this.language = language;
			this.likes = likes || 0;
			this.retweets = retweets || 0;
			this.text = text;
			this.totalComments = totalComments || 0;
			this.totalQuotes = totalQuotes || 0;
			this.url = url;
			this.user = user;
			this.webContents = webContents || [];
		}
		this.createdAt = new Date();
	}
}
