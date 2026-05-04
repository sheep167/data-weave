import { SchemaStore } from "./SchemaStore";
import { UIStore } from "./UIStore";

export const schemaStore = new SchemaStore();
export const uiStore = new UIStore();

export const useStore = () => ({ schema: schemaStore, ui: uiStore });
