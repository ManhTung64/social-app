import {config} from 'dotenv'
config()

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: 12614, 
    password: process.env.REDIS_PASSWORD,
  }
const redisUrlConfig = {url: process.env.REDIS_URL}
export {redisConfig, redisUrlConfig}