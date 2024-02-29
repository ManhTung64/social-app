import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express'
@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private readonly service: JwtService) {

    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException();
        const payload = await this.service.verifyAsync(
            token,
            {
                secret: 'demo-secret'
            }
        ).catch(()=>{throw new UnauthorizedException()})
        request['user'] = payload;
        return true;
    }
    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}