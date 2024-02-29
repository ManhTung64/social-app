import { Module } from '@nestjs/common';
import { FileService } from './services/file.service';
import { S3Service } from './services/s3.service';

@Module({
    providers:[
        FileService,
        S3Service,

    ],
    exports:[
        FileService
    ]
})
export class FileModule {}
