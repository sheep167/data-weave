// ── Field-level types ──────────────────────────────────────────────

export type SqlType =
    | "uuid"
    | "serial"
    | "text"
    | "varchar"
    | "int"
    | "bigint"
    | "float"
    | "decimal"
    | "boolean"
    | "date"
    | "timestamp"
    | "timestamptz"
    | "json"
    | "jsonb";

export interface FieldConstraints {
    primaryKey?: boolean;
    foreignKey?: boolean;
    nullable?: boolean;
    unique?: boolean;
    indexed?: boolean;
    default?: string;
    check?: string;
}

export interface Field {
    id: string;
    name: string;
    type: SqlType;
    constraints: FieldConstraints;
    isPII?: boolean;
    comment?: string;
}

// ── Entity ─────────────────────────────────────────────────────────

export interface Entity {
    id: string;
    name: string;
    fields: Field[];
    color?: string;
    position: { x: number; y: number };
}

// ── Relationships ──────────────────────────────────────────────────

export type Cardinality = "1:1" | "1:N" | "N:M";

export interface Relationship {
    id: string;
    sourceEntityId: string;
    sourceFieldId: string;
    targetEntityId: string;
    targetFieldId: string;
    cardinality: Cardinality;
    label?: string;
}

// ── Schema (top-level document) ────────────────────────────────────

export interface Schema {
    id: string;
    name: string;
    entities: Entity[];
    relationships: Relationship[];
    createdAt: string;
    updatedAt: string;
}

// ── AI / What-If types ─────────────────────────────────────────────

export type DiffAction = "added" | "removed" | "modified" | "unchanged";

export interface SchemaDiff {
    entities: { entity: Entity; action: DiffAction }[];
    relationships: { relationship: Relationship; action: DiffAction }[];
    summary: string;
}

export interface WhatIfSuggestion {
    id: string;
    title: string;
    description: string;
    category:
        | "normalization"
        | "denormalization"
        | "junction"
        | "index"
        | "audit"
        | "polymorphic"
        | "general";
    proposedSchema: Schema;
    diff: SchemaDiff;
}

// ── Data Generation ────────────────────────────────────────────────

export type GenerationMode = "realistic" | "mock";

export interface GenerationConfig {
    mode: GenerationMode;
    rowCount: number;
    seed?: number;
    nullRate?: number; // 0–1
    outlierRate?: number; // 0–1
}

export interface QualityScore {
    realism: number; // 0–100
    consistency: number;
    diversity: number;
    storageMB: number;
}

// ── Export ──────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "json" | "sql" | "parquet";

// ── Domain Templates ───────────────────────────────────────────────

export type DomainTemplate =
    | "ecommerce"
    | "saas-events"
    | "finance"
    | "logistics"
    | "healthcare-lite";
