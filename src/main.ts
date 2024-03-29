import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ServerErrorExceptionFilter } from './common/exception-filter/server-error.exception';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { RedisIoAdapter } from './configuration/socket.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalPipes(new ValidationPipe({
    errorHttpStatusCode: HttpStatus.BAD_REQUEST
  }));
  app.useGlobalFilters(new ServerErrorExceptionFilter());
  await app.listen(3000);
}
bootstrap();
