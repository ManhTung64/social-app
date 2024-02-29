import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, ParseFilePipe, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { User } from "src/auth/entities/user/user.entity";
import { UserService } from "src/auth/services/user.service";
import { Request, Response } from "express";
import { AuthenticationGuard } from "src/common/guards/auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { Profile } from "src/auth/entities/user/profile.entity";
import { UpdateDto } from "src/auth/dtos/req/profile.dto";

@Controller('api/profile')
export class ProfileController {
    constructor(private readonly userService:UserService){}
    @Get('/getonewithprofile')
    @UseGuards(AuthenticationGuard)
    async getOneWithProfile (
        @Req() req:Request){
            return await this.userService.getUserWithProfile(req['user'].username)
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
        updateProfile.id = req['user'].userId
        if (file) updateProfile.avatar = file
        return await this.userService.updateProfile(updateProfile)
    }
}