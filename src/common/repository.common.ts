import { Repository } from "typeorm"

export class BaseRepository<T>{

    constructor(private repository: Repository<T>) {

    }
    public async findAll(): Promise<T[]> {
        return await this.repository.find().catch((e) => {console.log(e);return null})
    }
    public async delete(id: number): Promise<any> {
        return await this.repository.delete(id).catch(() => null)
    }
    public async saveChange(data:T):Promise<T>{
        return await this.repository.save(data)
    }
}