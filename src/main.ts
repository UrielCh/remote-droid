import { LogLevel, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { WsAdapterCatchAll } from "./WsAdapterCatchAll";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const logger: LogLevel[] = ["log", "error", "warn", "debug", "verbose"];
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, logger });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useWebSocketAdapter(new WsAdapterCatchAll(app));
  app.enableCors();
  const options = new DocumentBuilder().setTitle("remote droid").setDescription("remote control your android devices").setVersion("1.0").build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api", app, document);
  await app.listen(3009);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

bootstrap();
