import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity({ name: 'old_tweets' })
export class OldTweet {

    @PrimaryColumn({ name: 'id_str' })
    id!: string;

    @Column({ nullable: true })
    text!: string;

    @Column({ nullable: true })
    description!: string;

    @Column({ name: 'user_name'})
    userName!: string;

    @Column({ nullable: true })
    country!: string;

    @Column({ name: 'is_verified'})
    isVerified!: boolean;

    @Column({ name: 'created_at' })
    createdAt!: Date;

    @Column({ nullable: true })
    source!: string;

    @Column()
    score!: number;

    @Column()
    magnitude!: number;

    @Column({ name: 'user_friend_count' })
    userFriendCount!: number;

    @Column({ name: 'user_followers_count' })
    userFollowerCount!: number;
}
