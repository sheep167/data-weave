import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT || 3001;
    const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
    app.setGlobalPrefix("api");
    app.enableCors({ origin: corsOrigin });
    await app.listen(port);
    console.log(`🚀 DataWeave API running on http://localhost:${port}`);
}
bootstrap();
