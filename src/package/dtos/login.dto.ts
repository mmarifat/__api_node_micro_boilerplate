import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BoolEnum } from '../enums/bool.enum';
import { Transform } from 'class-transformer';

export class LoginDto {
    @ApiProperty()
    @IsDefined({ message: 'User name must be present' })
    @IsNotEmpty({ message: 'Must be non empty' })
    @IsString({ message: 'Must be a string' })
    @Transform(({ value }) => (value || '').toString().toLowerCase())
    userName: string;

    @ApiProperty()
    @IsDefined({ message: 'Password must be present' })
    @IsNotEmpty({ message: 'Must be non empty' })
    @IsString({ message: 'Must be a string' })
    @MinLength(4, { message: 'Minimum 4 characters for password is supported' })
    @MaxLength(20, { message: 'Maximum 20 characters for password is supported' })
    password: string;

    @ApiProperty({ default: 1 })
    @IsOptional({ message: 'By default isRemembered to false' })
    @IsInt({ message: 'Must be an integer value' })
    @IsEnum(BoolEnum, { message: 'Can be either 0 or 1' })
    isRemembered: BoolEnum;
}
