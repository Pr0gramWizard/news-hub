import { Tweet } from '@tweet/tweet.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CreateUserDTO } from '../../types/dto/user';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	password!: string;

	@Column({ unique: true })
	email!: string;

	@OneToMany(() => Tweet, (tweet) => tweet.user, { eager: true })
	tweets!: Tweet[];

	@CreateDateColumn()
	createdAt!: Date;

	constructor(props?: CreateUserDTO) {
		if (props) {
			const { password, email } = props;
			this.password = password;
			this.email = email;
			this.tweets = [];
		}
	}
}
