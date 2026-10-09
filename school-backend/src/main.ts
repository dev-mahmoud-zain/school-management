import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const PORT = process.env.PORT;

  if (!PORT) {
    throw new Error('PORT is not defined in .env file');
  }

  await app.listen(PORT);
  console.log(`Application is running on ${process.env.HOST}:${PORT}`);
}

bootstrap();
