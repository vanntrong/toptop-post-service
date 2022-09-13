import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DBLoader } from './loaders/db/dbLoader';
import { RedisLoader } from './loaders/redis/redisLoader';
import { PostModule } from './modules/post/post.module';
import { AccessTokenStrategy } from './strategies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DBLoader.init(),
    RedisLoader.init(),
    MulterModule.register({
      dest: './uploads/videos',
    }),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService, AccessTokenStrategy],
})
export class AppModule {}
