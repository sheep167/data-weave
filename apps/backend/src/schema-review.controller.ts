import { Controller, Post, Body } from "@nestjs/common";
import { LlmService } from "./services/llm.service";
import type { Schema } from "@data-weave/shared";

interface ReviewSchemaBody {
  schema: Schema;
}

@Controller("schema-review")
export class SchemaReviewController {
  constructor(private readonly llmService: LlmService) {}

  @Post()
  async reviewSchema(@Body() body: ReviewSchemaBody) {
    return this.llmService.reviewSchema(body.schema);
  }
}
