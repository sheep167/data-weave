import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type OnNodesChange,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";
import { observer } from "mobx-react-lite";
import { reaction } from "mobx";
import { useTranslation } from "react-i18next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/stores";
import { uiStore, schemaStore, reviewStore } from "@/stores";
import { EntityNode } from "./EntityNode";
import { CanvasControls } from "./CanvasControls";
import type { Entity, Relationship } from "@data-weave/shared";

const nodeTypes = { entity: EntityNode };

function toNodes(entities: Entity[]): Node[] {
  return entities.map((e) => ({
    id: e.id,
    type: "entity",
    position: e.position,
    data: e as unknown as Record<string, unknown>,
  }));
}

function toEdges(relationships: Relationship[]): Edge[] {
  return relationships.map((r) => ({
    id: r.id,
    source: r.sourceEntityId,
    target: r.targetEntityId,
    sourceHandle: r.sourceFieldId,
    targetHandle: r.targetFieldId,
    label: `${r.cardinality}${r.label ? ` (${r.label})` : ""}`,
    animated: true,
    style: { stroke: "#6366f1" },
    labelStyle: { fill: "#a1a1aa", fontSize: 11 },
  }));
}

export const SchemaCanvas = () => (
  <ReactFlowProvider>
    <SchemaCanvasInner />
  </ReactFlowProvider>
);

function CompareModeBanner() {
  const { t } = useTranslation();
  const { review } = useStore();
  return (
    <Panel
      position="top-center"
      className="flex items-center gap-3 rounded-lg border border-indigo-500/40 bg-indigo-950/80 px-4 py-2 backdrop-blur-sm shadow-lg"
    >
      <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
      <span className="text-xs text-indigo-300 font-medium">
        {t("review.viewing")}
      </span>
      <div className="flex items-center gap-1 ml-2 rounded-md border border-indigo-500/30 overflow-hidden">
        <button
          onClick={() => review.setCompareMode("before")}
          className="px-2.5 py-1 text-[10px] font-medium bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/60 transition-colors"
        >
          {t("review.before")}
        </button>
        <button
          onClick={() => review.setCompareMode("after")}
          className="px-2.5 py-1 text-[10px] font-medium bg-indigo-500/30 text-indigo-200 border-l border-indigo-500/30"
        >
          {t("review.after")} ✓
        </button>
      </div>
    </Panel>
  );
}

const SchemaCanvasInner = observer(() => {
  const { schema, ui, review } = useStore();
  const { setCenter, getNodes } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    toNodes(schema.schema.entities),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toEdges(schema.schema.relationships),
  );

  // Sync schema store → React Flow nodes/edges (respects compare mode)
  useEffect(() => {
    const dispose = reaction(
      () => {
        const isAfter =
          reviewStore.compareMode === "after" && reviewStore.result !== null;
        const source = isAfter
          ? reviewStore.result!.proposedSchema
          : schema.schema;
        const originalEntityIds = new Set(
          schema.schema.entities.map((e) => e.id),
        );
        const originalFieldCounts = new Map(
          schema.schema.entities.map((e) => [e.id, e.fields.length]),
        );
        return {
          entities: source.entities.map((e) => ({
            ...e,
            fields: [...e.fields],
          })),
          relationships: [...source.relationships],
          _tick: schema.schema.updatedAt,
          _compareMode: reviewStore.compareMode,
          _isAfter: isAfter,
          _originalEntityIds: originalEntityIds,
          _originalFieldCounts: originalFieldCounts,
        };
      },
      ({
        entities,
        relationships,
        _isAfter,
        _originalEntityIds,
        _originalFieldCounts,
      }) => {
        setNodes((currentNodes) => {
          const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));
          return entities.map((e) => {
            const existing = nodeMap.get(e.id);
            // Determine diff status for visual highlighting
            let _diff: "new" | "modified" | "unchanged" = "unchanged";
            if (_isAfter) {
              if (!_originalEntityIds.has(e.id)) {
                _diff = "new";
              } else if (
                (_originalFieldCounts.get(e.id) ?? 0) !== e.fields.length
              ) {
                _diff = "modified";
              }
            }
            return {
              id: e.id,
              type: "entity" as const,
              position: existing?.position ?? e.position,
              selected: existing?.selected ?? false,
              data: {
                ...(e as unknown as Record<string, unknown>),
                _diff,
              },
            };
          });
        });
        setEdges(toEdges(relationships));
      },
      { fireImmediately: true },
    );
    return dispose;
  }, [schema, setNodes, setEdges]);

  // Sync selection from store → canvas (highlight + center)
  useEffect(() => {
    const dispose = reaction(
      () => uiStore.selectedEntityId,
      (selectedId) => {
        setNodes((nds) =>
          nds.map((n) => ({ ...n, selected: n.id === selectedId })),
        );
        if (selectedId) {
          const node = getNodes().find((n) => n.id === selectedId);
          if (node) {
            const x = node.position.x + (node.measured?.width ?? 220) / 2;
            const y = node.position.y + (node.measured?.height ?? 150) / 2;
            setCenter(x, y, { zoom: 1, duration: 400 });
          }
        }
      },
    );
    return dispose;
  }, [setNodes, setCenter, getNodes]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      for (const c of changes) {
        if (c.type === "position" && c.position) {
          schema.updateEntityPosition(c.id, c.position);
        }
      }
    },
    [onNodesChange, schema],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      ui.selectEntity(node.id);
    },
    [ui],
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      ui.openEditEntity(node.id);
    },
    [ui],
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      ui.openDrawer({ type: "edit-relationship", relationshipId: edge.id });
    },
    [ui],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      schema.addRelationship({
        sourceEntityId: connection.source,
        sourceFieldId: connection.sourceHandle ?? "",
        targetEntityId: connection.target,
        targetFieldId: connection.targetHandle ?? "",
        cardinality: "1:N",
        label: undefined,
      });
    },
    [schema],
  );

  const isCompareAfter =
    review.compareMode === "after" && review.result !== null;

  return (
    <TooltipProvider delayDuration={300}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!ui.canvasLocked && !isCompareAfter}
        nodesConnectable={!ui.canvasLocked && !isCompareAfter}
        elementsSelectable={!ui.canvasLocked}
        fitView
        fitViewOptions={{ maxZoom: 0.7, padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        className={
          isCompareAfter
            ? "bg-zinc-950 ring-2 ring-inset ring-indigo-500/30"
            : "bg-zinc-950"
        }
      >
        {ui.showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={isCompareAfter ? "#312e81" : "#27272a"}
          />
        )}
        {isCompareAfter && <CompareModeBanner />}
        <CanvasControls />
        <MiniMap
          nodeColor="#3f3f46"
          maskColor="rgba(0,0,0,0.7)"
          className="rounded-lg border border-zinc-800 bg-zinc-900/90 backdrop-blur-sm [&>svg]:rounded-lg"
        />
      </ReactFlow>
    </TooltipProvider>
  );
});
