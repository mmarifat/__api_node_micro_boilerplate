import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDto } from '@packages/dto/core';
import { ProfileDto } from '@packages/dto/auth';

export class HcaptchaTokenDto {
    @ApiProperty({ example: 'token' })
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    token: string;
}

export class UserDto extends BaseDto {
    @ApiProperty({ example: 'Md Minhaz Ahamed' })
    @IsNotEmpty({ message: 'Must be non empty' })
    @IsString({ message: 'Must be a string' })
    username: string;

    @ApiProperty({ example: 'mma.rifat66@gmail.com' })
    @IsNotEmpty({ message: 'Must be non empty' })
    @IsEmail({}, { message: 'Must be a valid email' })
    @MinLength(4, { message: 'Minimum 4 characters for email is supported' })
    @MaxLength(50, { message: 'Maximum 50 characters for email is supported' })
    email: string;

    @ApiProperty({ example: '123456' })
    @IsOptional({ message: 'Can be optional' })
    @IsString({ message: 'Must be a string' })
    @MinLength(4, { message: 'Minimum 4 characters for password is supported' })
    @MaxLength(50, { message: 'Maximum 50 characters for password is supported' })
    password: string;

    @ApiProperty()
    @IsOptional()
    @IsObject({ each: true })
    @Type(() => ProfileDto)
    profile: ProfileDto;

    hashedRt: string;
}
