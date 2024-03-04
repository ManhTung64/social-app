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
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { BullModule } from '@nestjs/bull';
import { FileModule } from '../file/file.module';
import { MailModule } from '../mail/mail.module';
import { MailConsumer } from './consumer/mail.consumer';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategy/google.strategy';
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
    MailConsumer,
    GoogleStrategy
  ],
  exports: [
    ProfileRepository, 
    UserRepository, 
    CodeService
  ]
})
export class AuthModule { }
