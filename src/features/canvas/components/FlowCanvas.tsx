import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import {
	Background,
	BackgroundVariant,
	Controls,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { NodeEditor } from "@/features/editor/components/NodeEditor";
import { useCanvasStore } from "../stores/useCanvasStore";
import type { AppNode } from "../types/canvas";
import { CanvasToolbar } from "./CanvasToolbar";
import { AppNodeComponent } from "./nodes/AppNodes";
import { ImageNode } from "./nodes/ImageNode";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg"];

const nodeTypes = {
	"app-node": AppNodeComponent,
	"image-node": ImageNode,
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
	const { nodes, edges, onNodesChange, onEdgesChange, onConnect, selectNode } =
		useCanvasStore();

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

					const newNode: AppNode = {
						id: uuidv4(),
						type: "image-node",
						position: flowPosition,
						data: {
							label: "Image",
							link: filePath,
						},
						style: { width: 200, height: 150 },
					};

					useCanvasStore.setState((state) => ({
						nodes: [...state.nodes, newNode],
					}));
				}
			}
		});

		return () => {
			unlisten.then((fn) => fn());
		};
	}, [screenToFlowPosition]);

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
				deleteKeyCode={["Backspace", "Delete"]}
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
