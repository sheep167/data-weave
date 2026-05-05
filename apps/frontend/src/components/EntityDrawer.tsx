import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
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
import { Plus, Trash2, Save, Key, Link, Snowflake, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  SqlType,
  Cardinality,
  FieldConstraints,
} from "@data-weave/shared";

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

// ─── Constraint Toggles ─────────────────────────────────────────────

const CONSTRAINT_BUTTONS = [
  {
    key: "primaryKey" as const,
    label: "PK",
    icon: Key,
    color: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
    titleKey: "constraints.primaryKey",
  },
  {
    key: "foreignKey" as const,
    label: "FK",
    icon: Link,
    color: "text-blue-400 border-blue-400/50 bg-blue-400/10",
    titleKey: "constraints.foreignKey",
  },
  {
    key: "unique" as const,
    label: "UQ",
    icon: Snowflake,
    color: "text-cyan-400 border-cyan-400/50 bg-cyan-400/10",
    titleKey: "constraints.unique",
  },
  {
    key: "indexed" as const,
    label: "IDX",
    icon: Zap,
    color: "text-green-400 border-green-400/50 bg-green-400/10",
    titleKey: "constraints.indexed",
  },
  {
    key: "nullable" as const,
    label: "NULL",
    icon: null,
    color: "text-zinc-400 border-zinc-500/50 bg-zinc-500/10",
    titleKey: "constraints.nullable",
  },
] as const;

