import config, { isProdEnv } from '@/config/configuration';
import { Comment, Music, Post, Notification, Hashtag } from '@/models';
import { Logger } from '@/loaders/logger/loggerLoader';
import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

export class DBLoader {
  static init(): DynamicModule {
    const logger = new Logger(DBLoader.name);
    logger.log(`Initializing DBLoader...`);
    return TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.DB_HOST,
      port: parseInt(config.DB_PORT),
      username: config.CONTENT_DB_USER,
      password: config.CONTENT_DB_PASSWORD,
      database: config.CONTENT_DB_NAME,
      synchronize: isProdEnv ? false : true,
      entities: [Comment, Post, Music, Notification, Hashtag],
      // entities: ['dist/**/**/*.entity.js'],
      logging: false,
    });
  }
}
