import { Injectable } from "@nestjs/common";
// import { UserVerifyCode } from "./dto/code.dto";

@Injectable()
export class CodeService{
    private listCode:Map<string, UserVerifyCode> = new Map()
    private MIN:number = 100000
    private MAX:number = 999999
    public createCode(userId:string) {
        const randomNumber = Math.floor(Math.random() * (this.MAX - this.MIN + 1)) + this.MIN;
        const randomString = randomNumber.toString();
        this.addToListCode(userId, randomString)
        return randomString;
    }
    private addToListCode (userId:string, code:string):boolean{
        const userVerifyCode = new UserVerifyCode(code)
        this.listCode.set(userId, userVerifyCode)
        return true
    }
    public checkCode (userId:string, code:string):boolean{
        const codeOfUser:UserVerifyCode = this.listCode.get(userId)
        if (!codeOfUser || !codeOfUser.isValidCode(code)) return false
        else this.listCode.set(userId, null)
        return true
    }
}
export class UserVerifyCode{
    private code:string
    private expried:Date
    constructor(code:string){
        this.code = code
        let date:Date = new Date(new Date())
        date.setMinutes(new Date().getMinutes() + 3) // limited 3mins
        this.expried = date
    }

    public getCode(){
        return this.code
    }
    public getExpried(){
        return this.expried
    }
    public isValidCode(code:string):boolean{
        if (code !== this.code || this.expried > new Date()) return false
        else return true
    }
}