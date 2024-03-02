import { Process, Processor } from "@nestjs/bull";

import { Job } from "bull";
import { CodeService } from "../services/code.service";
import { UserService } from "../services/user.service";
import { MailService } from "../../mail/services/mail.service";

@Processor('mail-queue')
export class MailConsumer {
    constructor(private readonly mailService:MailService,
         private readonly userService:UserService,
         private readonly codeService:CodeService
         ){

    }
    @Process('send-code')
    async sendMailQueue (data:Job){
        data.data.code = this.codeService.createCode(data.data.userId)
        await this.mailService.sendCode(data.data) 
        return
    }
}