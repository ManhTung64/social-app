import { S3Client } from "@aws-sdk/client-s3" // working with file in amazon
import {config} from 'dotenv'
config()

const s3Config:S3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || '',
        secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
      },
})
export default s3Config
