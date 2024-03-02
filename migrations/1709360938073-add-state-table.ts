import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStateTable1709360938073 implements MigrationInterface {
    name = 'AddStateTable1709360938073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."state_type_enum" AS ENUM('like', 'dislike')`);
        await queryRunner.query(`CREATE TABLE "state" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."state_type_enum" NOT NULL, "createAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" bigint, "postId" uuid, CONSTRAINT "PK_549ffd046ebab1336c3a8030a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "state" ADD CONSTRAINT "FK_d56be3ac9ae9636e9ca0f9c0248" FOREIGN KEY ("userId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "state" ADD CONSTRAINT "FK_31eb14efc8f690b47aaeb330890" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2"`);
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19"`);
        await queryRunner.query(`ALTER TABLE "state" DROP CONSTRAINT "FK_31eb14efc8f690b47aaeb330890"`);
        await queryRunner.query(`ALTER TABLE "state" DROP CONSTRAINT "FK_d56be3ac9ae9636e9ca0f9c0248"`);
        await queryRunner.query(`DROP TABLE "state"`);
        await queryRunner.query(`DROP TYPE "public"."state_type_enum"`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
