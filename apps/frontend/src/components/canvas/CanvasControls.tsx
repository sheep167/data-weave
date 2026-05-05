import { useReactFlow, Panel } from "@xyflow/react";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Lock,
  Unlock,
  Grid3X3,
  Plus,
  Link2,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function ToolbarButton({ icon, label, onClick, active }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={active ? "text-indigo-400 bg-zinc-800" : "text-zinc-400"}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export const CanvasControls = observer(() => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { ui } = useStore();
  const { t } = useTranslation();

  return (
    <Panel
      position="bottom-left"
      className="flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1 backdrop-blur-sm shadow-lg"
    >
      <ToolbarButton
        icon={<ZoomIn className="h-4 w-4" />}
        label={t("canvas.zoomIn")}
        onClick={() => zoomIn()}
      />
      <ToolbarButton
        icon={<ZoomOut className="h-4 w-4" />}
        label={t("canvas.zoomOut")}
        onClick={() => zoomOut()}
      />
      <ToolbarButton
        icon={<Maximize className="h-4 w-4" />}
        label={t("canvas.fitView")}
        onClick={() => fitView({ padding: 0.2 })}
      />
      <div className="h-px bg-zinc-800 my-0.5" />
      <ToolbarButton
        icon={
          ui.canvasLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )
        }
        label={
          ui.canvasLocked ? t("canvas.lockCanvas") : t("canvas.unlockCanvas")
        }
        onClick={() => ui.toggleCanvasLock()}
        active={ui.canvasLocked}
      />
      <ToolbarButton
        icon={<Grid3X3 className="h-4 w-4" />}
        label={t("canvas.toggleGrid")}
        onClick={() => ui.toggleGrid()}
        active={ui.showGrid}
      />
      <div className="h-px bg-zinc-800 my-0.5" />
      <ToolbarButton
        icon={<Plus className="h-4 w-4" />}
        label={t("canvas.newTable")}
        onClick={() => ui.openNewEntity()}
      />
      <ToolbarButton
        icon={<Link2 className="h-4 w-4" />}
        label={t("canvas.newRelationship")}
        onClick={() => ui.openNewRelationship()}
      />
    </Panel>
  );
});
