import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const PORT = process.env.PORT;

  if (!PORT) {
    throw new Error('PORT is not defined in .env file');
  }

  
  const config = new DocumentBuilder()
    .setTitle('School Management API')
    .setDescription('The school management backend API description')
    .setVersion('1.0')
    .addCookieAuth('Authentication', { type: 'http', in: 'Header', scheme: 'Bearer' }, 'SystemToken')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'BearerToken')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.getHttpAdapter().get('/openapi.json', (req, res) => {
    res.json(document);
  });

  await app.listen(PORT);
  console.log(`Application is running on ${process.env.HOST}:${PORT}`);
}

bootstrap().catch(console.error);
