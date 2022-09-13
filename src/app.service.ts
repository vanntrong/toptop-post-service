import { randomInt } from '@/common/helper/utils.helper';
import { Logger } from '@/loaders/logger/loggerLoader';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);

  async getHello(): Promise<any> {
    const random = await randomInt(1, 10);
    this.logger.log(`Random number: ${random}`);

    return {
      message: 'Hello World!',
    };
  }
}
