import { HttpException, HttpStatus } from '@nestjs/common';

export class InternalServerException extends HttpException {
	constructor(detailedErrorMessage = '') {
		super('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
		const message = process.env.NODE_ENV === 'prod' ? 'Internal Server Error' : detailedErrorMessage;
		const errorObject = {
			errorCode: 'ISE-1000',
			message,
		};
		this.message = errorObject.toString();
	}
}

export class TwitterApiException extends HttpException {
	constructor(message = 'There was an error with the data the Twitter API returned') {
		super(message, HttpStatus.BAD_REQUEST);
	}
}
