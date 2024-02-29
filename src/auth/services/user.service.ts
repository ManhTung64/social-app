import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { CodeService } from './code.service';
import { plainToClass } from 'class-transformer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { ProfileService } from './profile.service';
import { AuthService } from './auth.service';
import { User } from '../entities/user/user.entity';
import { Profile } from '../entities/user/profile.entity';
import { UserDto, UserTokenDto } from '../dtos/res/user.req.dto';
import { CreateUserDto, LoginDto } from '../dtos/req/user.dto';
import { UserVerifyCodeDto } from '../dtos/req/code.dto';
import { UpdateDto } from '../dtos/req/profile.dto';
import { MailCode } from 'src/mail/dtos/mail.dto';

@Injectable()
export class UserService {

    constructor(@InjectQueue('mail-queue') private readonly queue:Queue,
    private userRepository: UserRepository, private readonly passwordService: PasswordService,
        private readonly authService: AuthService, private readonly profileService: ProfileService,
        private readonly codeService:CodeService) {

    }
    public async getAllUser(): Promise<UserDto[]> {
        const data: UserDto[] = await this.userRepository.findAll()
        if (!data) throw new BadRequestException()
        else if (data.length == 0) throw new NotFoundException('Data is not found')
        else return data
    }
    public async getUserWithProfile(username: string): Promise<User> {
        const user: User = await this.userRepository.findOneByUsername(username)
        if (!user) throw new BadRequestException('Information is invalid')
        const data: User = await this.userRepository.joinWithProfileAndFind(user)
        if (!data) throw new BadRequestException()
        return data
    }
    public async createNewUser(createUserDto: CreateUserDto): Promise<UserDto> {
        // check exsited
        if (await this.userRepository.findOneByUsername(createUserDto.username)) throw new BadRequestException('Username is exsited')
        // hass password
        createUserDto.password = await this.passwordService.hashPassword(createUserDto.password)
        const newUser: User = await this.userRepository.createNew(createUserDto)
        //queue send mail verify
        const mailInformation:MailCode = {to:createUserDto.username, userId:newUser.id.toString()}
        await this.queue.add('send-code',mailInformation,{removeOnComplete:true})
        // create default profile with null information
        const profile: Profile = await this.profileService.createDefaultProfile(newUser)
        await this.userRepository.update(newUser, profile)
        return plainToClass(UserDto,newUser)
    }
    public async verifyUser (userVerifyCode:UserVerifyCodeDto):Promise<boolean>{
        const user:User = await this.userRepository.findOneById(parseInt(userVerifyCode.userId))
        // user not found or active user => reject
        if (!user || user.isActive) throw new BadRequestException()
        // check code is invalid ?
        else if (!this.codeService.checkCode(userVerifyCode.userId, userVerifyCode.code)) 
            throw new HttpException('Code is expried or false',HttpStatus.BAD_REQUEST)
        user.isActive = true
        await this.userRepository.save(user)
        return true
    }
    public async login(loginDto: LoginDto): Promise<UserTokenDto> {
        // check exsited
        const user: User = await this.userRepository.findOneByUsername(loginDto.username)
        if (!user) throw new BadRequestException('Information is invalid')
        // account not active
        // else if (!user.isActive) throw new BadRequestException('Account is not active')
        // check valid password
        else if (!await this.passwordService.verifyPassword(user.password, loginDto.password)) throw new BadRequestException('Information is invalid')
        // return with token
        const userInfo:UserTokenDto = plainToClass(UserTokenDto,user)
        userInfo.token = await this.authService.createToken(user)
        return userInfo
    }
    public async updateProfile(updateDto: UpdateDto): Promise<Profile> {
        const user: User = await this.userRepository.findOneById(updateDto.id)
        if (!user) throw new BadRequestException('User is invalid')
        const updateProfile:Profile = await this.profileService.update(user.profile, updateDto)
        user.profile = updateProfile
        await this.userRepository.save(user)
        return user.profile
    }
}
