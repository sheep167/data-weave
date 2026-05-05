import { Injectable, Logger } from "@nestjs/common";
import type { Schema, WhatIfSuggestion, Entity } from "@data-weave/shared";

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  private get apiKey(): string {
    return process.env.MOONSHOT_API_KEY ?? "";
  }

  private get baseUrl(): string {
    return process.env.MOONSHOT_BASE_URL ?? "https://api.moonshot.ai/v1";
  }

  private get model(): string {
    return process.env.MOONSHOT_MODEL ?? "kimi-k2.6";
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
   * Realistic data generation via Kimi (kimi-k2.6)
   * Uses geolocation to generate locale-specific data
   */
  async generateRealisticDataWithLLM(
    entity: Entity,
    rowCount: number,
    latitude: number,
    longitude: number,
  ): Promise<Record<string, unknown>[]> {
    this.logger.log(
      `Generating ${rowCount} realistic rows for "${entity.name}" via Kimi (lat=${latitude}, lng=${longitude})`,
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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: userMessage }],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.error(
          `Kimi API error: ${response.status} — ${text.slice(0, 200)}`,
        );
        throw new Error(`Kimi API returned ${response.status}`);
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        this.logger.error(
          `Kimi returned non-JSON response: ${text.slice(0, 200)}`,
        );
        throw new Error("Kimi returned non-JSON response");
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
      this.logger.error(`Kimi generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Schema review via Kimi — professional analysis of schema design
   * Returns structured suggestions for optimization
   */
  async reviewSchema(schema: Schema): Promise<{
    summary: string;
    suggestions: Array<{
      id: string;
      title: string;
      category: string;
      severity: "info" | "warning" | "critical";
      description: string;
      proposedChanges: {
        entities: Schema["entities"];
        relationships: Schema["relationships"];
      };
    }>;
    proposedSchema: Schema;
  }> {
    this.logger.log(`Reviewing schema: ${schema.name}`);

    const schemaJson = JSON.stringify(
      {
        name: schema.name,
        entities: schema.entities.map((e) => ({
          id: e.id,
          name: e.name,
          fields: e.fields.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            constraints: f.constraints,
          })),
        })),
        relationships: schema.relationships.map((r) => ({
          id: r.id,
          sourceEntityId: r.sourceEntityId,
          sourceFieldId: r.sourceFieldId,
          targetEntityId: r.targetEntityId,
          targetFieldId: r.targetFieldId,
          cardinality: r.cardinality,
          label: r.label,
        })),
      },
      null,
      2,
    );

    const userMessage = `
You are a senior database architect performing a professional schema review. Analyze the following database schema comprehensively.

Review criteria:
1. **Normalization** — identify redundancies, repeated fields, denormalization issues
2. **Indexing** — suggest indexes for likely query patterns (foreign keys, frequently filtered columns, composite indexes)
3. **Query optimization** — identify potential N+1 patterns, missing junction tables, or inefficient relationship structures
4. **Data integrity** — missing constraints (NOT NULL, UNIQUE, CHECK), orphaned foreign keys, cascade issues
5. **Naming conventions** — inconsistencies in table/column naming
6. **Scalability** — potential bottlenecks, suggest partitioning or archiving strategies if applicable

Current Schema:
${schemaJson}

You MUST respond with a JSON object matching this exact structure:
{
  "summary": "A 2-3 sentence executive summary of the schema health",
  "suggestions": [
    {
      "id": "unique_id",
      "title": "Short title",
      "category": "normalization|indexing|integrity|naming|scalability|query",
      "severity": "info|warning|critical",
      "description": "Detailed explanation of the issue and the proposed fix"
    }
  ],
  "proposedSchema": {
    "entities": [<full list of entities with all fields, INCLUDING your suggested changes applied>],
    "relationships": [<full list of relationships, INCLUDING your suggested changes applied>]
  }
}

Important rules:
- The proposedSchema MUST include ALL existing entities/relationships, modified with your suggestions applied
- Keep all existing IDs for unchanged entities/fields/relationships
- Generate new UUIDs (v4 format) for any NEW entities/fields/relationships you add
- Only suggest changes that are truly necessary — do not over-engineer
- Each entity in proposedSchema must have: id, name, fields (with id, name, type, constraints), position (keep original positions, new entities at x:600, y:200)
- Each relationship must have: id, sourceEntityId, sourceFieldId, targetEntityId, targetFieldId, cardinality
`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: userMessage }],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.error(
          `Kimi API error: ${response.status} — ${text.slice(0, 200)}`,
        );
        throw new Error(`Kimi API returned ${response.status}`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? "{}";

      const jsonStr = content
        .replace(/```json?\n?/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(jsonStr);

      // Reconstruct full proposed schema
      const proposedSchema: Schema = {
        ...schema,
        entities: (parsed.proposedSchema?.entities ?? schema.entities).map(
          (e: Entity) => ({
            ...e,
            position: e.position ?? { x: 600, y: 200 },
          }),
        ),
        relationships:
          parsed.proposedSchema?.relationships ?? schema.relationships,
      };

      return {
        summary: parsed.summary ?? "Review complete.",
        suggestions: parsed.suggestions ?? [],
        proposedSchema,
      };
    } catch (error) {
      this.logger.error(`Schema review failed: ${error}`);
      throw error;
    }
  }
}
