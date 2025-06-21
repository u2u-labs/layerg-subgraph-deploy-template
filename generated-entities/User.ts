// Auto-generated from schema.graphql
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class User {
  id?: string;
  username!: string;
  name!: string;

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }

  static fromJSON(json: any): User {
    return new User({
      id: json["id"],
      username: json["username"],
      name: json["name"],
    });
  }

  toJSON(): any {
    return {
      "id": this.id,
      "username": this.username,
      "name": this.name,
    };
  }

  static async get(id: string): Promise<User | null> {
    const rows = await prisma.$queryRaw`SELECT * FROM "User" WHERE "id" = ${id}`;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return User.fromJSON(rows[0]);
  }

  static async getByField(field: keyof User, value: any): Promise<User | null> {
    const allowedFields: (keyof User)[] = ["id", "username", "name"];
    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`);
    }

    const query = `SELECT * FROM "User" WHERE "${field}" = $1 LIMIT 1`;
    const rows = await prisma.$queryRawUnsafe(query, value);
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return User.fromJSON(rows[0]);
  }

  async save(): Promise<void> {
    await prisma.$queryRaw`INSERT INTO "User" ("id", "username", "name") VALUES (${this.id}, ${this.username}, ${this.name})
      ON CONFLICT ("id") DO UPDATE SET "username" = ${this.username}, "name" = ${this.name}`;
  }
}
