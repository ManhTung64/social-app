import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { AppModule } from 'src/app.module';

@Injectable()
export class AuthService {
    constructor(private readonly service:JwtService){

    }
    public async verifyToken (token:string){
        return await this.service.verifyAsync(
            token,
            {
                secret: 'demo-secret'
            }
        ).catch(()=>{return null})
    }
    public async createToken (account:User):Promise<string>{
        const tokenData:any = {
            accountId: account.id,
            username: account.username,
            role:account.role,
            userId:account.profile.id
        }
        return await this.service.signAsync(tokenData)
    }
}
