import { BadRequestException, Body, Controller, FileTypeValidator, Get, HttpCode, HttpException, HttpStatus, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response, Request } from 'express';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserService } from '../../services/user.service';
import { ProfileService } from '../../services/profile.service';
import { AuthenticationGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/role.guard';
import { Role, Roles } from '../../../common/guards/role.decorator';
import { CacheInterceptor } from '../../../common/interceptor/cache.interceptor';
import { CreateUserDto, LoginDto } from '../../dtos/req/user.dto';
import { UserVerifyCodeDto } from '../../dtos/req/code.dto';
import { ResponseInterceptor } from '../../../common/interceptor/response.interceptor';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/auth/user')
export class UserController {
    constructor(private readonly userService: UserService, profileService: ProfileService) {

    }
    @Get('/getall')
    @UseGuards(AuthenticationGuard, RolesGuard)
    @Roles(Role.user)
    @UseInterceptors(CacheInterceptor)
    async getAll() {
        return await this.userService.getAllUser()
    }
    @Get('/getonewithprofile')
    @UseGuards(AuthenticationGuard)
    async getOneWithProfile(
        @Req() req: Request) {
        return await this.userService.getUserWithProfile(req['auth'].accountId)
    }
    @Post('/addnew')
    async createNewUser(
        @Body() createNewUser: CreateUserDto) {
        return await this.userService.createNewUser(createNewUser)
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
    @UseInterceptors(ResponseInterceptor)
    async login(
        @Body() loginInfo: LoginDto) {
        return await this.userService.login(loginInfo)
    }
    @Get()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req:Request) {}
  
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req:Request) {
      return this.userService.loginWithStategy(req.user[0])
    }
    @Patch('verify')
    @UseGuards(AuthenticationGuard)
    async verifyUser(
        @Req() req: Request,
        @Body() body: UserVerifyCodeDto
    ) {
        body.userId = req['auth'].accountId
        return await this.userService.verifyUser(body)
    }
    @Post('/uploadmanyfile')
    @UseInterceptors(FilesInterceptor('files', 3))
    async uploadMulFile(@UploadedFile(
        new ParseFilePipeBuilder()
            .addFileTypeValidator({ fileType: 'jpg' })
            .addMaxSizeValidator({ maxSize: 10000 })
            .build({
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
            })
    ) files: Express.Multer.File[], @Res() res: Response) {
        return res.status(HttpStatus.OK).json()
    }
    @Post('/uploadmanyfieldfile')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatar', maxCount: 1 },
        { name: 'background', maxCount: 1 }
    ]))
    async uploadManyFieldFile(@UploadedFile() files: { avt: Express.Multer.File[], bg?: Express.Multer.File }, @Res() res: Response) {
        return res.status(HttpStatus.OK).json()
    }
}
