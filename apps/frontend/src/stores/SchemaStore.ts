import { makeAutoObservable } from "mobx";
import type { Schema, Entity, Relationship, Field } from "@data-weave/shared";
import { ecommerceTemplate, uid } from "@data-weave/shared";

export class SchemaStore {
    schema: Schema = ecommerceTemplate;

    constructor() {
        makeAutoObservable(this);
    }

    addEntity(name: string, position: { x: number; y: number }) {
        const entity: Entity = {
            id: uid(),
            name,
            position,
            fields: [
                {
                    id: uid(),
                    name: "id",
                    type: "uuid",
                    constraints: { primaryKey: true },
                },
            ],
        };
        this.schema.entities.push(entity);
        this.touch();
        return entity;
    }

    removeEntity(id: string) {
        this.schema.entities = this.schema.entities.filter((e) => e.id !== id);
        this.schema.relationships = this.schema.relationships.filter(
            (r) => r.sourceEntityId !== id && r.targetEntityId !== id,
        );
        this.touch();
    }

    updateEntityPosition(id: string, position: { x: number; y: number }) {
        const entity = this.schema.entities.find((e) => e.id === id);
        if (entity) entity.position = position;
    }

    renameEntity(id: string, name: string) {
        const entity = this.schema.entities.find((e) => e.id === id);
        if (entity) {
            entity.name = name;
            this.touch();
        }
    }

    updateField(entityId: string, fieldId: string, updates: Partial<Omit<Field, "id">>) {
        const entity = this.schema.entities.find((e) => e.id === entityId);
        if (!entity) return;
        const field = entity.fields.find((f) => f.id === fieldId);
        if (!field) return;
        Object.assign(field, updates);
        this.touch();
    }

    updateRelationship(id: string, updates: Partial<Omit<Relationship, "id">>) {
        const rel = this.schema.relationships.find((r) => r.id === id);
        if (!rel) return;
        Object.assign(rel, updates);
        this.touch();
    }

    addField(entityId: string, field: Omit<Field, "id">) {
        const entity = this.schema.entities.find((e) => e.id === entityId);
        if (!entity) return;
        entity.fields.push({ ...field, id: uid() });
        this.touch();
    }

    removeField(entityId: string, fieldId: string) {
        const entity = this.schema.entities.find((e) => e.id === entityId);
        if (!entity) return;
        entity.fields = entity.fields.filter((f) => f.id !== fieldId);
        this.touch();
    }

    addRelationship(rel: Omit<Relationship, "id">) {
        this.schema.relationships.push({ ...rel, id: uid() });
        this.touch();
    }

    removeRelationship(id: string) {
        this.schema.relationships = this.schema.relationships.filter((r) => r.id !== id);
        this.touch();
    }

    replaceSchema(schema: Schema) {
        this.schema = schema;
    }

    private touch() {
        this.schema.updatedAt = new Date().toISOString();
    }

    get entityMap(): Map<string, Entity> {
        return new Map(this.schema.entities.map((e) => [e.id, e]));
    }
}
