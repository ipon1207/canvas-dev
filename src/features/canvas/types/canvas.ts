import type { Edge, Node } from "@xyflow/react";

// アプリケーション固有のノードデータ型
export type ProjectNodeData = {
	label: string;
	status?: "todo" | "inprogress" | "done";
	description?: string;
	link?: string;
};

// React Flow のNode型を拡張（現時点ではジェネリック型として運用）
export type AppNode = Node<ProjectNodeData>;
export type AppEdge = Edge;
