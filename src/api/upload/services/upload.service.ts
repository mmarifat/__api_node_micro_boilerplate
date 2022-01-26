import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as gm from 'gm';
import * as fs from 'fs';
import { RedisService } from 'nestjs-redis';
import { RedisEnum } from '../../../package/enums/redis.enum';
import { SystemException } from '../../../package/exceptions/system.exception';
import { ExceptionService } from '../../../package/services/exception.service';

interface UploadSuccessInterface {
    filename: string;
    destination: string;
}

@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);

    constructor(private redisService: RedisService, private readonly exceptionService: ExceptionService) {}

    gmCompression = async (
        file: string,
        filepath: string,
        filename: string,
        width = 110,
        height = 110,
    ): Promise<UploadSuccessInterface> => {
        try {
            if (!file) {
                this.exceptionService.exception(HttpStatus.GONE, 'Image is uploaded already!');
            }
            const destinationDir = (await this.generateFolder(filepath)) + filename;
            await gm.subClass({ imageMagick: true });
            await gm(file)
                .strip()
                .blur(0.3)
                .quality(80)
                .resize(width, height, '!')
                .noProfile()
                .compress('LZMA')
                .write(destinationDir, (err: Error) => {
                    if (!err) {
                        this.removeTempFile(filename);
                    } else {
                        this.logger.log('gm compression error', err);
                        this.exceptionService.exception(HttpStatus.INTERNAL_SERVER_ERROR, 'Image uploading error');
                    }
                });
            return { filename, destination: destinationDir };
        } catch (e) {
            throw new SystemException(e);
        }
    };

    gmNoCompression = async (file: string, filepath: string, filename: string): Promise<UploadSuccessInterface> => {
        try {
            if (!file) {
                this.exceptionService.exception(HttpStatus.GONE, 'Image is uploaded already!');
            }
            const destinationDir = (await this.generateFolder(filepath)) + filename;
            await gm.subClass({ imageMagick: true });
            await gm(file)
                .quality(100)
                .write(destinationDir, (err: Error) => {
                    if (!err) {
                        this.removeTempFile(filename);
                    } else {
                        this.logger.log('gm error', err);
                        this.exceptionService.exception(HttpStatus.INTERNAL_SERVER_ERROR, 'Image uploading error');
                    }
                });
            return { filename, destination: destinationDir };
        } catch (e) {
            throw new SystemException(e);
        }
    };

    pdf = async (file: string, filepath: string, filename: string): Promise<UploadSuccessInterface> => {
        try {
            if (!file) {
                this.exceptionService.exception(HttpStatus.GONE, 'PDF is uploaded already!');
            }
            const destinationDir = (await this.generateFolder(filepath)) + filename;
            await gm.subClass({ imageMagick: true });
            await gm(file)
                .quality(90)
                .noProfile()
                .compress('LZMA')
                .write(destinationDir, (err: Error) => {
                    if (!err) {
                        this.removeTempFile(filename);
                    } else {
                        this.logger.log('gm pdf error', err);
                        this.exceptionService.exception(HttpStatus.INTERNAL_SERVER_ERROR, 'PDF uploading error');
                    }
                });

            return { filename, destination: destinationDir };
        } catch (e) {
            throw new SystemException(e);
        }
    };

    generateFolder = async (filepath: string): Promise<string> => {
        const destination = 'storage/' + filepath;
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        return Promise.resolve(destination);
    };

    removeTempFile = async (filename: string): Promise<boolean> => {
        const path = 'storage/temp/' + filename;
        try {
            fs.unlinkSync(path);
        } catch (err) {
            this.logger.error('No Such file at path: ' + path);
        }
        await this.redisService.getClient(RedisEnum.REDIS_TMP_FILE).del(filename);
        return Promise.resolve(true);
    };
}
