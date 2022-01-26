import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { BaseDto } from './core/base.dto';
import { UserRoleEnum } from '../enums/user-role.enum';

export class UserAuthDto extends BaseDto {
    @ApiProperty()
    @ValidateIf((o) => !o.phone)
    @IsNotEmpty({ message: 'Must be non empty' })
    @IsEmail({}, { message: 'Must be a valid email' })
    @MinLength(4, { message: 'Minimum 4 characters for email is supported' })
    @MaxLength(50, { message: 'Maximum 50 characters for email is supported' })
    email: string;

    @ApiProperty()
    @ValidateIf((o) => !o.email)
    @IsNotEmpty({ message: 'Must be non empty' })
    @IsString({ message: 'Must be a string' })
    @MinLength(2, { message: 'Minimum 4 characters for phone is supported' })
    @MaxLength(15, { message: 'Maximum 15 characters for phone is supported' })
    phone: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Must be non empty' })
    @IsString({ message: 'Must be a string' })
    @MinLength(4, { message: 'Minimum 4 characters for password is supported' })
    @MaxLength(20, { message: 'Maximum 20 characters for password is supported' })
    password: string;

    @ApiProperty({ default: `${Object.values(UserRoleEnum).join(' | ')}` })
    @IsOptional({ message: 'By default isRemembered to false' })
    @IsString({ message: 'Must be an string value' })
    @IsEnum(UserRoleEnum, { message: `Can be either ${Object.values(UserRoleEnum).join(' | ')}` })
    role: UserRoleEnum;
}
