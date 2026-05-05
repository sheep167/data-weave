import { SchemaStore } from "./SchemaStore";
import { UIStore } from "./UIStore";
import { SchemaReviewStore } from "./SchemaReviewStore";

export const schemaStore = new SchemaStore();
export const uiStore = new UIStore();
export const reviewStore = new SchemaReviewStore();

export const useStore = () => ({
  schema: schemaStore,
  ui: uiStore,
  review: reviewStore,
});
