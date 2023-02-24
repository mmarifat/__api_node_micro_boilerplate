import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { AppModule } from '@gateway/src/app.module';
import { HttpFieldExceptionFilter, HttpSystemExceptionFilter } from '@packages/exceptions/http/filters';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    const port = configService.get<number>('APP_PORT');
    const environment = process.env.NODE_ENV;

    app.setGlobalPrefix('api/v1');
    app.disable('x-powered-by', 'X-Powered-By');
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

    app.enableCors();
    app.use(cookieParser());

    app.useGlobalFilters(new HttpSystemExceptionFilter());
    app.useGlobalFilters(new HttpFieldExceptionFilter());

    if (configService.get<string>('ENABLE_COMPRESSION') === 'true') app.use(compression());

    // swagger documentation
    const docTag = 'api-documentation';
    const config = new DocumentBuilder()
        .setTitle('api-mongo-micro API - ' + environment + ' mode')
        .setDescription('api-mongo-micro API - ' + environment + ' mode')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(docTag, app, document, {
        swaggerOptions: {
            persistAuthorization: environment === 'development',
        },
    });

    await app.listen(port);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }

    const logger = new Logger('api-mongo-micro-gateway');
    logger.verbose(`✩✩✩ Running in '${environment}' mode`);
    logger.verbose(`✩✩✩ Api is running in http://localhost:${port}`);
    logger.verbose(`✩✩✩ Documentation is running in http://localhost:${port}/${docTag}`);
}
bootstrap();
