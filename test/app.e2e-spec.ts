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
    const authData: AuthDto = {
      email: "user@domain.com",
      password: "my Pass",
    };
    describe("Signup", () => {
      it("shoulkd create an account", () => {
        // TODO send email
        return pactum.spec().post("/auth/signup").withBody(authData).expectStatus(201);
      });
    });
    describe("Signin", () => {
      it("should get a JWT token", () => {
        // TODO send email
        return pactum.spec().post("/auth/signin").withBody(authData).expectStatus(200).stores("userAt", "access_token");
      });
    });
  });

  describe("Users", () => {
    it("throws if no access_token provided", () => {
      return pactum.spec().get("/users/me").expectStatus(401);
    });
    it("get user me with access_token", () => {
      return pactum
        .spec()
        .get("/users/me")
        .withHeaders({
          Authorization: "Bearer $S{userAt}",
        })
        .expectStatus(200);
    });
  });
});
