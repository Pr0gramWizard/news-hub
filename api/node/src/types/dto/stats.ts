import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class UserStats {
	@ApiProperty()
	@IsNumber()
	value!: number;

	@ApiProperty()
	@IsString()
	label!: string;
}
