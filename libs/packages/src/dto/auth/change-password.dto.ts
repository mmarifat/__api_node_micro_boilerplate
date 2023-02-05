import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty()
    @IsString({ message: 'New password must be a string' })
    newPassword: string;

    @ApiProperty()
    @IsString({ message: 'Confirm password must be a string' })
    confirmPassword: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'UserId must be defined' })
    @IsMongoId({ message: 'Must be a valid authUserId' })
    userId: string;
}
