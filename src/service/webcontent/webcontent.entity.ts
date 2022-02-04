import { ICreateWebContent } from '@interface/webcontent';
import { Tweet } from '@tweet/tweet.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';

@Entity()
export class WebContent {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'text' })
	url = '';

	@Column({ type: 'text' })
	content = '';

	@Column('simple-array')
	media: string[] = [];

	@ManyToOne(() => Tweet, { cascade: true })
	tweet!: Tweet;

	@CreateDateColumn()
	createdAt!: Date;

	constructor(props?: ICreateWebContent) {
		if (props) {
			const { url, content, media, tweet } = props;
			this.id = v4();
			this.url = url;
			this.content = content || '';
			this.media = media;
			this.tweet = tweet;
		}
	}
}
