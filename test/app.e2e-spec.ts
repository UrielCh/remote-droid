import { Test, TestingModule } from "@nestjs/testing";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
// import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto";
import { WsAdapterCatchAll } from "../src/WsAdapterCatchAll";
import { PhoneService } from "../src/droid/phone.service";

describe("App (e2e)", () => {
  let app: NestExpressApplication;
  // let prisma: PrismaService;
  let phoneServie: PhoneService;
  const PORT = 3000;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useWebSocketAdapter(new WsAdapterCatchAll(app));
    await app.init();
    await app.listen(PORT);
    prisma = app.get(PrismaService);
    phoneServie = app.get(PhoneService);
    await prisma.cleanDb();
    const baseUrl = `http://localhost:${PORT}`;
    pactum.request.setBaseUrl(baseUrl);
  });

  afterAll(async () => {
    await phoneServie.shutdown();
    await app.close();
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
    it("throws if no access_token provided", () => {
      return pactum
        .spec()
        .get("/users/me")
        .withHeaders({
          Authorization: "Bearer $S{userAt}",
        })
        .expectStatus(200);
      //.inspect()
      //.stores("userAt", "access_token");
    });
    //it("/ (GET)", () => {
    //  return request(app.getHttpServer())
    //    .get("/")
    //    .expect(200)
    //    .expect("Hello World!");
  });
});
