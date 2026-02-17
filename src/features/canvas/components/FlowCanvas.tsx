import {
	Background,
	BackgroundVariant,
	Controls,
	ReactFlow,
} from "@xyflow/react";
import { useCanvasStore } from "../stores/useCanvasStore";
import { AppNodeComponent } from "./nodes/AppNodes";

const nodeTypes = {
	"app-node": AppNodeComponent,
};

export function FlowCanvas() {
	// Storev から必要なデータと関数を取り出す
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
		useCanvasStore();

	return (
		<div style={{ width: "100%", height: "100%" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				fitView
			>
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
				<Controls />
			</ReactFlow>
		</div>
	);
}
