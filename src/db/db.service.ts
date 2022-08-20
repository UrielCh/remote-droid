import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { Client, Repository } from "redis-om";
import { DroidUser, DroidUserModel, droidUserSchema } from "./user.entity";
import { randomBytes } from "crypto";

declare type RedisConnection = ReturnType<typeof createClient>;

const EMAIL_SET = "rdroid:email";
const MAX_TOKEN = 3;

@Injectable()
export class DbService {
  client!: Client;
  redis!: RedisConnection;
  constructor(private config: ConfigService) {}

  async init() {
    const provider = this.config.get("DATABASE_PROVIDER");
    if (provider === "redis") {
      const url = this.config.get("DATABASE_REDIS_URL") as string;
      this.redis = createClient({ url });
      await this.redis.connect();
      this.client = await new Client().use(this.redis);
      this.#user = this.client.fetchRepository(droidUserSchema);
      await this.#user.createIndex();
    }
  }
  #user: Repository<DroidUser>;
  countUser = Promise.resolve(0);
  lastcount = 0;
  async addDroidUser(user: DroidUserModel): Promise<DroidUser> {
    const isFree = await this.redis.setNX(EMAIL_SET, user.email);
    if (!isFree) throw new ForbiddenException("Account Exists");
    if (!(await this.haveUser())) {
      user.role = "admin";
    }
    const dbuser = await this.#user.createAndSave(user as any);
    this.countUser = Promise.resolve(1);
    return dbuser;
  }

  async haveUser(): Promise<boolean> {
    if ((await this.countUser) > 0) return false;
    const now = Date.now();
    if (this.lastcount + 10000 > now) {
      this.lastcount = now;
      this.countUser = this.#user.search().count();
    }
    return (await this.countUser) > 0;
  }

  async getDroidUser(userId: string): Promise<DroidUser> {
    const user = await this.#user.fetch(userId);
    return user;
  }

  async getDroidUserAll(): Promise<DroidUser[]> {
    const users = await this.#user.search().return.all();
    return users;
  }

  async getDroidUserByEmail(email: string): Promise<DroidUser> {
    const user = await this.#user.search().where("email").equal(email).return.first();
    return user;
  }

  async cleanDb(): Promise<any> {
    const ids = await this.#user.search().allIds();
    await this.#user.remove(ids);
  }

  async getDroidUserByToken(token: string): Promise<DroidUser | null> {
    const user = await this.#user.search().where("token").equal(token).return.first();
    return user;
  }

  async addToken(user: DroidUser): Promise<string> {
    if (user.tokens && user.tokens.length > MAX_TOKEN) {
      throw new UnauthorizedException("MAX_TOKEN exceded");
    }
    const buf = await new Promise<Buffer>((r) => randomBytes(48, (ex, buf) => r(buf)));
    const token = buf.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
    user.tokens.push(token);
    await this.#user.save(user);
    return token;
  }
}
