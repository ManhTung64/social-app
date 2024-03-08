// throttle.guard.ts

import { CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Socket } from 'socket.io';

@Injectable()
export class ThrottleGuard implements CanActivate {
  private REQUEST:number = 5
  private SECOND:number = 1
  private rateLimiter = new RateLimiterMemory({
    points: this.REQUEST, 
    duration: this.SECOND, 
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    try {
      await this.rateLimiter.consume(client.id);
      return true;
    } catch (e) {
      client.emit('error','Request is limited');
      return false;
    }
  }
}
