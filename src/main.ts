import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  const apiPrefix = configService.get('API_PREFIX', 'api');

  app.setGlobalPrefix(apiPrefix);

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Multi-tenant EPOS API')
      .setDescription('Multi-tenant Electronic Point of Sale system API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication')
      .addTag('Business')
      .addTag('Items')
      .addTag('Orders')
      .addTag('Payments')
      .addTag('Notifications')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  const port = configService.get('PORT', 3011);

  await app.listen(port);

  console.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  if (configService.get('NODE_ENV') !== 'production') {
    console.log(
      `📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`,
    );
  }
}

bootstrap();
