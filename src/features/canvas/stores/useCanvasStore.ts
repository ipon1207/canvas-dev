import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	type Connection,
	type EdgeChange,
	type NodeChange,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import type { AppEdge, AppNode } from "../types/canvas";

// StateとActionの型定義
type CanvasState = {
	nodes: AppNode[];
	edges: AppEdge[];

	// Actions
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	onConnect: (connection: Connection) => void;
	setNodes: (nodes: AppNode[]) => void;
	addNode: () => void;
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
	nodes: [
		// 初期データのサンプル
		{
			id: "1",
			position: { x: 100, y: 100 },
			data: {
				label: "Start Learning",
				description: "Setup Environment",
				status: "inprogress",
			},
			type: "app-node",
		},
	],
	edges: [],

	// ノードがドラッグ等で変更されたときに呼ばれる
	onNodesChange: (changes) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes) as AppNode[],
		});
	},

	// エッジが変更されたときに呼ばれる
	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges) as AppEdge[],
		});
	},

	// 線が接続されたときに呼ばれる
	onConnect: (connection) => {
		set({
			edges: addEdge(connection, get().edges) as AppEdge[],
		});
	},

	// データを丸ごとセットする場合（ロード機能用）
	setNodes: (nodes) => set({ nodes }),

	// 新しいノードを追加する
	addNode: () => {
		const newNode: AppNode = {
			id: uuidv4(), // ユニークIDを生成
			type: "app-node", // カスタムノードを指定
			position: {
				x: Math.random() * 400,
				y: Math.random() * 400,
			},
			data: {
				label: "New Task",
				status: "todo",
				description: "Click to edit details ...",
			},
		};

		set({ nodes: [...get().nodes, newNode] });
	},
}));
