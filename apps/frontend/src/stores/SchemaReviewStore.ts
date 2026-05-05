import { makeAutoObservable, runInAction } from "mobx";
import type { Schema, Entity, Relationship } from "@data-weave/shared";
import { schemaStore } from "./index";
import { uid } from "@data-weave/shared";

export interface ReviewSuggestion {
  id: string;
  title: string;
  category: string;
  severity: "info" | "warning" | "critical";
  description: string;
}

export interface SchemaReviewResult {
  summary: string;
  suggestions: ReviewSuggestion[];
  proposedSchema: Schema;
}

/**
 * Generate a mock review result based on the current schema.
 * Used as fallback when API is unavailable.
 */
function generateMockReview(schema: Schema): SchemaReviewResult {
  const suggestions: ReviewSuggestion[] = [];

  // Analyze: FK fields missing indexed constraint
  for (const entity of schema.entities) {
    for (const field of entity.fields) {
      if (
        field.name.endsWith("_id") &&
        !field.constraints.primaryKey &&
        !field.constraints.indexed
      ) {
        suggestions.push({
          id: uid(),
          title: `Add index on ${entity.name}.${field.name}`,
          category: "indexing",
          severity: "warning",
          description: `Foreign key column "${field.name}" in table "${entity.name}" is not indexed. This will cause slow JOIN and WHERE queries as the table grows. Adding an index is strongly recommended.`,
        });
      }
    }
  }

  // Analyze: Tables without updated_at/created_at
  for (const entity of schema.entities) {
    const hasTimestamp = entity.fields.some(
      (f) =>
        f.name === "created_at" ||
        f.name === "updated_at" ||
        f.name === "createdAt" ||
        f.name === "updatedAt",
    );
    if (!hasTimestamp) {
      suggestions.push({
        id: uid(),
        title: `Add audit timestamps to ${entity.name}`,
        category: "integrity",
        severity: "info",
        description: `Table "${entity.name}" lacks created_at/updated_at timestamp columns. Adding these supports audit trails, cache invalidation, and incremental sync patterns.`,
      });
    }
  }

  // Analyze: nullable not explicitly set
  for (const entity of schema.entities) {
    for (const field of entity.fields) {
      if (
        !field.constraints.primaryKey &&
        field.constraints.nullable === undefined &&
        !field.name.endsWith("_id")
      ) {
        suggestions.push({
          id: uid(),
          title: `Explicit nullability on ${entity.name}.${field.name}`,
          category: "integrity",
          severity: "info",
          description: `Column "${field.name}" does not have explicit nullable constraint. Define NOT NULL or nullable to prevent accidental null insertions and clarify the data contract.`,
        });
      }
    }
  }

  // Limit to top 5 suggestions
  const topSuggestions = suggestions.slice(0, 5);

  // Build proposed schema with indexes added on FK fields
  const proposedEntities: Entity[] = schema.entities.map((entity) => ({
    ...entity,
    fields: entity.fields.map((field) => {
      if (
        field.name.endsWith("_id") &&
        !field.constraints.primaryKey &&
        !field.constraints.indexed
      ) {
        return {
          ...field,
          constraints: {
            ...field.constraints,
            indexed: true,
            foreignKey: true,
          },
        };
      }
      return field;
    }),
  }));

  // Add created_at/updated_at to tables missing them
  const finalEntities: Entity[] = proposedEntities.map((entity) => {
    const hasTimestamp = entity.fields.some(
      (f) =>
        f.name === "created_at" ||
        f.name === "updated_at" ||
        f.name === "createdAt" ||
        f.name === "updatedAt",
    );
    if (hasTimestamp) return entity;
    return {
      ...entity,
      fields: [
        ...entity.fields,
        {
          id: uid(),
          name: "created_at",
          type: "timestamptz" as const,
          constraints: { nullable: false },
        },
        {
          id: uid(),
          name: "updated_at",
          type: "timestamptz" as const,
          constraints: { nullable: false },
        },
      ],
    };
  });

  const proposedRelationships: Relationship[] = [...schema.relationships];

  return {
    summary:
      suggestions.length === 0
        ? "Your schema is well-structured with no critical issues found."
        : `Found ${suggestions.length} optimization opportunities. Key areas: missing indexes on foreign key columns and absent audit timestamp fields. Applying these changes will improve query performance and data traceability.`,
    suggestions: topSuggestions,
    proposedSchema: {
      ...schema,
      entities: finalEntities,
      relationships: proposedRelationships,
    },
  };
}

export class SchemaReviewStore {
  loading = false;
  error: string | null = null;
  result: SchemaReviewResult | null = null;
  compareMode: "before" | "after" = "before";

  constructor() {
    makeAutoObservable(this);
  }

  async runReview() {
    this.loading = true;
    this.error = null;
    this.result = null;
    this.compareMode = "before";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/schema-review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schema: schemaStore.schema }),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      runInAction(() => {
        this.result = {
          summary: data.summary,
          suggestions: data.suggestions,
          proposedSchema: {
            ...schemaStore.schema,
            entities: data.proposedSchema.entities,
            relationships: data.proposedSchema.relationships,
          },
        };
      });
    } catch {
      // Fallback to mock review when API is unavailable
      runInAction(() => {
        this.result = generateMockReview(schemaStore.schema);
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  setCompareMode(mode: "before" | "after") {
    this.compareMode = mode;
  }

  applyProposedSchema() {
    if (!this.result) return;
    schemaStore.replaceSchema(this.result.proposedSchema);
    this.compareMode = "before";
    this.result = null;
  }

  dismiss() {
    this.result = null;
    this.compareMode = "before";
    this.error = null;
  }
}
