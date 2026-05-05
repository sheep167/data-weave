import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { DataGenerationController } from "./data-generation.controller";
import { SchemaReviewController } from "./schema-review.controller";
import { LlmService } from "./services/llm.service";

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [HealthController, DataGenerationController, SchemaReviewController],
    providers: [LlmService],
})
export class AppModule {}
