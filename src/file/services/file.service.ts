import { Injectable } from '@nestjs/common';
import { S3Service } from './s3.service';
import { Multer } from 'multer';
import { UploadFile } from '../dtos/req/file.dto.req';
import { FileInfo } from '../../post/entities/post.entity';
import { plainToClass } from 'class-transformer';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class FileService {
    private defaultAvatar = 'https://i.stack.imgur.com/l60Hf.png'
    private MULTIPART_UPLOAD_SIZE = 50 * 1024 * 1024;
    private PART_SIZE = 10 * 1024 * 1024;
    constructor(private readonly s3Service: S3Service) { }

    public getDefaulAvatar = () => {
        return this.defaultAvatar
    }
    private isLargeFile(size: number): boolean {
        if (size > this.MULTIPART_UPLOAD_SIZE) return true
        return false
    }
    private calculateSize(files: UploadFile[]): number {
        return files.reduce((sum, file) => sum + file.size, 0)
    }
    private async uploadMultipartOneFile(file: UploadFile): Promise<string> {
        // init
        const params: any = this.s3Service.createParamsUpload(file)
        const uploadId: string = await this.s3Service.startMultipartUpload(params)
        // upload 
        const parts = await this.uploadFileParts(params, uploadId, file)
        // complete
        return await this.s3Service.completeMultipartUpload(params, uploadId, parts)
    }
    private async uploadMultipartManyFiles(files: UploadFile[]): Promise<string[]> {
        const urls: string[] = []
        if (files.length == 0) return []
        files.map(async (file) => {
            urls.push(await this.uploadMultipartOneFile(file))
        })
        return urls
    }
    private async uploadFileParts(params: any, uploadId: string, file: UploadFile): Promise<any> {
        const buffer = Buffer.from(file.buffer);
        const partCount = Math.ceil(buffer.length / this.PART_SIZE);

        const parts = [];

        for (let i = 0; i < partCount; i++) {
            const start = i * this.PART_SIZE;
            const end = Math.min(start + this.PART_SIZE, buffer.length);
            const partBody = buffer.slice(start, end);

            const partNumber = i + 1;
            const result = await this.s3Service.uploadPart(params, uploadId, partNumber, partBody);

            parts.push({ ETag: result.ETag, PartNumber: partNumber });
        }

        return parts;
    }
    public async uploadAvatar(avatar: UploadFile): Promise<string> {
        if (!this.isLargeFile(avatar.size)) return await this.uploadMultipartOneFile(avatar)
        else return await this.s3Service.UploadOneFile(avatar)
    }
    public async uploadImagesOfPost(files: UploadFile[]): Promise<FileInfo[]> {
        if (files.length == 0) throw Error("Missing file")
        const urls: string[] = this.isLargeFile(this.calculateSize(files)) ?
            await this.s3Service.UploadManyFiles(files) : await this.uploadMultipartManyFiles(files)
        let list: FileInfo[] = []
        files.map((file, index) => {
            const finalFile: FileInfo = { type: this.checkTypeFile(file), url: urls[index], no: index }
            list.push(finalFile)
        })
        return list
    }
    private getFileTypeFromBase64(base64String:string):string {
        const matches = base64String.match(/^data:([a-zA-Z]+\/[a-zA-Z]+);base64,/);
        if (matches && matches.length > 1) {
          return matches[1];
        }
        return null;
      }
    public async uploadBase64File(files: string[]): Promise<FileInfo[]> {
        const list_final_files:FileInfo[] = []
        for (let i = 0; i < files.length; i++){
            const buffer = Buffer.from(files[i].split(',')[1], 'base64');
            const type: string = this.getFileTypeFromBase64(files[i])
            if (!type) throw new WsException('File error')
            var formatFile: Express.Multer.File = {
                fieldname: 'file',
                originalname: 'uploaded_file',
                encoding: 'base64',
                mimetype: type,  
                size: buffer.length,
                buffer,
                destination: './uploads', 
                filename: 'uploaded_file',
                path: 'uploaded_file',
                stream: null,  
            };
            const final_file:FileInfo = {
                type: this.checkTypeFile(plainToClass(UploadFile, formatFile)),
                url:await this.s3Service.UploadOneFile(plainToClass(UploadFile, formatFile)),
                no: i
            }
            list_final_files.push(final_file)
        }
        return list_final_files
    }
    private checkTypeFile(file: UploadFile): string {
        if (file.mimetype.startsWith('image/')) {
            return 'image';
        } else if (file.mimetype.startsWith('video/')) {
            return 'video';
        }
    }
}
