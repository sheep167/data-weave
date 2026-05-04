import { Injectable, Logger } from "@nestjs/common";
import type { Schema, WhatIfSuggestion, Entity } from "@data-weave/shared";

const DUCKLLM_BASE_URL = "https://api.duckllm.com/v1";
const DUCKLLM_MODEL = "gpt-5";

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  private get apiKey(): string {
    return process.env.DUCKLLM_API_KEY ?? "";
  }

  /**
   * Mock implementation — replace with real Grok/Groq calls when API key is ready.
   */
  async getWhatIfSuggestions(schema: Schema): Promise<WhatIfSuggestion[]> {
    this.logger.log(
      `Generating what-if suggestions for schema: ${schema.name}`,
    );

    // Simulate latency
    await new Promise((r) => setTimeout(r, 800));

    return [
      {
        id: "mock_suggestion_1",
        title: "Extract Addresses Entity",
        description:
          "Customers often have multiple addresses (billing, shipping). Extract a dedicated addresses table with a 1:N relationship from customers.",
        category: "normalization",
        proposedSchema: schema,
        diff: {
          entities: [],
          relationships: [],
          summary:
            "Mock diff — real implementation will compute entity/relationship diffs.",
        },
      },
    ];
  }

  /**
   * Mock synthetic data generation via LLM
   */
  async generateRealisticData(
    schema: Schema,
    entityId: string,
    rowCount: number,
  ): Promise<Record<string, unknown>[]> {
    this.logger.log(
      `Generating ${rowCount} realistic rows for entity ${entityId}`,
    );
    await new Promise((r) => setTimeout(r, 500));

    return Array.from({ length: rowCount }, (_, i) => ({
      id: `mock-uuid-${i}`,
      _note: "Mock data — connect Grok API for realistic generation",
    }));
  }

  /**
   * Realistic data generation via DuckLLM (gpt-5)
   * Uses geolocation to generate locale-specific data
   */
  async generateRealisticDataWithLLM(
    entity: Entity,
    rowCount: number,
    latitude: number,
    longitude: number,
  ): Promise<Record<string, unknown>[]> {
    this.logger.log(
      `Generating ${rowCount} realistic rows for "${entity.name}" via DuckLLM (lat=${latitude}, lng=${longitude})`,
    );

    const fieldsDescription = entity.fields
      .map(
        (f) =>
          `${f.name} (${f.type}${f.constraints.primaryKey ? ", PK" : ""}${f.constraints.nullable ? ", nullable" : ""})`,
      )
      .join(", ");

    const userMessage = `
        You are generating locale and geolocation specific data for the user. The user is now in latitude ${latitude} and longitude ${longitude}. Generate realistic, privacy-safe synthetic data that reflects the culture, naming conventions, addresses, and business patterns of the region near these coordinates. Output ONLY a valid JSON array with no markdown formatting.
        
        Generate exactly ${rowCount} rows of realistic synthetic data for a database table called "${entity.name}" with the following columns: ${fieldsDescription}. 

        Rules:
        - Output a JSON array of objects
        - Each object must have all fields with ACTUAL REALISTIC VALUES — never use placeholders like "email_1" or "full_name_2"
        - UUIDs must be actual valid v4 UUIDs (e.g. "f47ac10b-58cc-4372-a567-0e02b2c3d479")
        - Emails must be actual realistic emails (e.g. "chan.wing@gmail.com")
        - Names must be actual human names appropriate for the locale (e.g. "Chan Wing Ho", "Tan Wei Ming")
        - Timestamps must be actual ISO 8601 datetime strings (e.g. "2025-03-14T09:23:11Z")
        - Dates must be actual dates (e.g. "2024-11-02")
        - Numbers must be actual numeric values, not strings
        - Booleans must be true or false
        - Serial/int PKs should be sequential starting from 1
        - Data must be culturally realistic for the region near (${latitude}, ${longitude})
        - No duplicate primary keys
        - DO NOT use patterns like "value_1", "value_2" — every single value must look like real production data

    `;

    try {
      const response = await fetch(`${DUCKLLM_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: DUCKLLM_MODEL,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.error(
          `DuckLLM API error: ${response.status} — ${text.slice(0, 200)}`,
        );
        throw new Error(`DuckLLM API returned ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        this.logger.error(
          `DuckLLM returned non-JSON response: ${text.slice(0, 200)}`,
        );
        throw new Error("DuckLLM returned non-JSON response");
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? "[]";

      // Parse JSON from response (handle potential markdown code fences)
      const jsonStr = content
        .replace(/```json?\n?/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(jsonStr);

      if (Array.isArray(parsed)) {
        return parsed.slice(0, rowCount);
      }

      return parsed;
    } catch (error) {
      this.logger.error(`DuckLLM generation failed: ${error}`);
      throw error;
    }
  }
}
