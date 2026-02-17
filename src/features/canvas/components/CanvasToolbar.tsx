import { Panel } from "@xyflow/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "../stores/useCanvasStore";

export function CanvasToolbar() {
	const { addNode } = useCanvasStore();

	return (
		<Panel position="top-right" className="m-4">
			<Button
				onClick={addNode}
				className="shadow-lg hover:scale-105 transition-transform"
			>
				<Plus className="mr-2 h-4 w-4" />
				Add Node
			</Button>
		</Panel>
	);
}
