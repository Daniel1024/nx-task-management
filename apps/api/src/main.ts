import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { TransformInterceptor } from './transform.interceptor';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const globalPrefix = 'api';
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3333;
  await app.listen(port);

  logger.log(`Listening at http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
