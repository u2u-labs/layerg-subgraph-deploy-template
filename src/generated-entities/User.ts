// Auto-generated entity class for User
import { set, get, getBy, count } from "layerg-graph-9";

export class User {
  static table = "users";

  id!: string;
  username!: string;
  name!: string;

  constructor(init?: Partial<User>) {
    Object.assign(this, init);
  }

  async save(chainId: number): Promise<void> {
    await set(User.table + '_' + chainId, this);
  }

  static async get(id: string): Promise<User | null> {
    const row = await get<User>(User.table, id);
    return row ? new User(row) : null;
  }

  static async getBy(field: keyof User, value: any, chainId: number): Promise<User | null> {
    const row = await getBy<User>(User.table + '_' + chainId, field as string, value);
    return row ? new User(row) : null;
  }

  static async count(where: Partial<User> = {}, chainId: number): Promise<number> {
    return count<User>(User.table + '_' + chainId, where);
  }
}
