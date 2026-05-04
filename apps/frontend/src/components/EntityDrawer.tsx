import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfirmDeleteDialog } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Save } from "lucide-react";
import type { SqlType, Cardinality } from "@data-weave/shared";

const SQL_TYPES: SqlType[] = [
  "uuid",
  "serial",
  "text",
  "varchar",
  "int",
  "bigint",
  "float",
  "decimal",
  "boolean",
  "date",
  "timestamp",
  "timestamptz",
  "json",
  "jsonb",
];

const CARDINALITIES: Cardinality[] = ["1:1", "1:N", "N:M"];

// ─── Edit Entity ────────────────────────────────────────────────────

const EditEntityPanel = observer(() => {
  const { schema, ui } = useStore();
  if (ui.drawer.type !== "edit-entity") return null;
  const entityId = ui.drawer.entityId;

  const entity = schema.schema.entities.find((e) => e.id === entityId);
  if (!entity) return null;

  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<SqlType>("text");

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    schema.addField(entity.id, {
      name: newFieldName.trim(),
      type: newFieldType,
      constraints: {},
    });
    setNewFieldName("");
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit Table</SheetTitle>
        <SheetDescription>Modify table schema and columns</SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1 px-5 py-4">
        {/* Table Name */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="entity-name">Table Name</Label>
          <Input
            id="entity-name"
            value={entity.name}
            onChange={(e) => schema.renameEntity(entity.id, e.target.value)}
          />
        </div>

        <Separator className="mb-4" />

        {/* Existing Fields */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Label>Columns</Label>
            <span className="text-[10px] text-zinc-500">
              {entity.fields.length} total
            </span>
          </div>

          {entity.fields.map((field) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                value={field.name}
                onChange={(e) =>
                  schema.updateField(entity.id, field.id, {
                    name: e.target.value,
                  })
                }
                className="flex-1 h-8 text-xs"
              />
              <Select
                value={field.type}
                onValueChange={(val) =>
                  schema.updateField(entity.id, field.id, {
                    type: val as SqlType,
                  })
                }
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SQL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-red-400"
                onClick={() => schema.removeField(entity.id, field.id)}
                disabled={field.constraints.primaryKey}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Field */}
        <div className="space-y-2 mb-6">
          <Label>Add Column</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="column_name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddField()}
              className="flex-1 h-8 text-xs"
            />
            <Select
              value={newFieldType}
              onValueChange={(val) => setNewFieldType(val as SqlType)}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SQL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={handleAddField}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <Separator className="mb-4" />
      </ScrollArea>

      <div className="px-5 py-3 border-t border-zinc-800 space-y-2">
        <Button className="w-full" onClick={() => ui.closeDrawer()}>
          <Save className="h-3.5 w-3.5 mr-1" />
          Save &amp; Close
        </Button>
        <DeleteEntityButton entityId={entity.id} entityName={entity.name} />
      </div>
    </>
  );
});

// ─── Delete Confirmation ────────────────────────────────────────────

function DeleteEntityButton({
  entityId,
  entityName,
}: {
  entityId: string;
  entityName: string;
}) {
  const { schema, ui } = useStore();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        Delete Table
      </Button>
      <ConfirmDeleteDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Delete "${entityName}"?`}
        description="This will permanently remove the table and all its relationships. This action cannot be undone."
        onConfirm={() => {
          schema.removeEntity(entityId);
          ui.closeDrawer();
          ui.selectEntity(null);
        }}
      />
    </div>
  );
}

// ─── New Entity ─────────────────────────────────────────────────────

const NewEntityPanel = observer(() => {
  const { schema, ui } = useStore();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    const entity = schema.addEntity(name.trim(), {
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
    });
    ui.closeDrawer();
    ui.selectEntity(entity.id);
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>New Table</SheetTitle>
        <SheetDescription>Create a new entity in your schema</SheetDescription>
      </SheetHeader>
      <div className="px-5 py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-entity-name">Table Name</Label>
          <Input
            id="new-entity-name"
            placeholder="e.g. users, products, events"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <p className="text-[11px] text-zinc-500">
          A primary key column (id uuid) will be added automatically.
        </p>
        <Button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full"
        >
          Create Table
        </Button>
      </div>
    </>
  );
});

// ─── New Relationship ───────────────────────────────────────────────

const NewRelationshipPanel = observer(() => {
  const { schema, ui } = useStore();
  const [sourceEntityId, setSourceEntityId] = useState("");
  const [targetEntityId, setTargetEntityId] = useState("");
  const [cardinality, setCardinality] = useState<Cardinality>("1:N");
  const [label, setLabel] = useState("");

  const sourceEntity = schema.schema.entities.find(
    (e) => e.id === sourceEntityId,
  );
  const targetEntity = schema.schema.entities.find(
    (e) => e.id === targetEntityId,
  );

  // Auto-pick PK fields
  const sourcePK = sourceEntity?.fields.find((f) => f.constraints.primaryKey);
  const targetFK =
    targetEntity?.fields.find((f) => f.name.includes("_id")) ??
    targetEntity?.fields[0];

  const handleCreate = () => {
    if (!sourceEntityId || !targetEntityId || !sourcePK || !targetFK) return;
    schema.addRelationship({
      sourceEntityId,
      sourceFieldId: sourcePK.id,
      targetEntityId,
      targetFieldId: targetFK.id,
      cardinality,
      label: label || undefined,
    });
    ui.closeDrawer();
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>New Relationship</SheetTitle>
        <SheetDescription>
          Define a relationship between two tables
        </SheetDescription>
      </SheetHeader>
      <div className="px-5 py-4 space-y-4">
        <div className="space-y-2">
          <Label>Source Table</Label>
          <Select value={sourceEntityId} onValueChange={setSourceEntityId}>
            <SelectTrigger>
              <SelectValue placeholder="Select table..." />
            </SelectTrigger>
            <SelectContent>
              {schema.schema.entities.map((ent) => (
                <SelectItem key={ent.id} value={ent.id}>
                  {ent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cardinality</Label>
          <Select
            value={cardinality}
            onValueChange={(val) => setCardinality(val as Cardinality)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CARDINALITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Table</Label>
          <Select value={targetEntityId} onValueChange={setTargetEntityId}>
            <SelectTrigger>
              <SelectValue placeholder="Select table..." />
            </SelectTrigger>
            <SelectContent>
              {schema.schema.entities.map((ent) => (
                <SelectItem key={ent.id} value={ent.id}>
                  {ent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Label (optional)</Label>
          <Input
            placeholder="e.g. has many, belongs to"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreate}
          disabled={!sourceEntityId || !targetEntityId}
          className="w-full"
        >
          Create Relationship
        </Button>
      </div>
    </>
  );
});

// ─── Edit Relationship ──────────────────────────────────────────────

const EditRelationshipPanel = observer(() => {
  const { schema, ui } = useStore();
  if (ui.drawer.type !== "edit-relationship") return null;
  const relId = ui.drawer.relationshipId;

  const rel = schema.schema.relationships.find((r) => r.id === relId);
  if (!rel) return null;

  const sourceName =
    schema.schema.entities.find((e) => e.id === rel.sourceEntityId)?.name ??
    "?";
  const targetName =
    schema.schema.entities.find((e) => e.id === rel.targetEntityId)?.name ??
    "?";

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit Relationship</SheetTitle>
        <SheetDescription>
          {sourceName} → {targetName}
        </SheetDescription>
      </SheetHeader>
      <div className="px-5 py-4 space-y-4 flex-1">
        <div className="space-y-2">
          <Label>Source Table</Label>
          <Input value={sourceName} disabled className="text-xs" />
        </div>

        <div className="space-y-2">
          <Label>Target Table</Label>
          <Input value={targetName} disabled className="text-xs" />
        </div>

        <div className="space-y-2">
          <Label>Cardinality</Label>
          <Select
            value={rel.cardinality}
            onValueChange={(val) =>
              schema.updateRelationship(rel.id, {
                cardinality: val as Cardinality,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CARDINALITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Label (optional)</Label>
          <Input
            value={rel.label ?? ""}
            onChange={(e) =>
              schema.updateRelationship(rel.id, {
                label: e.target.value || undefined,
              })
            }
            placeholder="e.g. has many, belongs to"
          />
        </div>

        <Separator />
      </div>

      <div className="px-5 py-3 border-t border-zinc-800 space-y-2">
        <Button className="w-full" onClick={() => ui.closeDrawer()}>
          <Save className="h-3.5 w-3.5 mr-1" />
          Save &amp; Close
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete Relationship
        </Button>
        <ConfirmDeleteDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title="Delete this relationship?"
          description={`Remove the ${rel.cardinality} relationship between ${sourceName} and ${targetName}. This cannot be undone.`}
          onConfirm={() => {
            schema.removeRelationship(rel.id);
            ui.closeDrawer();
          }}
        />
      </div>
    </>
  );
});

// ─── Main Drawer ────────────────────────────────────────────────────

export const EntityDrawer = observer(() => {
  const { ui } = useStore();
  const isOpen = ui.drawer.type !== "closed";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && ui.closeDrawer()}>
      <SheetContent className="flex flex-col">
        {ui.drawer.type === "edit-entity" && <EditEntityPanel />}
        {ui.drawer.type === "edit-relationship" && <EditRelationshipPanel />}
        {ui.drawer.type === "new-entity" && <NewEntityPanel />}
        {ui.drawer.type === "new-relationship" && <NewRelationshipPanel />}
      </SheetContent>
    </Sheet>
  );
});
