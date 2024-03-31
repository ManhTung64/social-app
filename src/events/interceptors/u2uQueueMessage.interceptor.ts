import { InjectQueue } from '@nestjs/bull';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Queue } from 'bull';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SocketDto } from '../dtos/res/socketResDto';

@Injectable()
export class U2UQueueMessageInterceptor implements NestInterceptor {
    constructor(@InjectQueue('message-queue') private readonly queueService: Queue) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        return next.handle().pipe(
            tap((data: SocketDto) => {
                // this.queueService.add('user-queue', {
                //     id: data.server_id,
                //     event: data.event,
                //     receiver_id: data.data.receiver.id,
                //     data: data.data
                // }, {
                //     removeOnComplete: true,
                //     removeOnFail:true,
                //     lifo:true,
                //     timeout:5000
                // })
            }),
        );
    }
}
