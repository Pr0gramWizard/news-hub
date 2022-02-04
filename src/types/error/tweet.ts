import { HttpException, HttpStatus } from '@nestjs/common';

export class TweetNotFoundException extends HttpException {
	constructor() {
		super('Tweet not found', HttpStatus.NOT_FOUND);
	}
}
