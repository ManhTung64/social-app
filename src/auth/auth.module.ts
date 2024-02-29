import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './controllers/user/auth.user.controller';
import { ProfileController } from './controllers/user/profile.user.controller';
import { ProfileRepository } from './repositories/profile.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { UserService } from './services/user.service';
import { PasswordService } from './services/password.service';
import { CodeService } from './services/code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user/user.entity';
import { Profile } from './entities/user/profile.entity';
import { BullModule } from '@nestjs/bull';
import { FileModule } from 'src/file/file.module';
import { MailModule } from 'src/mail/mail.module';
import { MailConsumer } from './consumer/mail.consumer';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    BullModule.registerQueue({
      name: 'mail-queue'
    }),
    forwardRef(()=>MailModule),
    forwardRef(()=>FileModule),
    JwtModule.register({
      global:true,
      secret:'demo-secret',
      signOptions:{expiresIn:'30d'}
  })
  ],
  controllers: [
    UserController,
    ProfileController
  ],
  providers: [
    ProfileRepository,
    UserRepository,
    AuthService,
    ProfileService,
    UserService,
    PasswordService,
    CodeService,
    MailConsumer
  ],
  exports: [
    ProfileRepository, 
    UserRepository, 
    CodeService
  ]
})
export class AuthModule { }
