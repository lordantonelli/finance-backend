import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
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

  // Add global error responses to all endpoints
  addGlobalErrorResponses(document);

  SwaggerModule.setup('docs', app, document, {
    customCssUrl: '/css/swagger-ui-themes/themes/3.x/theme-flattop.css',
  });

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

function addGlobalErrorResponses(document: OpenAPIObject): void {
  const errorResponseSchema = {
    $ref: '#/components/schemas/StandardErrorResponse',
  };

  const standardErrors = {
    '400': {
      description: 'Invalid data or validation error',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    '401': {
      description: 'Not authenticated',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    '403': {
      description: 'Access denied to this resource',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    '404': {
      description: 'Resource not found',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    '500': {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  };

  for (const path of Object.values(document.paths)) {
    for (const method of Object.values(path)) {
      if (
        typeof method === 'object' &&
        method !== null &&
        'responses' in method
      ) {
        const operation = method as {
          responses: Record<string, unknown>;
          security?: unknown[];
        };

        // Add 400 Bad Request
        if (!operation.responses['400']) {
          operation.responses['400'] = standardErrors['400'];
        }

        // Add 401 Unauthorized for protected endpoints
        if (!operation.responses['401'] && operation.security) {
          operation.responses['401'] = standardErrors['401'];
        }

        // Add 403 Forbidden for protected endpoints
        if (!operation.responses['403'] && operation.security) {
          operation.responses['403'] = standardErrors['403'];
        }

        // Add 500 Internal Server Error
        if (!operation.responses['500']) {
          operation.responses['500'] = standardErrors['500'];
        }
      }
    }
  }
}

void bootstrap();
