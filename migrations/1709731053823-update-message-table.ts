import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMessageTable1709731053823 implements MigrationInterface {
    name = 'UpdateMessageTable1709731053823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19"`);
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2"`);
        await queryRunner.query(`CREATE TYPE "public"."state_type_enum" AS ENUM('like', 'dislike')`);
        await queryRunner.query(`CREATE TABLE "state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."state_type_enum" NOT NULL, "createAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" bigint, "postId" uuid, CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying, "createAt" TIMESTAMP NOT NULL DEFAULT now(), "files" jsonb, "groups_id" uuid, "sender_id" bigint, "receiver_user_id" bigint, "reply_to_id" uuid, CONSTRAINT "REL_54e66104dd534ed1c191e44096" UNIQUE ("reply_to_id"), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "state" ADD CONSTRAINT "FK_d56be3ac9ae9636e9ca0f9c0248" FOREIGN KEY ("userId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "state" ADD CONSTRAINT "FK_31eb14efc8f690b47aaeb330890" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_0a1e52c33c81fb99fda43c4babb" FOREIGN KEY ("groups_id") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_22133395bd13b970ccd0c34ab22" FOREIGN KEY ("sender_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_67873bf1202123a6deae603034e" FOREIGN KEY ("receiver_user_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_54e66104dd534ed1c191e44096f" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2"`);
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_54e66104dd534ed1c191e44096f"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_67873bf1202123a6deae603034e"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_22133395bd13b970ccd0c34ab22"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_0a1e52c33c81fb99fda43c4babb"`);
        await queryRunner.query(`ALTER TABLE "state" DROP CONSTRAINT "FK_31eb14efc8f690b47aaeb330890"`);
        await queryRunner.query(`ALTER TABLE "state" DROP CONSTRAINT "FK_d56be3ac9ae9636e9ca0f9c0248"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "state"`);
        await queryRunner.query(`DROP TYPE "public"."state_type_enum"`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
