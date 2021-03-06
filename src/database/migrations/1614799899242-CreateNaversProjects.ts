import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNaversProjects1614799899242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "navers_projects",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "naver_id",
            type: "uuid",
          },
          {
            name: "project_id",
            type: "uuid",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
        foreignKeys: [
          {
            name: "FKNaver",
            referencedTableName: "navers",
            referencedColumnNames: ["id"],
            columnNames: ["naver_id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },

          {
            name: "FKProject",
            referencedTableName: "projects",
            referencedColumnNames: ["id"],
            columnNames: ["project_id"],
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("navers_projects");
  }
}
