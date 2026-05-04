import type { Schema } from "../types";

const id = (prefix: string, n: number) => `${prefix}_${n}`;

export const ecommerceTemplate: Schema = {
  id: "tpl_ecommerce",
  name: "E-Commerce Starter",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  entities: [
    {
      id: id("e", 1),
      name: "customers",
      position: { x: 0, y: 0 },
      fields: [
        {
          id: id("f", 1),
          name: "id",
          type: "uuid",
          constraints: { primaryKey: true },
        },
        {
          id: id("f", 2),
          name: "email",
          type: "varchar",
          constraints: { unique: true, nullable: false },
          isPII: true,
        },
        {
          id: id("f", 3),
          name: "full_name",
          type: "text",
          constraints: { nullable: false },
          isPII: true,
        },
        {
          id: id("f", 4),
          name: "created_at",
          type: "timestamptz",
          constraints: { default: "now()" },
        },
      ],
    },
    {
      id: id("e", 2),
      name: "products",
      position: { x: 400, y: 0 },
      fields: [
        {
          id: id("f", 10),
          name: "id",
          type: "uuid",
          constraints: { primaryKey: true },
        },
        {
          id: id("f", 11),
          name: "name",
          type: "text",
          constraints: { nullable: false },
        },
        {
          id: id("f", 12),
          name: "price",
          type: "decimal",
          constraints: { nullable: false },
        },
        {
          id: id("f", 13),
          name: "sku",
          type: "varchar",
          constraints: { unique: true },
        },
        { id: id("f", 14), name: "category", type: "text", constraints: {} },
        {
          id: id("f", 15),
          name: "in_stock",
          type: "boolean",
          constraints: { default: "true" },
        },
      ],
    },
    {
      id: id("e", 3),
      name: "orders",
      position: { x: 200, y: 300 },
      fields: [
        {
          id: id("f", 20),
          name: "id",
          type: "uuid",
          constraints: { primaryKey: true },
        },
        {
          id: id("f", 21),
          name: "customer_id",
          type: "uuid",
          constraints: { nullable: false },
        },
        {
          id: id("f", 22),
          name: "status",
          type: "varchar",
          constraints: { default: "'pending'" },
        },
        { id: id("f", 23), name: "total", type: "decimal", constraints: {} },
        {
          id: id("f", 24),
          name: "ordered_at",
          type: "timestamptz",
          constraints: { default: "now()" },
        },
      ],
    },
    {
      id: id("e", 4),
      name: "order_items",
      position: { x: 500, y: 300 },
      fields: [
        {
          id: id("f", 30),
          name: "id",
          type: "uuid",
          constraints: { primaryKey: true },
        },
        {
          id: id("f", 31),
          name: "order_id",
          type: "uuid",
          constraints: { nullable: false },
        },
        {
          id: id("f", 32),
          name: "product_id",
          type: "uuid",
          constraints: { nullable: false },
        },
        {
          id: id("f", 33),
          name: "quantity",
          type: "int",
          constraints: { nullable: false, default: "1" },
        },
        {
          id: id("f", 34),
          name: "unit_price",
          type: "decimal",
          constraints: { nullable: false },
        },
      ],
    },
  ],
  relationships: [
    {
      id: id("r", 1),
      sourceEntityId: id("e", 1),
      sourceFieldId: id("f", 1),
      targetEntityId: id("e", 3),
      targetFieldId: id("f", 21),
      cardinality: "1:N",
      label: "places",
    },
    {
      id: id("r", 2),
      sourceEntityId: id("e", 3),
      sourceFieldId: id("f", 20),
      targetEntityId: id("e", 4),
      targetFieldId: id("f", 31),
      cardinality: "1:N",
      label: "contains",
    },
    {
      id: id("r", 3),
      sourceEntityId: id("e", 2),
      sourceFieldId: id("f", 10),
      targetEntityId: id("e", 4),
      targetFieldId: id("f", 32),
      cardinality: "1:N",
      label: "included in",
    },
  ],
};
