import { Injectable, NestInterceptor, CallHandler, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        if (data && typeof data === 'object') {
          context.switchToHttp().getResponse().status(HttpStatus.OK).json({ data });
        } else if (data && typeof data !== 'object') {
          throw new HttpException('Data must be an object', HttpStatus.BAD_REQUEST);
        }
      }),
    );
  }
}
