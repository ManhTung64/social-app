import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/auth/repositories/user.repository';
import { MailCode } from '../dtos/mail.dto';
import { User } from 'src/auth/entities/user/user.entity';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService, private readonly userRepository:UserRepository) { }
    private mail:string = 'manhtungyb10a10@gmail.com'
    async sendCode(mailInformation:MailCode): Promise<void> {
        await this.mailerService.sendMail({
            // to: mailInformation.to,
            to: this.mail,
            subject: 'Your code',
            
            text: 'Your code is ' + mailInformation.code +'', 
        });
    }
    async sendDailyReport (){
        const newUser:User[] = await this.userRepository.findAllNewUser()
        await this.mailerService.sendMail({
            // to: mailInformation.to,
            to: this.mail,
            subject: 'Daily report',
            
            text: 'All new account is ' + newUser.length +'', 
        });
    }
}
