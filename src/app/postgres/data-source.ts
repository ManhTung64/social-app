import { DataSource, DataSourceOptions } from "typeorm";
import {config} from 'dotenv'

config()
export const dataSourceOptions : DataSourceOptions = {
    type: 'postgres',
    // host: 'postgres',
    host:'localhost',
    port: 5432,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: 'test',
    synchronize:true,
    // entities:['src/**/**/*.entity{.ts,.js}'],
    entities:['dist/**/**/*.entity{.ts,.js}'],
    migrations:['dist/migrations/*.js']
}
const dataSource = new DataSource(dataSourceOptions)
export default dataSource