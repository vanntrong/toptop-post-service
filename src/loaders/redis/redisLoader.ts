import config from '@/config/configuration';
import { Logger } from '@/loaders/logger/loggerLoader';
import { CacheModule, DynamicModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

export class RedisLoader {
  static init(): DynamicModule {
    const logger = new Logger(RedisLoader.name);
    logger.log(
      `Initializing RedisLoader... ${config.REDIS_HOST}:${config.REDIS_PORT}`,
    );
    return CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: config.REDIS_HOST,
      port: parseInt(config.REDIS_PORT),
      // password: config.REDIS_PASSWORD,
      // ttl: config.REDIS_TTL,
    });
  }
}
