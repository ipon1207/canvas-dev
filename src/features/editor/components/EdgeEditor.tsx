import { MarkerType } from "@xyflow/react";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useCanvasStore } from "@/features/canvas/stores/useCanvasStore";

export function EdgeEditor() {
	const { edges, selectedEdgeId, selectEdge, updateEdge } = useCanvasStore();

	const selectedEdge = edges.find((e) => e.id === selectedEdgeId);
	const isOpen = !!selectedEdgeId;

	const handleClose = (open: boolean) => {
		if (!open) selectEdge(null);
	};

	if (!selectedEdge) return null;

	// 矢印がついているか判定
	const hasArrow = !!selectedEdge.markerEnd;

	const toggleArrow = (checked: boolean) => {
		updateEdge(selectedEdge.id, {
			markerEnd: checked ? { type: MarkerType.ArrowClosed } : undefined,
		});
	};

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className="w-100" side="right">
				<SheetHeader>
					<SheetTitle>Edit Edge</SheetTitle>
					<SheetDescription>Connection settings</SheetDescription>
				</SheetHeader>

				<div className="grid gap-6 py-4">
					<div className="flex items-center justify-between space-x-2">
						<Label htmlFor="arrow-mode">End Arrow</Label>
						<Switch
							id="arrow-mode"
							checked={hasArrow}
							onCheckedChange={toggleArrow}
						/>
					</div>

					{/* ここに他のエッジ設定項目を追加していく */}
				</div>
			</SheetContent>
		</Sheet>
	);
}
