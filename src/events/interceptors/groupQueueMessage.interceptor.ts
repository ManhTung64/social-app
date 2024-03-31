import { InjectQueue } from "@nestjs/bull";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Queue } from "bull";
import { Observable, tap } from "rxjs";
import { SocketDto } from "../dtos/res/socketResDto";


@Injectable()
export class GroupQueueMessageInterceptor implements NestInterceptor {
    constructor(@InjectQueue('message-queue') private readonly queueService: Queue) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            tap((data: SocketDto) => {
                // this.queueService.add('user-queue', {
                //     id: data.server_id,
                //     event: data.event,
                //     group_id: data.data.group.id,
                //     data: data.data
                // }, {
                //     removeOnComplete: true,
                //     removeOnFail: true,
                //     lifo: true,
                //     timeout: 5000
                // })
            }),
        );
    }
}
