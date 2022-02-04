import { User } from '@user/user.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { ICreateTweet } from '../../types/interface/tweet';
import { WebContent } from '../webcontent/webcontent.entity';
import { Author } from './author/tweet.author.entity';
import { Hashtag } from './hashtag/hashtag.entity';

@Entity()
export class Tweet {
	@PrimaryColumn({ unique: true })
	id!: string;

	@Column({ length: 300 })
	text!: string;

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

	@Column({ length: 50 })
	language!: string;

	@ManyToMany(() => Hashtag, (hashtag) => hashtag.tweets, { cascade: true })
	@JoinTable({ name: 'tweet_hashtag' })
	hashtags!: Hashtag[];

	@ManyToOne(() => Author, { cascade: true })
	author!: Author;

	@OneToMany(() => WebContent, (webContent) => webContent.tweet)
	webContents!: WebContent[];

	@ManyToOne('User')
	user!: User;

	@CreateDateColumn()
	createdAt!: Date;

	constructor(props?: ICreateTweet) {
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
			this.language = language || 'no-lang';
			this.likes = likes || 0;
			this.retweets = retweets || 0;
			this.text = text || '';
			this.totalComments = totalComments || 0;
			this.totalQuotes = totalQuotes || 0;
			this.url = url;
			this.user = user;
			this.webContents = webContents || [];
		}
	}
}