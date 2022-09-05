import { LogLevel, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { WsAdapterCatchAll } from "./WsAdapterCatchAll";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as fs from "fs";
import process from "process";
import { getEnv } from "./env";

async function bootstrap() {
  const SERVICE_PORT = Number(process.env.SERVICE_PORT || "3009");
  const globalPrefixs = getEnv("GLOBAL_PREFIX", "/")
    .split("/")
    .filter((a) => a);
  let version = "0.0.0";
  try {
    const pkg = JSON.parse(fs.readFileSync("package.json", { encoding: "utf8" }));
    if (pkg.version) version = pkg.version;
  } catch (e) {}
  const logger: LogLevel[] = ["log", "error", "warn", "debug", "verbose"];
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, logger });
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // , whitelist: true
  app.useWebSocketAdapter(new WsAdapterCatchAll(app));
  app.enableCors({});
  app.setGlobalPrefix("/" + [...globalPrefixs].join("/"));
  // app.useGlobalFilters(new HttpErrorFilter(httpAdapter));
  // app.useGlobalFilters(new HttpErrorFilter(app));
  // app.useGlobalInterceptors(new ErrorInterceptor());
  // not used
  // app.useGlobalGuards()
  const options = new DocumentBuilder()
    .setTitle("Remote-droid")
    .setVersion(version)
    .setDescription("Remote control your android devices, with simple REST call")
    .addSecurity("JWT token", {
      scheme: "bearer",
      bearerFormat: "JWT",
      type: "http",
      description: "Provide a valid JWT acess token from /auth/signin",
      flows: {
        // password: { authorizationUrl: '/auth/login', scopes: {} },
        password: { scopes: {}, tokenUrl: "/auth/signin" }, // , refreshUrl: "/auth/refresh-token"
      },
    })
    .addSecurity("devices token", {
      scheme: "bearer",
      bearerFormat: "token",
      type: "http",
      description: "Provide a valid devices token from /user/token",
      flows: {
        password: { scopes: {}, tokenUrl: "/user/token" },
      },
    })
    .addTag("Authentification", "Create / Login an account")
    .addTag("Users", "Manage devices access, and generate devices token")
    .addTag("Devices", "Control devices")
    .addTag("Info", "Node informations")
    // .setBasePath(globalPrefix)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  const swaggerUrl = "/" + [...globalPrefixs, "api"].join("/");
  console.log(`Config swagger on ${swaggerUrl}`);
  SwaggerModule.setup(swaggerUrl, app, document);
  await app.listen(SERVICE_PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

bootstrap();
