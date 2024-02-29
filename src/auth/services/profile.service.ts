import { BadRequestException, Injectable } from '@nestjs/common';
import { ProfileRepository } from '../repositories/profile.repository';
import { User } from '../entities/user/user.entity';
import { Profile } from '../entities/user/profile.entity';
import { UpdateDto } from '../dtos/req/profile.dto';
import { FileService } from 'src/file/services/file.service';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepository: ProfileRepository, private readonly fileService:FileService) {

    }
    public async createDefaultProfile(user: User): Promise<Profile> {
        if (!user.id) throw new BadRequestException()
        return await this.profileRepository.createDefault(user, this.fileService.getDefaulAvatar())
    }
    public async update(currentProfile:Profile, update: UpdateDto): Promise<Profile> {
        if (update.avatar) currentProfile.avatar = await this.fileService.uploadAvatar(update.avatar)
        currentProfile = {
                        ...currentProfile, 
                        dob:update.dob?update.dob:currentProfile.dob, 
                        name:update.name?update.name:currentProfile.name,
                        phonenumber:update.phonenumber?update.phonenumber:currentProfile.phonenumber
                    }
        return currentProfile
    }
}
