import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tap } from 'rxjs/operators';
import { LogDto, LogRequestResponseDto } from '@packages/dto/core';
import { LogDocument, LogSchema } from '@packages/schemas';
import { MongoService } from '@packages/services';
import { stringToMongoId } from '@packages/mongo';
import { HttpSystemException } from '@packages/exceptions/http';
import { ENUMS } from '@packages/enums';
import CollectionEnum = ENUMS.PROJECT.CollectionEnum;

@Injectable()
export class LogInterceptor implements NestInterceptor {
    constructor(private readonly mongoService: MongoService, private readonly configService: ConfigService) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        try {
            const http = context.switchToHttp();
            const enableLogging = (this.configService.get<string>('ENABLE_LOGGING') || '').toLowerCase();

            if (enableLogging === 'true') {
                const request = http.getRequest();
                const { method, socket, url, body } = request;
                const payload = request.user;

                const requestLog = new LogDto();
                requestLog.type = 'error';
                requestLog.method = method;
                requestLog.url = url;
                requestLog.remoteAddress = socket.remoteAddress;
                requestLog.createdBy = payload?._id ? stringToMongoId(payload?._id) : null;
                requestLog.updatedBy = payload?._id ? stringToMongoId(payload?._id) : null;

                const context = new LogRequestResponseDto();
                context.body = body;
                context.response = null;
                requestLog.context = context;

                const created: LogDocument = await this.mongoService
                    .httpGetModel<LogDocument>({ schema: LogSchema, collection: CollectionEnum.LOGS })
                    .create(requestLog);

                return next.handle().pipe(
                    tap({
                        next: (response) => {
                            context.response = response;
                            // response might be bigger , so await is not suggested
                            this.mongoService
                                .httpGetModel<LogDocument>({ schema: LogSchema, collection: CollectionEnum.LOGS })
                                .updateOne(
                                    {
                                        _id: created._id,
                                    },
                                    {
                                        type: 'success',
                                        context,
                                    },
                                )
                                .exec();
                        },
                        error: (err) => {
                            context.response = typeof err === 'object' ? JSON.parse(JSON.stringify(err)) : err;
                            this.mongoService
                                .httpGetModel<LogDocument>({ schema: LogSchema, collection: CollectionEnum.LOGS })
                                .updateOne(
                                    {
                                        _id: created._id,
                                    },
                                    { context },
                                )
                                .exec();
                        },
                    }),
                );
            } else {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                return next.handle().pipe(tap(() => {}));
            }
        } catch (error) {
            throw new HttpSystemException(error);
        }
    }
}
