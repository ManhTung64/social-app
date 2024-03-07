import { Body, Controller, Get, Req, UseGuards } from "@nestjs/common";
import { MessageService } from "../services/message.service";
import { AuthenticationGuard } from "src/common/guards/auth.guard";
import { LimitU2UConservationReqDto } from "../dtos/req/pagination.dto";
import { Request } from "express";
import { plainToClass } from "class-transformer";

@Controller('api/message')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }
    @Get('getlistu2uconservation')
    @UseGuards(AuthenticationGuard)
    async getListConservation(
        @Req() req: Request,
        @Body() body: LimitU2UConservationReqDto
    ) {
        body = plainToClass(LimitU2UConservationReqDto, body)
        body.sender_id = req['auth'].userId
        return await this.messageService.getU2UConservation(body)
    }
}