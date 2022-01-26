import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RedisImageDto {
    @ApiProperty()
    @IsString({ message: 'File name must be a string' })
    filename: string;
}
