import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { response } from 'express';
import { Redis } from 'ioredis';
import { Observable, tap, from, of } from 'rxjs';
import {config} from 'dotenv'

config()
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 12614,
  password: process.env.REDIS_PASSWORD,
  enableReadyCheck: true,
});


@Injectable()
export class CacheInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.url}-${JSON.stringify(request.query)}`;

    const cachedValue = await redis.get(cacheKey);

    if (cachedValue) {
      const response = context.switchToHttp().getResponse();
      response.status(HttpStatus.OK).json(JSON.parse(cachedValue))
      return of(response);
    } else {
      return next.handle().pipe(
        tap(async data => {
          let responseText = data._header
          const dataStartIndex = responseText.indexOf('data: ');
          if (dataStartIndex === -1) {
            return response
          }
          let dataEndIndex = responseText.indexOf('\r\n', dataStartIndex + 5);
          if (dataEndIndex === -1) {
            dataEndIndex = responseText.length;
          }
          const jsonData = responseText.substring(dataStartIndex + 4, dataEndIndex);
          await redis.set(cacheKey, '{"data"' + jsonData + '}', 'EX', 5);
        })
      );
    }
  }
}

