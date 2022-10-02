import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from '@/config/configuration';
import { Logger } from '@/loaders/logger/loggerLoader';
import { AllExceptionFilter } from '@/errors/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'content_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useGlobalFilters(new AllExceptionFilter(logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('v1');

  await app.startAllMicroservices();

  await app.listen(config.APP_PORT || 8084);

  logger.log(`Server running on port ${config.APP_PORT}`);
}
bootstrap();
