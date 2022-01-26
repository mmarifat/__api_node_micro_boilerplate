import { ApiBody } from '@nestjs/swagger';
import * as multer from 'multer';
import { extname } from 'path';
import { SystemException } from '../../../package/exceptions/system.exception';

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        return callback(new SystemException({ message: 'Only image files are allowed!' }), false);
    }
    callback(null, true);
};

export const pdfFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(pdf|PDF)$/)) {
        return callback(new SystemException({ message: 'Only pdf files are allowed!' }), false);
    }
    callback(null, true);
};

export const noVideoFilter = (req, file, callback) => {
    if (file.mimetype.includes('video')) {
        return callback(new SystemException({ message: 'Video can not be uploaded' }), false);
    }
    callback(null, true);
};

export const xlsxFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(xls|XLS|xlsx|XLSX)$/)) {
        return callback(new SystemException({ message: 'Only xls or xlsx files are allowed!' }), false);
    }
    callback(null, true);
};

export const editedFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = new Date().getTime();
    callback(null, `${name}-${randomName}${fileExtName}`);
};

export const storage = multer.diskStorage({
    destination: 'storage/temp/',
    filename: editedFileName,
});

export const ApiFile =
    (fileName = 'image'): MethodDecorator =>
    (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    [fileName]: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        })(target, propertyKey, descriptor);
    };

export const ApiMultiFile =
    (fileName = 'image'): MethodDecorator =>
    (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        ApiBody({
            type: 'multipart/form-data',
            required: true,
            schema: {
                type: 'object',
                properties: {
                    [fileName]: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'binary',
                        },
                    },
                },
            },
        })(target, propertyKey, descriptor);
    };

export const ImagePath = {
    USER_PROFILE: 'user-profile/',
    PDF: 'pdf/',
};
