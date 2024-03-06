import {config} from 'dotenv'
config()

const redisConfig = {
    host: process.env.REDIS_HOST,
    port: 12614, 
    password: process.env.REDIS_PASSWORD,
  }
export default redisConfig