import { Test, TestingModule } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import { DbService } from "../src/db/db.service";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto";
import { WsAdapterCatchAll } from "../src/WsAdapterCatchAll";
import { PhoneService } from "../src/droid/phone.service";

beforeEach(function () {
  jest.setTimeout(200000); // ms
});

describe("App (e2e)", () => {
  let app: NestExpressApplication;
  let dbService: DbService;
  let phoneServie: PhoneService;
  const PORT = 3000;
  beforeAll(async () => {
    try {
      const themodule = Test.createTestingModule({
        imports: [AppModule],
      });
      const moduleFixture: TestingModule = await themodule.compile();
      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
      app.useWebSocketAdapter(new WsAdapterCatchAll(app));
      await app.init();
      await app.listen(PORT);
      dbService = app.get(DbService);
      phoneServie = app.get(PhoneService);
      await dbService.cleanDb();
      const baseUrl = `http://localhost:${PORT}`;
      pactum.request.setBaseUrl(baseUrl);
    } catch (e) {
      console.error("beforeAll failed:", e);
      process.exit(1);
    }
  }, 120000);

  afterAll(async () => {
    console.log("afterAll");
    if (phoneServie) await phoneServie.shutdown();
    if (app) await app.close();
  });
  it.todo("should be ok");

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
        return pactum.spec().post("/auth/signup").withBody(authAdminData).expectStatus(201);
      });
    });
    describe("Signin admin", () => {
      it("should get an admin JWT token", () => {
        return pactum.spec().post("/auth/signin").withBody(authAdminData).expectStatus(200).stores("adminAt", "access_token");
      });
    });
    describe("Signup user", () => {
      it("should create an user account", () => {
        return pactum.spec().post("/auth/signup").withBody(authUserData).expectStatus(201);
      });
    });
    describe("Signin user", () => {
      it("should get an user JWT token", () => {
        return pactum.spec().post("/auth/signin").withBody(authUserData).expectStatus(200).stores("userAt", "access_token");
      });
    });
  });

  describe("Users admin", () => {
    it("throws if no access_token provided", () => {
      return pactum.spec().get("/users/me").expectStatus(401);
    });
    it("get admin user me with access_token", () => {
      return pactum
        .spec()
        .get("/users/me")
        .withHeaders({
          Authorization: "Bearer $S{adminAt}",
        })
        .expectStatus(200)
        .expectBodyContains("admin");
    });
    // it("get user user me with access_token", () => {
    //   return pactum
    //     .spec()
    //     .get("/users/me")
    //     .withHeaders({
    //       Authorization: "Bearer $S{userAt}",
    //     })
    //     .expectStatus(200)
    //     .expect
    //     Contains("admin");
    // });
  });
});
