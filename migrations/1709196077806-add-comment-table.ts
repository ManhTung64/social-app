import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommentTable1709196077806 implements MigrationInterface {
    name = 'AddCommentTable1709196077806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19"`);
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2"`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" bigint, "postId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES "profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2"`);
        await queryRunner.query(`ALTER TABLE "member_group" DROP CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_a3eeb34032601c0c9a13f9b3ef2" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "member_group" ADD CONSTRAINT "FK_000589167f4dbdc93a9a5b09a19" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
