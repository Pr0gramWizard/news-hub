import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Tweet } from '../tweet.entity';

@Entity()
export class Hashtag {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column({ type: 'text' })
	name!: string;

	@ManyToMany(() => Tweet, (tweet) => tweet.hashtags)
	tweets!: Tweet[];

	@CreateDateColumn()
	createdAt!: Date;

	constructor(name: string) {
		this.name = name;
	}
}
