import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessagesTable1709719192963 implements MigrationInterface {
    name = 'AddMessagesTable1709719192963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying, "createAt" TIMESTAMP NOT NULL DEFAULT now(), "files" jsonb, "groups_id" uuid, "first_user_id" bigint, "second_user_id" bigint, "reply_to_id" uuid, CONSTRAINT "REL_54e66104dd534ed1c191e44096" UNIQUE ("reply_to_id"), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_0a1e52c33c81fb99fda43c4babb" FOREIGN KEY ("groups_id") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_6a58f76f6c09dfa77c2107e59bc" FOREIGN KEY ("first_user_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_8daa8ee6b4e01bbb2958a8dbeab" FOREIGN KEY ("second_user_id") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_54e66104dd534ed1c191e44096f" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_54e66104dd534ed1c191e44096f"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_8daa8ee6b4e01bbb2958a8dbeab"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_6a58f76f6c09dfa77c2107e59bc"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_0a1e52c33c81fb99fda43c4babb"`);
    }

}
