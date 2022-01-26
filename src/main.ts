import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemExceptionFilter } from './package/exceptions/filters/system-exception.filter';
import { FieldExceptionFilter } from './package/exceptions/filters/field-exception.filter';
import * as compression from 'compression';

async function bootstrap() {
    const logger = new Logger('nest-js-mongodb-bootstrap');

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT');
    const environment = process.env.NODE_ENV;

    app.setGlobalPrefix('api/v1');

    // swagger documentation
    const docTag = 'api-doc';
    const config = new DocumentBuilder()
        .setTitle('Nest Js Api BoilerPlate - MongoDB - ' + environment + ' mode')
        .setDescription('Nest Js Api BoilerPlate - MongoDB' + environment + ' mode')
        .setVersion('1.0')
        .addTag(docTag)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(docTag, app, document);

    app.enableCors();
    app.useGlobalFilters(new SystemExceptionFilter());
    app.useGlobalFilters(new FieldExceptionFilter());

    const compressResponse = configService.get<string>('ENABLE_COMPRESSION');
    if (compressResponse === 'true') {
        app.use(compression());
    }

    await app.listen(port);

    logger.log(`Running in '${environment}' mode`);
    logger.log(`Documentation is running in http://localhost:${port}/${docTag}`);
    logger.log(`Api is running in http://localhost:${port}`);
}

bootstrap();
