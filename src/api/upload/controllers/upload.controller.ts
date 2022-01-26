import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RedisService } from 'nestjs-redis';
import { UploadService } from '../services/upload.service';
import { Body, Controller, HttpStatus, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiFile, imageFileFilter, ImagePath, pdfFileFilter, storage } from '../utils/upload.util';
import { RedisImageDto } from '../../../package/dtos/redis-image.dto';
import { RedisEnum } from '../../../package/enums/redis.enum';
import { ResponseService } from '../../../package/services/response.service';
import { DtoValidationPipe } from '../../../package/exceptions/pipes/dto-validation.pipe';
import { OnEvent } from '@nestjs/event-emitter';
import { ControllerEventEnum } from '../../../package/enums/controller-event.enum';

@ApiTags('Upload Service')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
    private readonly logger = new Logger(UploadService.name);
    private readonly expireTime = this.configService.get<number>('IMAGE_EXPIRE_TIME') as number;

    constructor(
        private imageUploadService: UploadService,
        private redisService: RedisService,
        private configService: ConfigService,
        private readonly responseService: ResponseService,
    ) {}

    // User Profile Image part
    @ApiConsumes('multipart/form-data')
    @ApiFile()
    @Post('user-profile-redis')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: storage,
            fileFilter: imageFileFilter,
        }),
    )
    async uploadUserProfileRedis(@UploadedFile() file: Express.Multer.File) {
        await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).set(file.filename, file.path);
        await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).expire(file.filename, this.expireTime);
        const payload = Promise.resolve({
            filename: file.filename,
            path: file.path,
        });
        return this.responseService.toResponse<any>(HttpStatus.CREATED, 'Profile Image uploaded in redis successfully', payload);
    }

    /*
     * if developer want to upload the image with http call
     * this can be done using post request directly
     */
    @Post('user-profile')
    async uploadUserProfile(
        @Body(
            new DtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        redisImageDto: RedisImageDto,
    ) {
        this.logger.log('User Profile Uploading..........');
        const file = await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).get(redisImageDto.filename);
        const success = this.imageUploadService.gmCompression(file, ImagePath.USER_PROFILE, redisImageDto.filename, 600, 500);
        return this.responseService.toResponse(HttpStatus.CREATED, 'Profile Image uploaded successfully', success);
    }

    /*
     * if developer want to upload the image with the payload
     * this can be done using
     * constructor (private readonly eventEmitter: EventEmitter2) {}
     * and then
     * this.eventEmitter.emit(ControllerEventEnum.USER_PROFILE_UPLOAD, redisImageDto);
     * redisImageDto will container RedisImageDto variables
     */
    @OnEvent(ControllerEventEnum.USER_PROFILE_UPLOAD, { async: true })
    async uploadUserProfileOnEvent(redisImageDto: RedisImageDto) {
        this.logger.log('User Profile Uploading on event..........');
        const file = await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).get(redisImageDto.filename);
        await this.imageUploadService.gmCompression(file, ImagePath.USER_PROFILE, redisImageDto.filename, 600, 500);
    }

    // PDF Part
    @ApiConsumes('multipart/form-data')
    @ApiFile('file')
    @Post('pdf-redis')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: storage,
            fileFilter: pdfFileFilter,
        }),
    )
    async uploadPdfRedis(@UploadedFile() file: Express.Multer.File) {
        await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).set(file.filename, file.path);
        await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).expire(file.filename, this.expireTime);
        const payload = Promise.resolve({
            filename: file.filename,
            path: file.path,
        });
        return this.responseService.toResponse<any>(HttpStatus.CREATED, 'Pdf uploaded in redis successfully', payload);
    }

    /*
     * if developer want to upload the pdf with http call
     * this can be done using post request directly
     */
    @Post('pdf')
    async uploadPdf(
        @Body(
            new DtoValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        )
        redisImageDto: RedisImageDto,
    ) {
        this.logger.log('PDF Uploading..........');
        const file = await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).get(redisImageDto.filename);
        const success = this.imageUploadService.pdf(file, ImagePath.PDF, redisImageDto.filename);
        return this.responseService.toResponse<any>(HttpStatus.CREATED, 'PDF uploaded successfully', success);
    }
    /*
     * if developer want to upload the pdf with the payload
     * this can be done using
     * constructor (private readonly eventEmitter: EventEmitter2) {}
     * and then
     * this.eventEmitter.emit(ControllerEventEnum.PDF_UPLOAD, redisImageDto);
     * redisImageDto will container RedisImageDto variables
     */
    @OnEvent(ControllerEventEnum.PDF_UPLOAD, { async: true })
    async uploadPdfOnEvent(redisImageDto: RedisImageDto) {
        this.logger.log('PDF Uploading on event..........');
        const file = await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).get(redisImageDto.filename);
        const success = this.imageUploadService.pdf(file, ImagePath.PDF, redisImageDto.filename);
        await this.responseService.toResponse<any>(HttpStatus.CREATED, 'PDF uploaded successfully', success);
    }
}
