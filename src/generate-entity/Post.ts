// Auto-generated entity class for Post
import { set, get, getBy, count, onInsert } from "layerg-graph-7";

export class Post {
  static table = "posts";

  id!: string;
  title!: string;
  content!: string;
  user!: any;

  constructor(init?: Partial<Post>) {
    Object.assign(this, init);
  }

  async save(chainId: number): Promise<void> {
    await set(Post.table + '_' + chainId, this);
  }

  static async get(id: string): Promise<Post | null> {
    const row = await get<Post>(Post.table, id);
    return row ? new Post(row) : null;
  }

  static async getBy(field: keyof Post, value: any, chainId: number): Promise<Post | null> {
    const row = await getBy<Post>(Post.table + '_' + chainId, field as string, value);
    return row ? new Post(row) : null;
  }

  static async count(where: Partial<Post> = {}, chainId: number): Promise<number> {
    return count<Post>(Post.table + '_' + chainId, where);
  }

  static onNewRecord(callback: (data: Post) => void, chainId: number) {
    onInsert(Post.table + '_' + chainId, (row) => callback(new Post(row)));
  }
}
