import { ConflictException, OnModuleDestroy, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";
import { Client, Repository } from "redis-om";
import { DroidUserFull, DroidUserModel, droidUserSchema } from "./user.entity";
import { randomBytes } from "crypto";

declare type RedisConnection = ReturnType<typeof createClient>;

const EMAIL_SET = "rdroid:email";
const MAX_TOKEN = 3;

export class DbService implements OnModuleDestroy {
  client!: Client;
  redis!: RedisConnection;
  constructor(private config: ConfigService) {}

  async init(): Promise<DbService> {
    const provider = this.config.get("DATABASE_PROVIDER");
    if (provider === "redis") {
      const url = this.config.get("DATABASE_REDIS_URL") as string;
      this.redis = createClient({ url });
      await this.redis.connect();
      this.client = await new Client().use(this.redis);
      this.#user = this.client.fetchRepository(droidUserSchema) as Repository<DroidUserFull>;
      await this.#user.createIndex();
    }
    return this;
  }
  #user: Repository<DroidUserFull>;
  countUser = Promise.resolve(0);
  lastcount = 0;
  async addDroidUser(user: DroidUserModel): Promise<DroidUserFull> {
    const isFree = await this.redis.SADD(EMAIL_SET, user.email);
    if (!isFree) throw new ConflictException(`Account Exists`);
    const haveusers = await this.haveUser();
    if (!haveusers) {
      user.role = "admin";
    } else {
      user.role = "user";
    }
    const dbuser = await this.#user.createAndSave(user as any);
    this.countUser = Promise.resolve(1);
    return dbuser;
  }

  onModuleDestroy(): Promise<void> {
    return this.client.close();
  }

  async haveUser(): Promise<boolean> {
    const old = await this.countUser;
    if (old > 0) return true;
    const now = Date.now();
    if (this.lastcount + 10000 > now) {
      this.lastcount = now;
      this.countUser = this.#user.search().count();
    }
    const newCnt = await this.countUser;
    return newCnt > 0;
  }

  async getDroidUser(userId: string): Promise<DroidUserFull> {
    const user = await this.#user.fetch(userId);
    return user;
  }

  async getDroidUserAll(): Promise<DroidUserFull[]> {
    const users = await this.#user.search().return.all();
    return users;
  }

  async getDroidUserByEmail(email: string): Promise<DroidUserFull> {
    const user = await this.#user.search().where("email").equal(email).return.first();
    return user as any as DroidUserFull;
  }

  async cleanDb(): Promise<void> {
    const ids = await this.#user.search().allIds();
    await this.#user.remove(ids);
    await this.redis.del(EMAIL_SET);
  }

  async getDroidUserByToken(token: string): Promise<DroidUserFull | null> {
    const user = await this.#user.search().where("tokens").contains(token).return.first();
    return user;
  }

  async addToken(user: DroidUserFull): Promise<string> {
    if (user.tokens && user.tokens.length >= MAX_TOKEN) {
      throw new UnauthorizedException("MAX_TOKEN exceded");
    }
    const buf = await new Promise<Buffer>((r) => randomBytes(48, (ex, buf) => r(buf)));
    const token = buf.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
    user.tokens.push(token);
    await this.#user.save(user);
    return token;
  }
}
