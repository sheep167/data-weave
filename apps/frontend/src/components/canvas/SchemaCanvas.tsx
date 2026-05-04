import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/stores";
import { uiStore, schemaStore } from "@/stores";
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

const SchemaCanvasInner = observer(() => {
  const { schema, ui } = useStore();
  const { setCenter, getNodes } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    toNodes(schema.schema.entities),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toEdges(schema.schema.relationships),
  );

  // Sync schema store → React Flow nodes/edges
  useEffect(() => {
    const dispose = reaction(
      () => ({
        entities: schema.schema.entities.map((e) => ({
          ...e,
          fields: [...e.fields],
        })),
        relationships: [...schema.schema.relationships],
        _tick: schema.schema.updatedAt,
      }),
      ({ entities, relationships }) => {
        setNodes((currentNodes) => {
          const nodeMap = new Map(currentNodes.map((n) => [n.id, n]));
          return entities.map((e) => {
            const existing = nodeMap.get(e.id);
            return {
              id: e.id,
              type: "entity" as const,
              position: existing?.position ?? e.position,
              selected: existing?.selected ?? false,
              data: e as unknown as Record<string, unknown>,
            };
          });
        });
        setEdges(toEdges(relationships));
      },
      { fireImmediately: false },
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
        nodesDraggable={!ui.canvasLocked}
        nodesConnectable={!ui.canvasLocked}
        elementsSelectable={!ui.canvasLocked}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-950"
      >
        {ui.showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#27272a"
          />
        )}
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
