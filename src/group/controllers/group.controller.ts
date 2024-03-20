import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { GroupService } from '../services/group.service';
import { CreateGroup } from '../dtos/req/group.dto';
import { Request } from 'express';
import { AuthenticationGuard } from 'src/common/guards/auth.guard';

@Controller('api/group')
export class GroupController {
    constructor(private readonly groupService:GroupService){}

    @Post('create')
    @UseGuards(AuthenticationGuard)
    async createNew (
        @Body() body:CreateGroup,
        @Req() req:Request
    ){
        body.userId = req['auth'].userId
        return await this.groupService.create(body)
    }
    @Get('getbycreator')
    @UseGuards(AuthenticationGuard)
    async getGroupsByCreator (
        @Req() req:Request
    ){
        return await this.groupService.getByCreator(req['auth'].userId)
    }
}
