import { ConsoleLogger } from '@nestjs/common';

export class Logger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here
    super.error(message, stack, context);
  }

  warn(message: any, context?: string) {
    // TO DO
    super.warn(message, context);
  }

  log(message: any, context?: string) {
    // TO DO
    super.log(context, message);
  }

  debug(message: any, context?: string) {
    // TO DO
    super.debug(message, context);
  }

  verbose(message: any, context?: string) {
    // TO DO
    super.verbose(message, context);
  }
}
