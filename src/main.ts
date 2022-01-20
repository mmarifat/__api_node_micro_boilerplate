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

    app.setGlobalPrefix('api/v1');

    // swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Nest Js Api BoilerPlate - MongoDB')
        .setDescription('Nest Js Api BoilerPlate - MongoDB')
        .setVersion('1.0')
        .addTag('nest-js-mongodb')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('nest-js-mongodb', app, document);

    app.enableCors();
    app.useGlobalFilters(new SystemExceptionFilter());
    app.useGlobalFilters(new FieldExceptionFilter());

    const compressResponse = configService.get<string>('ENABLE_COMPRESSION');
    if (compressResponse === 'true') {
        app.use(compression());
    }

    await app.listen(port);

    logger.log(`Documentation is running in http://localhost:${port}/nest-js-mongodb`);
    logger.log(`Api is running in http://localhost:${port}`);
}

bootstrap();
