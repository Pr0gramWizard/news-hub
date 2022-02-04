import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
	constructor() {
		super('User with given id not found', HttpStatus.NOT_FOUND);
	}
}
