import { ApiProperty } from '@nestjs/swagger';

export class NewsPageResponse {
	@ApiProperty()
	country?: string;

	@ApiProperty()
	id!: string;
	
	@ApiProperty()
	language!: string;

	@ApiProperty()
	topic?: string;

	@ApiProperty()
	url!: string;
}
