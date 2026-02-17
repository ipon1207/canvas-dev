import {
	Background,
	BackgroundVariant,
	Controls,
	ReactFlow,
} from "@xyflow/react";
import { NodeEditor } from "@/features/editor/components/NodeEditor";
import { useCanvasStore } from "../stores/useCanvasStore";
import { CanvasToolbar } from "./CanvasToolbar";
import { AppNodeComponent } from "./nodes/AppNodes";

const nodeTypes = {
	"app-node": AppNodeComponent,
};

export function FlowCanvas() {
	// Store から必要なデータと関数を取り出す
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } =
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
				onNodeClick={(_, node) => selectNode(node.id)}
				onPaneClick={() => selectNode(null)}
				fitView
			>
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
				<Controls />
				<CanvasToolbar />
			</ReactFlow>
			<NodeEditor />
		</div>
	);
}
