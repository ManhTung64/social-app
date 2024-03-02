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
      context.switchToHttp().getResponse().status(HttpStatus.OK).json({data: JSON.parse(cachedValue) });
    } else {
      return next.handle().pipe(
        tap(async data => {
          await redis.set(cacheKey, JSON.stringify(data), 'EX', 5);
        })
      );
    }
  }
}

