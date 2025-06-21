// Auto-generated from schema.graphql
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class Post {
  id?: string;
  title!: string;
  content!: string;
  user!: any;

  constructor(init?: Partial<Post>) {
    Object.assign(this, init);
  }

  static fromJSON(json: any): Post {
    return new Post({
      id: json["id"],
      title: json["title"],
      content: json["content"],
      user: json["user"],
    });
  }

  toJSON(): any {
    return {
      "id": this.id,
      "title": this.title,
      "content": this.content,
      "user": this.user,
    };
  }

  static async get(id: string): Promise<Post | null> {
    const rows = await prisma.$queryRaw`SELECT * FROM "Post" WHERE "id" = ${id}`;
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return Post.fromJSON(rows[0]);
  }

  static async getByField(field: keyof Post, value: any): Promise<Post | null> {
    const allowedFields: (keyof Post)[] = ["id", "title", "content", "user"];
    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`);
    }

    const query = `SELECT * FROM "Post" WHERE "${field}" = $1 LIMIT 1`;
    const rows = await prisma.$queryRawUnsafe(query, value);
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return Post.fromJSON(rows[0]);
  }

  async save(): Promise<void> {
    await prisma.$queryRaw`INSERT INTO "Post" ("id", "title", "content", "user") VALUES (${this.id}, ${this.title}, ${this.content}, ${this.user})
      ON CONFLICT ("id") DO UPDATE SET "title" = ${this.title}, "content" = ${this.content}, "user" = ${this.user}`;
  }
}
