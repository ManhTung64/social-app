import { Repository } from "typeorm"

export class BaseRepository<T>{

    constructor(private repository: Repository<T>) {

    }
    public async findAll(): Promise<T[]> {
        return await this.repository.find().catch(() => null)
    }
    public async delete(id: number): Promise<any> {
        return await this.repository.delete(id).catch(() => null)
    }
}