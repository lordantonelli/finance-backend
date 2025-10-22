import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter';
import { ValidationError, useContainer } from 'class-validator';
import {
  StandardErrorResponse,
  ValidationErrorDetail,
} from '@shared/filters/standard-error-response';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Finances API')
    .setDescription('API documentation for the Finances application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [StandardErrorResponse, ValidationErrorDetail],
  });

  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (validationErrors: ValidationError[] = []) =>
        new BadRequestException(validationErrors),
    }),
  );

  // wrap AppModule with UseContainer to force async validation on TypeORM
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
