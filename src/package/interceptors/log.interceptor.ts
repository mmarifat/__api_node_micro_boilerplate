import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { LogDto, LogRequestResponseDto } from '../colllections/dtos/log.dto';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LogDocument, LogEntity } from '../colllections/schemas/log.schema';

@Injectable()
export class LogInterceptor implements NestInterceptor {
    constructor(
        private readonly configService: ConfigService,
        @InjectModel(LogEntity.name)
        private readonly logModel: Model<LogDocument>,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const http = context.switchToHttp();
        const request = http.getRequest();
        const { method, socket, url, body } = request;
        const payload = request['__auth_user'];

        const enableLogging = this.configService.get<string>('ENABLE_LOGGING');
        if (enableLogging === 'true') {
            const requestLog = new LogDto();
            requestLog.type = 'error';
            requestLog.method = method;
            requestLog.url = url;
            requestLog.remoteAddress = socket.remoteAddress;
            requestLog.createdBy = payload?._id ? new Types.ObjectId(payload?._id) : null;
            requestLog.updatedBy = payload?._id ? new Types.ObjectId(payload?._id) : null;

            const context = new LogRequestResponseDto();
            context.body = body;
            context.response = null;
            requestLog.context = context;

            const created: LogDocument = await this.logModel.create(requestLog);

            return next.handle().pipe(
                tap({
                    next: (response) => {
                        context.response = response;
                        // response might be bigger , so await is not suggested
                        this.logModel
                            .updateOne(
                                {
                                    _id: created._id,
                                },
                                {
                                    type: 'success',
                                    context: context,
                                },
                            )
                            .exec();
                    },
                    error: (err) => {
                        context.response = typeof err === 'object' ? JSON.parse(JSON.stringify(err)) : err;
                        this.logModel
                            .updateOne(
                                {
                                    _id: created._id,
                                },
                                {
                                    context: context,
                                },
                            )
                            .exec();
                    },
                }),
            );
        } else {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return next.handle().pipe(tap(() => {}));
        }
    }
}
