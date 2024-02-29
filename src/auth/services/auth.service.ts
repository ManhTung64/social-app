import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user/user.entity';

@Injectable()
export class AuthService {
    constructor(private readonly service:JwtService){

    }
    public async createToken (account:User):Promise<string>{
        const tokenData:any = {
            accountId: account.id,
            username: account.username,
            role:account.role
        }
        return await this.service.signAsync(tokenData)
    }
}
