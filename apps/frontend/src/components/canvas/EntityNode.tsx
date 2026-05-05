import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-zinc-800/60 transition-colors relative">
            <Handle
                type="target"
                position={Position.Left}
                id={field.id}
                className="!w-2 !h-2 !bg-indigo-500 !border-none !-left-1"
            />
            {/* Constraint icons */}
            <span className="flex items-center gap-0.5 shrink-0">
                {field.constraints.primaryKey && (
                    <span
                        className="text-yellow-400 text-[10px]"
                        title={t("entityNode.primaryKey")}
                    >
                        🔑
                    </span>
                )}
                {field.constraints.foreignKey && (
                    <span className="text-blue-400 text-[10px]" title={t("entityNode.foreignKey")}>
                        🔗
                    </span>
                )}
                {field.constraints.unique && (
                    <span className="text-cyan-400 text-[10px]" title={t("entityNode.unique")}>
                        ◆
                    </span>
                )}
                {field.constraints.indexed && (
                    <span className="text-green-400 text-[10px]" title={t("entityNode.indexed")}>
                        ⚡
                    </span>
                )}
                {field.isPII && (
                    <span className="text-red-400 text-[10px]" title={t("entityNode.pii")}>
                        ⛔
                    </span>
                )}
            </span>
            <span className="text-zinc-300 flex-1 truncate">{field.name}</span>
            <span className={cn("font-mono text-[10px]", typeColor[field.type] ?? "text-zinc-500")}>
                {field.type}
            </span>
            {field.constraints.nullable === false && (
                <span
                    className="text-rose-500 text-[9px] font-bold"
                    title={t("entityNode.notNull")}
                >
                    NN
                </span>
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
    const entity = data as unknown as Entity & {
        _diff?: "new" | "modified" | "unchanged";
    };
    const { t } = useTranslation();
    const diff = entity._diff ?? "unchanged";

    return (
        <div
            className={cn(
                "min-w-[220px] rounded-lg border bg-zinc-900 shadow-xl shadow-black/20 overflow-hidden transition-all",
                selected
                    ? "border-indigo-500 ring-2 ring-indigo-500/30"
                    : diff === "new"
                      ? "border-emerald-500 ring-2 ring-emerald-500/30"
                      : diff === "modified"
                        ? "border-amber-500 ring-2 ring-amber-500/30"
                        : "border-zinc-700/80 ring-1 ring-zinc-800/50",
            )}
        >
            {/* Diff badge */}
            {diff !== "unchanged" && (
                <div
                    className={cn(
                        "px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-center",
                        diff === "new"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400",
                    )}
                >
                    {diff === "new" ? "NEW" : "MODIFIED"}
                </div>
            )}
            {/* Header */}
            <div
                className={cn(
                    "px-3 py-2 border-b border-zinc-700/60 flex items-center justify-between",
                    diff === "new"
                        ? "bg-gradient-to-r from-emerald-600/15 to-teal-600/10"
                        : diff === "modified"
                          ? "bg-gradient-to-r from-amber-600/15 to-orange-600/10"
                          : "bg-gradient-to-r from-indigo-600/15 to-violet-600/10",
                )}
            >
                <span
                    className={cn(
                        "font-semibold text-sm",
                        diff === "new"
                            ? "text-emerald-300"
                            : diff === "modified"
                              ? "text-amber-300"
                              : "text-indigo-300",
                    )}
                >
                    {entity.name}
                </span>
                <span className="text-[10px] text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                    {t("entityNode.cols", { count: entity.fields.length })}
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
