import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ServerErrorExceptionFilter } from './common/exception-filter/server-error.exception';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalPipes(new ValidationPipe({
    errorHttpStatusCode: HttpStatus.BAD_REQUEST}));
  app.useGlobalFilters(new ServerErrorExceptionFilter());
  await app.listen(3000);
}
bootstrap();
