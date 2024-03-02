import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';

@Catch()
export class ServerErrorExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof NotFoundException) {
      return response.status(HttpStatus.NOT_FOUND).json({ message: 'Not found' })
    } else if (exception instanceof BadRequestException) {
      return response.status(HttpStatus.BAD_REQUEST).json({ message: 'Bad request' });
    }
    if (!response.headersSent) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
      console.error(exception.message || exception);
    }
  }
}
