import { Tweet } from '@tweet/tweet.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CreateAuthor } from '../../../types/dto/author';

@Entity()
export class Author {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	username!: string;

	@Column()
	location!: string;

	@Column({ type: 'text' })
	bio!: string;

	@Column()
	isVerified!: boolean;

	@Column()
	numberOfTweets!: number;

	@Column()
	numberOfFollower!: number;

	@OneToMany(() => Tweet, (tweet) => tweet.author)
	tweets!: Tweet[];

	@CreateDateColumn()
	createdAt!: Date;

	constructor(props?: CreateAuthor) {
		if (props) {
			const { userId, username, location, bio, isVerified, numberOfFollower, numberOfTweets } = props;
			this.id = userId;
			this.username = username;
			this.location = location || 'unknown';
			this.bio = bio || '';
			this.isVerified = isVerified || false;
			this.numberOfFollower = numberOfFollower;
			this.numberOfTweets = numberOfTweets;
		}
	}
}