function ConstraintToggles({
  entityId,
  fieldId,
  constraints,
}: {
  entityId: string;
  fieldId: string;
  constraints: FieldConstraints;
}) {
  const { schema } = useStore();
  const { t } = useTranslation();

  const toggle = (key: keyof FieldConstraints) => {
    schema.updateField(entityId, fieldId, {
      constraints: { ...constraints, [key]: !constraints[key] },
    });
  };

  return (
    <div className="flex items-center gap-1 pl-1">
      {CONSTRAINT_BUTTONS.map(({ key, label, icon: Icon, color, titleKey }) => {
        const active = !!constraints[key];
        return (
          <button
            key={key}
            type="button"
            title={t(titleKey)}
            onClick={() => toggle(key)}
            className={cn(
              "px-1.5 py-0.5 text-[9px] font-semibold rounded border transition-all",
              active
                ? color
                : "text-zinc-600 border-zinc-800 bg-transparent hover:border-zinc-600 hover:text-zinc-400",
            )}
          >
            {Icon ? (
              <span className="flex items-center gap-0.5">
                <Icon className="h-2.5 w-2.5" />
                {label}
              </span>
            ) : (
              label
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Edit Entity ────────────────────────────────────────────────────

const EditEntityPanel = observer(() => {
  const { schema, ui } = useStore();
  const { t } = useTranslation();
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
        <SheetTitle>{t("drawer.editTable")}</SheetTitle>
        <SheetDescription>{t("drawer.editTableDesc")}</SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1 px-5 py-4">
        {/* Table Name */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="entity-name">{t("drawer.tableName")}</Label>
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
            <Label>{t("drawer.columns")}</Label>
            <span className="text-[10px] text-zinc-500">
              {t("drawer.total", { count: entity.fields.length })}
            </span>
          </div>

          {entity.fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <div className="flex items-center gap-2">
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
              {/* Constraint toggles */}
              <ConstraintToggles
                entityId={entity.id}
                fieldId={field.id}
                constraints={field.constraints}
              />
            </div>
          ))}
        </div>

        {/* Add New Field */}
        <div className="space-y-2 mb-6">
          <Label>{t("drawer.addColumn")}</Label>
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
          {t("drawer.saveAndClose")}
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
  const { t } = useTranslation();
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
        {t("drawer.deleteTable")}
      </Button>
      <ConfirmDeleteDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={t("drawer.deleteTableConfirmTitle", { name: entityName })}
        description={t("drawer.deleteTableConfirmDesc")}
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
  const { t } = useTranslation();
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
        <SheetTitle>{t("drawer.newTable")}</SheetTitle>
        <SheetDescription>{t("drawer.newTableDesc")}</SheetDescription>
      </SheetHeader>
      <div className="px-5 py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-entity-name">{t("drawer.tableName")}</Label>
          <Input
            id="new-entity-name"
            placeholder={t("drawer.newTablePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <p className="text-[11px] text-zinc-500">{t("drawer.newTableHint")}</p>
        <Button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full"
        >
          {t("drawer.createTable")}
        </Button>
      </div>
    </>
  );
});

// ─── New Relationship ───────────────────────────────────────────────

const NewRelationshipPanel = observer(() => {
  const { schema, ui } = useStore();
  const { t } = useTranslation();
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
        <SheetTitle>{t("drawer.newRelationship")}</SheetTitle>
        <SheetDescription>{t("drawer.newRelationshipDesc")}</SheetDescription>
      </SheetHeader>
      <div className="px-5 py-4 space-y-4">
        <div className="space-y-2">
          <Label>{t("drawer.sourceTable")}</Label>
          <Select value={sourceEntityId} onValueChange={setSourceEntityId}>
            <SelectTrigger>
              <SelectValue placeholder={t("drawer.selectTable")} />
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
          <Label>{t("drawer.cardinality")}</Label>
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
          <Label>{t("drawer.targetTable")}</Label>
          <Select value={targetEntityId} onValueChange={setTargetEntityId}>
            <SelectTrigger>
              <SelectValue placeholder={t("drawer.selectTable")} />
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
          <Label>{t("drawer.labelOptional")}</Label>
          <Input
            placeholder={t("drawer.labelPlaceholder")}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <Button
          onClick={handleCreate}
          disabled={!sourceEntityId || !targetEntityId}
          className="w-full"
        >
          {t("drawer.createRelationship")}
        </Button>
      </div>
    </>
  );
});

// ─── Edit Relationship ──────────────────────────────────────────────

const EditRelationshipPanel = observer(() => {
  const { schema, ui } = useStore();
  const { t } = useTranslation();
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
        <SheetTitle>{t("drawer.editRelationship")}</SheetTitle>
        <SheetDescription>
          {sourceName} → {targetName}
        </SheetDescription>
      </SheetHeader>
      <div className="px-5 py-4 space-y-4 flex-1">
        <div className="space-y-2">
          <Label>{t("drawer.sourceTable")}</Label>
          <Input value={sourceName} disabled className="text-xs" />
        </div>

        <div className="space-y-2">
          <Label>{t("drawer.targetTable")}</Label>
          <Input value={targetName} disabled className="text-xs" />
        </div>

        <div className="space-y-2">
          <Label>{t("drawer.cardinality")}</Label>
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
          <Label>{t("drawer.labelOptional")}</Label>
          <Input
            value={rel.label ?? ""}
            onChange={(e) =>
              schema.updateRelationship(rel.id, {
                label: e.target.value || undefined,
              })
            }
            placeholder={t("drawer.labelPlaceholder")}
          />
        </div>

        <Separator />
      </div>

      <div className="px-5 py-3 border-t border-zinc-800 space-y-2">
        <Button className="w-full" onClick={() => ui.closeDrawer()}>
          <Save className="h-3.5 w-3.5 mr-1" />
          {t("drawer.saveAndClose")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          {t("drawer.deleteRelationship")}
        </Button>
        <ConfirmDeleteDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title={t("drawer.deleteRelConfirmTitle")}
          description={t("drawer.deleteRelConfirmDesc", {
            cardinality: rel.cardinality,
            source: sourceName,
            target: targetName,
          })}
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

  const {
    drawer: { type },
  } = ui;

  const renderDrawer = () => {
    switch (type) {
      case "edit-entity":
        return <EditEntityPanel />;
      case "edit-relationship":
        return <EditRelationshipPanel />;
      case "new-entity":
        return <NewEntityPanel />;
      case "new-relationship":
        return <NewRelationshipPanel />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && ui.closeDrawer()}>
      <SheetContent className="flex flex-col">{renderDrawer()}</SheetContent>
    </Sheet>
  );
});
