import { ConflictException, NotFoundException, OnModuleDestroy, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { Client, Repository } from 'redis-om';
import { DroidUserFull, DroidUserModel, droidUserSchema } from './user.entity';
import { randomBytes } from 'crypto';
import { AllowParamsDto } from '../user/dto/allowParams.dto';

declare type RedisConnection = ReturnType<typeof createClient>;

const EMAIL_SET = 'rdroid:email';
const MAX_TOKEN = 3;

export class DbService implements OnModuleDestroy {
  client: Client | undefined;
  redis: RedisConnection | undefined;
  #user!: Repository<DroidUserFull>;
  #adminToken!: string;

  constructor(private config: ConfigService) {
    // empty
  }

  async init(): Promise<DbService> {
    this.#adminToken = this.config.get('ADMIN_TOKEN') || '';
    // if (this.#adminToken) return this;
    const provider = this.config.get('DATABASE_PROVIDER');
    if (!provider || provider === 'redis') {
      const url = this.config.get('DATABASE_REDIS_URL') as string;
      if (!url && provider) {
        throw new Error('DATABASE_REDIS_URL env variable must be provided to connect Redis');
      }
      if (url) {
        try {
          this.redis = createClient({ url });
          await this.redis.connect();
          this.client = await new Client().use(this.redis);
          this.#user = this.client.fetchRepository(droidUserSchema) as Repository<DroidUserFull>;
          await this.#user.createIndex();
        } catch (e) {
          console.error(`Failed to connectd Redis: ${url} err:${(e as Error).message}`);
          if (!this.#adminToken) throw e;
          console.error('New User creation will not be available. (an adminToken is defined)');
        }
      }
    }
    return this;
  }
  get adminToken(): string {
    return this.#adminToken;
  }

  countUser = Promise.resolve(0);
  lastcount = 0;
  async addDroidUser(user: DroidUserModel): Promise<DroidUserFull> {
    if (!this.redis) throw new ServiceUnavailableException('No Database enabled');
    const isFree = await this.redis.SADD(EMAIL_SET, user.email);
    if (!isFree) throw new ConflictException('Account Exists');
    const haveusers = await this.haveUser();
    if (!haveusers && !this.adminToken) {
      user.role = 'admin';
    } else {
      user.role = 'user';
    }
    const dbuser = await this.#user.createAndSave(user as any);
    this.countUser = Promise.resolve(1);
    return dbuser;
  }

  onModuleDestroy(): Promise<void> {
    if (this.client) return this.client.close();
    return Promise.resolve(undefined);
  }

  async haveUser(): Promise<boolean> {
    if (!this.redis) return false;
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

  async getDroidUser(userId: string): Promise<DroidUserFull | null> {
    if (!this.redis) return null;
    const user = await this.#user.fetch(userId);
    return user;
  }

  async getDroidUserAll(): Promise<DroidUserFull[]> {
    if (!this.redis) return [];
    const users = await this.#user.search().return.all();
    return users;
  }

  async getDroidUserByEmail(email: string): Promise<DroidUserFull | null> {
    if (!this.redis) return null;
    const user = await this.#user.search().where('email').equal(email).return.first();
    return user;
  }

  async cleanDb(): Promise<void> {
    if (!this.redis) return;
    const ids = await this.#user.search().allIds();
    await this.#user.remove(ids);
    await this.redis.del(EMAIL_SET);
  }

  async getDroidUserByToken(token: string): Promise<DroidUserFull | null> {
    if (!this.redis) return null;
    if (!token) return null;
    const user = await this.#user.search().where('tokens').contains(token).return.first();
    return user;
  }

  async addToken(user: DroidUserFull): Promise<string> {
    if (!this.redis) throw new ServiceUnavailableException('No Database enabled');
    if (user.tokens && user.tokens.length >= MAX_TOKEN) {
      throw new UnauthorizedException('MAX_TOKEN exceded');
    }
    const buf = await new Promise<Buffer>((r) => randomBytes(48, (ex, buf) => r(buf)));
    const token = buf.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
    user.tokens.push(token);
    await this.#user.save(user);
    return token;
  }

  async allowAccess(params: AllowParamsDto): Promise<string[]> {
    if (!this.redis) throw new ServiceUnavailableException('No Database enabled');
    const user = await this.getDroidUserByEmail(params.email);
    if (!user) throw new NotFoundException('user not found in base');
    if (user.devices.includes(params.serial)) throw new ConflictException('device allready authorized');
    user.devices.push(params.serial);
    await this.#user.save(user);
    return user.devices;
  }
}
