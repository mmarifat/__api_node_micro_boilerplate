import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './services/upload.service';
import { UploadController } from './controllers/upload.controller';

@Module({
    providers: [UploadService, ConfigService],
    controllers: [UploadController],
})
export class UploadModule {}
