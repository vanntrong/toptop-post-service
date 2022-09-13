import { HttpException } from '@nestjs/common';

export const AppErrorMsg = {
  '200': 'OK',
  '201': 'Created',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '500': 'Internal Server Error',
  '503': 'Service Unavailable',
  '504': 'Gateway Timeout',
  '505': 'HTTP Version Not Supported',
  '506': 'Variant Also Negotiates',
  '507': 'Insufficient Storage',
};

export class AppError extends HttpException {
  constructor(message: string, status: number) {
    super(
      {
        message: message,
        statusCode: status,
        error: AppErrorMsg[status],
      },
      status,
    );
  }
}
