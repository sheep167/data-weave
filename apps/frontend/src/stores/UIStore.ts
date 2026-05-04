import { makeAutoObservable } from "mobx";

export type DrawerMode =
  | { type: "closed" }
  | { type: "edit-entity"; entityId: string }
  | { type: "new-entity" }
  | { type: "edit-relationship"; relationshipId: string }
  | { type: "new-relationship" };

export class UIStore {
  sidebarTab: "entities" | "whatif" | "data" | "export" = "entities";
  selectedEntityId: string | null = null;
  canvasLocked = false;
  showGrid = true;
  drawer: DrawerMode = { type: "closed" };

  constructor() {
    makeAutoObservable(this);
  }

  setSidebarTab(tab: UIStore["sidebarTab"]) {
    this.sidebarTab = tab;
  }

  selectEntity(id: string | null) {
    this.selectedEntityId = id;
  }

  toggleCanvasLock() {
    this.canvasLocked = !this.canvasLocked;
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
  }

  openDrawer(mode: DrawerMode) {
    this.drawer = mode;
  }

  closeDrawer() {
    this.drawer = { type: "closed" };
  }

  openEditEntity(entityId: string) {
    this.selectedEntityId = entityId;
    this.drawer = { type: "edit-entity", entityId };
  }

  openNewEntity() {
    this.drawer = { type: "new-entity" };
  }

  openNewRelationship() {
    this.drawer = { type: "new-relationship" };
  }
}
