import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions : DataSourceOptions = {
    type: 'postgres',
    // host: 'postgres',
    host:'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Manhtung1@',
    database: 'test',
    // synchronize:true,
    entities:['dist/**/*.entity{.ts,.js}'],
    migrations:['dist/migrations/*.js']
}
const dataSource = new DataSource(dataSourceOptions)
export default dataSource