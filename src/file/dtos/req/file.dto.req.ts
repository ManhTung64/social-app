import { IsNotEmpty } from "class-validator";

export class UploadFile {
    buffer:Buffer
    originalname:string
    mimetype:string
    size:number
}