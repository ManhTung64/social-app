import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/common/repository.common";
import { PinMessageEntity } from "../entities/pin.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PinGroupConservationReqDto, PinU2UConservationReqDto } from "../dtos/req/pin.req.dto";

@Injectable()
export class PinMessageRepository extends BaseRepository<PinMessageEntity>{
    constructor(@InjectRepository(PinMessageEntity) private pinRepository: Repository<PinMessageEntity>) {
        super(pinRepository)
    }
    public async findOneByMessageId(id: number): Promise<PinMessageEntity> {
        return await this.pinRepository.findOne({ where: { message: { id: id } }, relations: ['message', 'message.sender', 'message.receiver'] })
    }
    public async findOneById(id: number): Promise<PinMessageEntity> {
        return await this.pinRepository.findOne(
            {
                where: { id },
                relations: [
                    'message',
                    'message.sender',
                    'message.receiver',
                    'message.group',
                    'message.group.creator'
                ]
            })
    }
    public async getListPinMessageBySenderIdOrReceiverId(conservation: PinU2UConservationReqDto): Promise<PinMessageEntity[]> {
        return await this.pinRepository.find({
            where: {
                message: {
                    sender: { id: conservation.sender_id },
                    receiver: { id: conservation.receiver_id }
                }
            },
            relations: [
                'message',
                'message.sender',
                'message.receiver'
            ]
        })
    }
    public async getListPinMessageByGroupId(conservation: PinGroupConservationReqDto): Promise<PinMessageEntity[]> {
        return await this.pinRepository.find({
            where: {
                message: {
                    group:{id:conservation.group_id}
                }
            },
            relations: [
                'message',
                'message.group',
            ]
        })
    }
}