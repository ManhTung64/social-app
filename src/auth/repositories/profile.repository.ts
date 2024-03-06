import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, UpdateResult } from "typeorm";
import { BaseRepository } from "../../common/repository.common";
import { Profile } from "../entities/profile.entity";
import { User } from "../entities/user.entity";

@Injectable()
export class ProfileRepository extends BaseRepository<Profile>{
    constructor(@InjectRepository(Profile) private profileRepository: Repository<Profile>) {
        super(profileRepository)
    }
    public async createDefault(user: User, avatar:string): Promise<Profile> {
        return await this.profileRepository.save(this.profileRepository.create({ name: 'new-user', user: user, avatar:avatar }))
    }
    public async createAppProfile(user: User, name:string, avatar:string): Promise<Profile> {
        return await this.profileRepository.save(this.profileRepository.create({ name, user, avatar }))
    }
    public async updateProfile(profile: any): Promise<UpdateResult> {
        return await this.profileRepository.update(profile.id, { ...profile })
    }
    public async findOneById(userId:number): Promise<Profile> {
        return await this.profileRepository.findOne({ where: {id:userId} })
    }
    public async addGroup(profile:Profile): Promise<Profile> {
        return await this.profileRepository.save(profile)
    }
}