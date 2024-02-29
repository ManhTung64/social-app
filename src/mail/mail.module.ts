import { MailerModule } from '@nestjs-modules/mailer';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { MailService } from './services/mail.service';

@Module({
    imports: [
      forwardRef(()=>AuthModule) ,
      MailerModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: {
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: configService.get<string>('MAIL_USERNAME'),
              pass: configService.get<string>('MAIL_PASSWORD')
            }
          },
          defaults:{
            from:'"My app" <no-reply@example.com>'
          },
        }),
        inject:[ConfigService]
      })
    ],
    providers: [MailService],
    exports:[MailService]
  })
  export class MailModule { }
  
