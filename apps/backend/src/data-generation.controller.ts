import { Controller, Post, Body } from "@nestjs/common";
import { LlmService } from "./services/llm.service";
import type { Entity } from "@data-weave/shared";

interface GenerateDataBody {
  entity: Entity;
  rowCount: number;
  latitude: number;
  longitude: number;
}

@Controller("generate")
export class DataGenerationController {
  constructor(private readonly llmService: LlmService) {}

  @Post()
  async generateData(@Body() body: GenerateDataBody) {
    const { entity, rowCount, latitude, longitude } = body;
    return this.llmService.generateRealisticDataWithLLM(
      entity,
      rowCount,
      latitude,
      longitude,
    );
  }
}
