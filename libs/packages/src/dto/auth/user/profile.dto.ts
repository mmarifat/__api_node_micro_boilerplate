import { Allow, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class ProfileDto {
    @Allow()
    _id: Types.ObjectId;

    @ApiProperty({ example: 'url' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    coverImageUrl: string;

    @ApiProperty({ example: 'url' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    profileImageUrl: string;

    @ApiProperty({ example: 'Lorem Ipsum' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    @MaxLength(450, { message: 'Maximum 450 character supported' })
    description: string;

    @ApiProperty({ example: 'Lorem Ipsum' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    presentAddress: string;

    @ApiProperty({ example: 'Lorem Ipsum' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    permanentAddress: string;

    @ApiProperty({ example: 'Lorem Ipsum' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    companyAddress: string;
}
