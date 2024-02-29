import { BadRequestException, Body, Controller, FileTypeValidator, Get, HttpCode, HttpException, HttpStatus, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response, Request } from 'express';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/auth/services/user.service';
import { ProfileService } from 'src/auth/services/profile.service';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Role, Roles } from 'src/guards/role.decorator';
import { CacheInterceptor } from 'src/interceptor/cache.interceptor';
import { User } from 'src/auth/entities/user/user.entity';
import { Profile } from 'src/auth/entities/user/profile.entity';
import { UserDto, UserTokenDto } from 'src/auth/dtos/res/user.req.dto';
import { CreateUserDto, LoginDto } from 'src/auth/dtos/req/user.dto';
import { UserVerifyCodeDto } from 'src/auth/dtos/req/code.dto';
import { UpdateDto } from 'src/auth/dtos/req/profile.dto';

@Controller('api/auth/user')
export class UserController {
    constructor(private readonly userService:UserService, profileService:ProfileService){

    }
    @Get('/getall')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    @UseInterceptors(CacheInterceptor)
    async getAll (
        @Req() req:Request, 
        @Res() res:Response){
            const data:Array<UserDto> = await this.userService.getAllUser()
            return res.status(HttpStatus.OK).json({data})
    }
    @Get('/getonewithprofile')
    @UseGuards(AuthenticationGuard)
    async getOneWithProfile (
        @Req() req:Request, 
        @Res() res:Response){
            const data:User = await this.userService.getUserWithProfile(req['user'].username)
            return res.status(HttpStatus.OK).json({data})
    }
    @Post('/addnew')
    async createNewUser (
        @Body() createNewUser:CreateUserDto, 
        @Res() res:Response){
            const data:UserDto = await this.userService.createNewUser(createNewUser)
            return res.status(HttpStatus.OK).json({data})
    }
    // @Put(':id')
    // async updateInformation (
    //     @Param('id', new ParseIntPipe({errorHttpStatusCode:HttpStatus.NOT_ACCEPTABLE})) id:number, 
    //     @Body() update:UpdateDto, 
    //     @Res() res:Response){
    //         const data:Profile = await this.userService.updateProfile(update)
    //         return res.status(HttpStatus.OK).json({data:data})
    // }
    @Post('/login')
    async login (
        @Body() loginInfo:LoginDto, 
        @Res() res:Response){
            const data:UserTokenDto = await this.userService.login(loginInfo)
            return res.status(HttpStatus.OK).json({data})
    }
    @Patch('verify')
    @UseGuards(AuthenticationGuard)
    async verifyUser (
        @Req() req:Request,
        @Res() res:Response,
        @Body() body:UserVerifyCodeDto
    ){
        body.userId = req['user'].userId
        const isVerify:boolean = await this.userService.verifyUser(body)
        if (!isVerify) return res.status(HttpStatus.BAD_REQUEST).json({message:"Code is invalid or expried"})
        else return res.status(HttpStatus.OK).json({})
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
    @Body() updateProfile:UpdateDto,
    @Res() res:Response){
        updateProfile.id = req['user'].userId
        if (file) updateProfile.avatar = file

    }
    @Post('/uploadmanyfile')
    @UseInterceptors(FilesInterceptor('files',3))
    async uploadMulFile (@UploadedFile(
        new ParseFilePipeBuilder()
        .addFileTypeValidator({fileType:'jpg'})
        .addMaxSizeValidator({maxSize:10000})
        .build({
            errorHttpStatusCode:HttpStatus.UNPROCESSABLE_ENTITY
        })
    ) files:Express.Multer.File[], @Res() res:Response){
            return res.status(HttpStatus.OK).json()
    }
    @Post('/uploadmanyfieldfile')
    @UseInterceptors(FileFieldsInterceptor([
        {name:'avatar',maxCount:1},
        {name:'background',maxCount:1}
    ]))
    async uploadManyFieldFile (@UploadedFile() files:{ avt:Express.Multer.File[],bg?:Express.Multer.File}, @Res() res:Response){
            return res.status(HttpStatus.OK).json()
    }
}
