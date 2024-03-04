import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, ParseFilePipe, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { User } from "../../entities/user.entity";
import { UserService } from "../../services/user.service";
import { Request, Response } from "express";
import { AuthenticationGuard } from "../../../common/guards/auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { Profile } from "../../entities/profile.entity";
import { UpdateDto } from "../../dtos/req/profile.dto";

@Controller('api/profile')
export class ProfileController {
    constructor(private readonly userService:UserService){}
    @Get('/getonewithprofile')
    @UseGuards(AuthenticationGuard)
    async getOneWithProfile (
        @Req() req:Request){
            return await this.userService.getUserWithProfile(req['auth'].username)
    }
    @Post('/updateprofile')
    @UseGuards(AuthenticationGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingleFile (
    @UploadedFile(
        new ParseFilePipe({
            validators:[
                new MaxFileSizeValidator({maxSize:100000, message:'File is so large'}),
                new FileTypeValidator({fileType:'image'})
            ]
        })
    ) file:Express.Multer.File, 
    @Req() req:Request,
    @Body() updateProfile:UpdateDto){
        updateProfile.id = req['auth'].accountId
        if (file) updateProfile.avatar = file
        return await this.userService.updateProfile(updateProfile)
    }
}