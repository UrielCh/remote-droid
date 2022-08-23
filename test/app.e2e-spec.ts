import { Test, TestingModule, TestingModuleBuilder } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import { DbService } from "../src/db/db.service";
import * as pactum from "pactum";
import supertest from "supertest";
import { AuthDto } from "../src/auth/dto";
import { WsAdapterCatchAll } from "../src/WsAdapterCatchAll";
import { PhoneService } from "../src/droid/phone.service";
import { AdbClientService } from "../src/droid/adbClient.service";
import { EventEmitter } from "stream";
import { Device, DeviceClient } from "@u4/adbkit";

beforeEach(function () {
  jest.setTimeout(200000);
});

const fakePhoneId = "12345678ff";

const fakeDevice1: Device = {
  id: fakePhoneId,
  type: "device",
  getClient: () => new DummyDeviceClient(fakePhoneId) as any as DeviceClient,
};

class DummyDeviceTracker extends EventEmitter {
  constructor() {
    super();
    setTimeout(() => {
      this.emit("online", fakeDevice1);
    }, 1);
  }
}

class DummyDeviceClient {
  constructor(public serial: string) {}
  getProperties() {
    return { "net.hostname": "fake host" };
  }
}

describe("App (e2e)", () => {
  let app: NestExpressApplication;
  let dbService: DbService;
  let phoneServie: PhoneService;
  const PORT = 3000;

  const fakeAdbClientService = {
    tracker: Promise.resolve(new DummyDeviceTracker()),
    listDevices: () => {
      return [fakeDevice1];
    },
  };

  beforeAll(async () => {
    try {
      const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
        imports: [AppModule],
        // providers: [
        //   {
        //     provide: AdbClientService,
        //     useValue: () => {
        //       console.log("useValue AdbClientService");
        //       return fakeAdbClientService;
        //     },
        //   },
        // ],
      });
      moduleBuilder.overrideProvider(AdbClientService).useValue(fakeAdbClientService);
      const moduleFixture: TestingModule = await moduleBuilder.compile();
      // const fakeModule = moduleFixture.get(AdbClientService);
      // console.log(fakeModule);
      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
      app.useWebSocketAdapter(new WsAdapterCatchAll(app));
      await app.init();
      dbService = app.get(DbService);
      phoneServie = app.get(PhoneService);
      await dbService.cleanDb();

      // using real socket
      await app.listen(PORT);
      const baseUrl = `http://localhost:${PORT}`;
      pactum.request.setBaseUrl(baseUrl);
    } catch (e) {
      console.error("beforeAll failed:", e);
      process.exit(1);
    }
  }, 50000);

  afterAll(async () => {
    if (phoneServie) await phoneServie.shutdown();
    if (app) await app.close();
  });

  describe("access phone without Auth (supertest)", () => {
    it("should be able to list devices (supertest)", () => {
      return supertest(app.getHttpServer()).get("/device/").expect(200);
    });
  });

  describe("access phone without Auth", () => {
    it("should be able to list devices", () => {
      // [ { "id": "12345678", "type": "device" } ]
      return pactum.spec().get("/device/").expectStatus(200).expectBodyContains(fakePhoneId).toss();
    });
  });
  describe("Auth", () => {
    const authAdminData: AuthDto = {
      email: "user1@domain.com",
      password: "myPass1",
    };

    const authUserData: AuthDto = {
      email: "user2@domain.com",
      password: "myPass2",
    };

    describe("Signup admin", () => {
      it("should create an admin account", () => {
        return pactum.spec().post("/auth/signup").withBody(authAdminData).expectStatus(201).toss();
      });
    });
    describe("Signin admin", () => {
      it("should get an admin JWT token", () => {
        return pactum.spec().post("/auth/signin").withBody(authAdminData).expectStatus(200).stores("adminAt", "access_token").toss();
      });
    });

    describe("Signup user", () => {
      it("should create an user account", () => {
        return pactum.spec().post("/auth/signup").withBody(authUserData).expectStatus(201).toss();
      });
    });
    describe("Signin user", () => {
      it("should get an user JWT token", () => {
        return pactum.spec().post("/auth/signin").withBody(authUserData).expectStatus(200).stores("userAt", "access_token").toss();
      });
    });
  });

  describe("Users admin", () => {
    it("throws if no access_token provided", () => {
      return pactum.spec().get("/user/me").expectStatus(401).toss();
    });
    it("get admin user me with access_token", () => {
      return pactum
        .spec()
        .get("/user/me")
        .withHeaders({
          Authorization: "Bearer $S{adminAt}",
        })
        .expectStatus(200)
        .expectBodyContains('"role":"admin"')
        .toss();
    });
    it("get user user me with access_token", () => {
      return pactum
        .spec()
        .get("/user/me")
        .withHeaders({
          Authorization: "Bearer $S{userAt}",
        })
        .expectStatus(200)
        .expectBodyContains('"role":"user"')
        .toss();
    });
  });

  describe("Emit new Tokens", () => {
    it("emit first user token", () => {
      return pactum
        .spec()
        .put("/user/token")
        .withHeaders({
          Authorization: "Bearer $S{userAt}",
        })
        .expectStatus(200)
        .stores("userToken", "token")
        .toss();
    });
    it("emit second user token", () => {
      return pactum
        .spec()
        .put("/user/token")
        .withHeaders({
          Authorization: "Bearer $S{userAt}",
        })
        .expectStatus(200)
        .stores("userToken", "token")
        .toss();
    });
    it("emit 3th user token", () => {
      return pactum
        .spec()
        .put("/user/token")
        .withHeaders({
          Authorization: "Bearer $S{userAt}",
        })
        .expectStatus(200)
        .stores("userToken", "token")
        .toss();
    });
    it("try emit 4th user token", () => {
      return pactum
        .spec()
        .put("/user/token")
        .withHeaders({
          Authorization: "Bearer $S{userAt}",
        })
        .expectStatus(401)
        .toss();
    });
    it("emit first admin token", () => {
      return pactum
        .spec()
        .put("/user/token")
        .withHeaders({
          Authorization: "Bearer $S{adminAt}",
        })
        .expectStatus(200)
        .stores("adminToken", "token")
        .toss();
    });
  });

  describe("access device with some active accounts", () => {
    it("should not be able to list devices without token", () => {
      return pactum.spec().get("/device/").expectStatus(403).toss();
    });

    it("can list device with token", () => {
      return pactum
        .spec()
        .get("/device/")
        .withHeaders({
          Authorization: "Bearer $S{userToken}",
        })
        .expectStatus(200)
        .expectBodyContains("[]")
        .toss();
    });

    it("can list device with token", () => {
      return pactum
        .spec()
        .get("/device/")
        .withHeaders({
          Authorization: "Bearer $S{adminToken}",
        })
        .expectStatus(200)
        .expectBodyContains(fakePhoneId)
        .toss();
    });
  });
});
