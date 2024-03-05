import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Socket } from "socket.io"
import { AuthService } from "src/auth/services/auth.service"
export type SocketIOMiddleware = {
    (client: Socket, next: (err?: Error) => void)
}
export const SocketAuthMiddleware = (service: AuthService) => {
    return async(client: Socket, next) => {
        try {
            const token: string = client.handshake.headers.authorization.split(' ')[1]
            const payload = await service.verifyToken(token)
            if (!payload) throw new UnauthorizedException()
            client.data.user = payload
            next()
        } catch (err) {
            console.log(err)
            next(err)
        }
    }
}
