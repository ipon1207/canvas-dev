import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
	Background,
	BackgroundVariant,
	Controls,
	MiniMap,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useEffect } from "react";
import { EdgeEditor } from "@/features/editor/components/EdgeEditor";
import { NodeEditor } from "@/features/editor/components/NodeEditor";
import { useCanvasStore } from "../stores/useCanvasStore";
import { CanvasToolbar } from "./CanvasToolbar";
import { AppNodeComponent } from "./nodes/AppNodes";
import { ImageNode } from "./nodes/ImageNode";
import { MarkdownNode } from "./nodes/MarkdownNode";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg"];

const nodeTypes = {
	"app-node": AppNodeComponent,
	"image-node": ImageNode,
	"markdown-node": MarkdownNode,
};

export function FlowCanvas() {
	return (
		<ReactFlowProvider>
			<FlowCanvasInner />
		</ReactFlowProvider>
	);
}

function FlowCanvasInner() {
	// Store から必要なデータと関数を取り出す
	const {
		nodes,
		edges,
		onNodesChange,
		onEdgesChange,
		onConnect,
		selectNode,
		addImageNode,
		selectEdge,
	} = useCanvasStore();

	// 座標変換のためにインスタンスを取得
	const { screenToFlowPosition } = useReactFlow();

	// Tauri v2 のドラッグ＆ドロップイベントを使用
	useEffect(() => {
		const appWindow = getCurrentWebviewWindow();
		const unlisten = appWindow.onDragDropEvent((event) => {
			if (event.payload.type === "drop") {
				const { paths, position } = event.payload;
				if (paths.length === 0) return;

				const filePath = paths[0];
				const ext = filePath.split(".").pop()?.toLowerCase();

				if (ext && IMAGE_EXTENSIONS.includes(ext)) {
					const flowPosition = screenToFlowPosition({
						x: position.x,
						y: position.y,
					});

					addImageNode(flowPosition, filePath);
				}
			}
		});

		return () => {
			unlisten.then((fn) => fn());
		};
	}, [screenToFlowPosition, addImageNode]);

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
				onPaneClick={() => {
					selectNode(null);
					selectEdge(null);
				}}
				deleteKeyCode={["Backspace", "Delete"]}
				onEdgeClick={(_, edge) => selectEdge(edge.id)}
				fitView
			>
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
				<MiniMap
					nodeColor={(n) => {
						if (n.type === "image-node") return "#3b82f6";
						return "#e2e8f0";
					}}
					position="bottom-left"
					className="bg-white! dark:bg-zinc-900! dark:border-zinc-800"
				/>
				<Controls />
				<CanvasToolbar />
			</ReactFlow>
			<NodeEditor />
			<EdgeEditor />
		</div>
	);
}
