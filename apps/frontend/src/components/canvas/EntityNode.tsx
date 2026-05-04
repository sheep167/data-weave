import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { Entity, Field } from "@data-weave/shared";
import { cn } from "@/lib/utils";

const typeColor: Record<string, string> = {
  uuid: "text-violet-400",
  serial: "text-violet-400",
  text: "text-emerald-400",
  varchar: "text-emerald-400",
  int: "text-amber-400",
  bigint: "text-amber-400",
  float: "text-amber-400",
  decimal: "text-amber-400",
  boolean: "text-sky-400",
  date: "text-rose-400",
  timestamp: "text-rose-400",
  timestamptz: "text-rose-400",
  json: "text-orange-400",
  jsonb: "text-orange-400",
};

function FieldRow({ field }: { field: Field }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-zinc-800/60 transition-colors relative">
      <Handle
        type="target"
        position={Position.Left}
        id={field.id}
        className="!w-2 !h-2 !bg-indigo-500 !border-none !-left-1"
      />
      <span className="text-zinc-300 flex-1 truncate">
        {field.constraints.primaryKey && (
          <span className="text-yellow-400 mr-1 text-[10px]">🔑</span>
        )}
        {field.isPII && (
          <span className="text-red-400 mr-1 text-[10px]">⛔</span>
        )}
        {field.name}
      </span>
      <span
        className={cn(
          "font-mono text-[10px]",
          typeColor[field.type] ?? "text-zinc-500",
        )}
      >
        {field.type}
      </span>
      {!field.constraints.nullable &&
        field.constraints.nullable !== undefined && (
          <span className="text-rose-500 text-[9px] font-bold">NN</span>
        )}
      <Handle
        type="source"
        position={Position.Right}
        id={field.id}
        className="!w-2 !h-2 !bg-indigo-500 !border-none !-right-1"
      />
    </div>
  );
}

export const EntityNode = memo(({ data, selected }: NodeProps) => {
  const entity = data as unknown as Entity;
  return (
    <div
      className={cn(
        "min-w-[220px] rounded-lg border bg-zinc-900 shadow-xl shadow-black/20 overflow-hidden transition-all",
        selected
          ? "border-indigo-500 ring-2 ring-indigo-500/30"
          : "border-zinc-700/80 ring-1 ring-zinc-800/50",
      )}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-indigo-600/15 to-violet-600/10 border-b border-zinc-700/60 flex items-center justify-between">
        <span className="font-semibold text-sm text-indigo-300">
          {entity.name}
        </span>
        <span className="text-[10px] text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
          {entity.fields.length} cols
        </span>
      </div>
      {/* Fields */}
      <div className="divide-y divide-zinc-800/60">
        {entity.fields.map((f) => (
          <FieldRow key={f.id} field={f} />
        ))}
      </div>
    </div>
  );
});

EntityNode.displayName = "EntityNode";
