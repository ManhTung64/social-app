import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { ChatEventsGateway } from "../gateways/chat-events.gateway";

@Processor('message-queue')
export class MessageConsumer {
    constructor(
        private readonly eventGateWay: ChatEventsGateway
    ) {
    }
    @Process('user-queue')
    async u2uMessageProcess(data: Job<any>) {
        if (this.eventGateWay.SERVER_ID != data.data.id) {
            this.eventGateWay.emitU2U(data.data.receiver_id, data.data.event, data.data.data)
        }

    }
    @Process('group-queue')
    async groupMessageProcess(data: Job<any>) {
        if (this.eventGateWay.SERVER_ID != data.data.id) {
            this.eventGateWay.emitAllMembers(data.data.receiver_id, data.data.event, data.data.data)
        }
    }
}