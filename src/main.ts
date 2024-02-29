import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ServerErrorExceptionFilter } from './exception-filter/server-error.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    errorHttpStatusCode: HttpStatus.BAD_REQUEST}));
  app.useGlobalFilters(new ServerErrorExceptionFilter());
  await app.listen(3000);
}
bootstrap();
