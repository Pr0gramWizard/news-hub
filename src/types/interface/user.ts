import { IsNotEmpty, IsString } from 'class-validator';

export interface ICreateUserResponse {
	token: string;
}
export interface IGetUserResponse {
	id: string;
	numberOfCollectedTweets: number;
	createdAt: Date;
}

export class ICreateUserRequest {
	@IsString()
	@IsNotEmpty()
	password!: string;
	@IsString()
	@IsNotEmpty()
	email!: string;
}

export interface ICreateUser {
	password: string;
	email: string;
}

export interface ILoginUserRequest {
	email: string;
	password: string;
}
