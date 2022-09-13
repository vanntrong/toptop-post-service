import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from '@/config/configuration';
import { Logger } from '@/loaders/logger/loggerLoader';
import { AllExceptionFilter } from '@/errors/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  // app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionFilter(logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidUnknownValues: true,
      // forbidNonWhitelisted: true,
      // skipMissingProperties: true,
      // skipUndefinedProperties: true,
      // skipNullProperties: true,
    }),
  );
  app.setGlobalPrefix('v1');

  await app.listen(config.APP_PORT || 8084);

  logger.log(`Server running on port ${config.APP_PORT}`);
}
bootstrap();
