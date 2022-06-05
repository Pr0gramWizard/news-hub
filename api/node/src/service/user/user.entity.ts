import { Tweet } from '@tweet/tweet.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CreateUserDTO } from '@type/dto/user';

export enum UserRole {
	USER = 'USER',
	ADMIN = 'ADMIN',
	SUPER_ADMIN = 'SUPER_ADMIN',
}

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column()
	name!: string;

	@Column()
	password!: string;

	@Column({ unique: true })
	email!: string;

	@OneToMany(() => Tweet, (tweet) => tweet.user)
	tweets!: Tweet[];

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role!: UserRole;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	constructor(props?: CreateUserDTO) {
		if (props) {
			const { password, email, name, role } = props;
			this.password = password;
			this.email = email;
			this.name = name;
			this.tweets = [];
			this.role = role || UserRole.USER;
		}
	}
}
