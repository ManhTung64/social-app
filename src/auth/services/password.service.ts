import { Injectable } from '@nestjs/common';
import * as argon2 from "argon2"

@Injectable()
export class PasswordService {
    public hashPassword = async (password: string): Promise<string> => {
        const hashedPassword = await argon2.hash(password)
        return hashedPassword
    }
    public verifyPassword = async (userPassword: string, inputPassword: string): Promise<boolean> => {
        if (await argon2.verify(userPassword, inputPassword)) return true
        else return false
    }
}
