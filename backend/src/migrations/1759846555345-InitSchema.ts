import {MigrationInterface, QueryRunner} from "typeorm";

export class InitSchema1759846555345 implements MigrationInterface {
    name = 'InitSchema1759846555345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_favorite_user"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_favorite_course"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "UQ_favorite_user_course"`);
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "dateCreated" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "content" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "content" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "content" ALTER COLUMN "dateCreated" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "favorite" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "favorite" ALTER COLUMN "courseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "UQ_7f4649172129b35a5ce3f8f0fa1" UNIQUE ("userId", "courseId")`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_49683c9a81255cb01ecd2a47db1" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_49683c9a81255cb01ecd2a47db1"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "UQ_7f4649172129b35a5ce3f8f0fa1"`);
        await queryRunner.query(`ALTER TABLE "favorite" ALTER COLUMN "courseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "favorite" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "content" ALTER COLUMN "dateCreated" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "content" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "content" ADD "image" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "dateCreated" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "UQ_favorite_user_course" UNIQUE ("userId", "courseId")`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_favorite_course" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_favorite_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
