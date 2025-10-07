import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1759846555345 implements MigrationInterface {
  name = 'InitSchema1759846555345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tablas principales
    await queryRunner.query(`CREATE TABLE "user" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "firstName" character varying NOT NULL,
                    "lastName" character varying NOT NULL,
                    "username" character varying NOT NULL,
                    "password" character varying NOT NULL,
                    "role" character varying NOT NULL,
                    "refreshToken" character varying,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "createdAt" timestamp,
                    CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
                )`);
    await queryRunner.query(`CREATE TABLE "course" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" character varying NOT NULL,
                    "description" character varying NOT NULL,
                    "dateCreated" timestamp,
                    CONSTRAINT "PK_course_id" PRIMARY KEY ("id")
                )`);
    await queryRunner.query(`CREATE TABLE "content" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "name" character varying NOT NULL,
                    "description" character varying NOT NULL,
                    "image" character varying,
                    "dateCreated" timestamp,
                    "courseId" uuid,
                    CONSTRAINT "PK_content_id" PRIMARY KEY ("id")
                )`);
    await queryRunner.query(`CREATE TABLE "favorite" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "userId" uuid,
                    "courseId" uuid,
                    CONSTRAINT "PK_favorite_id" PRIMARY KEY ("id")
                )`);
    // Agregar restricciones y relaciones
    await queryRunner.query(
      `ALTER TABLE "content" ADD CONSTRAINT "FK_content_course" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "UQ_favorite_user_course" UNIQUE ("userId", "courseId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_favorite_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_favorite_course" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorite" DROP CONSTRAINT "FK_49683c9a81255cb01ecd2a47db1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" DROP CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" DROP CONSTRAINT "UQ_7f4649172129b35a5ce3f8f0fa1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ALTER COLUMN "courseId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "createdAt" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "content" ALTER COLUMN "dateCreated" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "content" DROP COLUMN "image"`);
    await queryRunner.query(
      `ALTER TABLE "content" ADD "image" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ALTER COLUMN "dateCreated" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "UQ_favorite_user_course" UNIQUE ("userId", "courseId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_favorite_course" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite" ADD CONSTRAINT "FK_favorite_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
