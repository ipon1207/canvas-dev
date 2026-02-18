import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	type Connection,
	type EdgeChange,
	type NodeChange,
} from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { temporal } from "zundo";
import { create } from "zustand";
import type { ProjectData } from "@/features/file-system/schema/project";
import type { AppEdge, AppNode, ProjectNodeData } from "../types/canvas";

// StateとActionの型定義
type CanvasState = {
	nodes: AppNode[];
	edges: AppEdge[];
	selectedNodeId: string | null;
	currentPath: string | null;
	clipboardNodes: AppNode[];
	selectedEdgeId: string | null;

	// Actions
	onNodesChange: (changes: NodeChange[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
	onConnect: (connection: Connection) => void;
	setNodes: (nodes: AppNode[]) => void;
	setCurrentPath: (path: string | null) => void;
	addNode: () => void;
	selectNode: (id: string | null) => void;
	updateNodeData: (id: string, data: Partial<ProjectNodeData>) => void;
	loadProject: (data: ProjectData) => void;
	getProjectData: () => ProjectData;
	copySelection: () => void;
	pasteFromClipboard: () => void;
	addImageNode: (position: { x: number; y: number }, path: string) => void;
	selectEdge: (id: string | null) => void;
	updateEdge: (id: string, data: Partial<AppEdge>) => void;
};

export const useCanvasStore = create<CanvasState>()(
	temporal(
		(set, get) => ({
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
			selectedNodeId: null,
			currentPath: null,
			clipboardNodes: [],
			selectedEdgeId: null,
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

			// 現在のファイルパスをセットする
			setCurrentPath: (path) => set({ currentPath: path }),

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

			// 選択状態をセットする
			selectNode: (id) => set({ selectedNodeId: id }),

			// 指定したIDのノードデータ（label, status等）だけを部分更新する
			updateNodeData: (id, data) => {
				set({
					nodes: get().nodes.map((node) =>
						node.id === id
							? { ...node, data: { ...node.data, ...data } }
							: node,
					),
				});
			},

			// データを丸ごと読み込む
			loadProject: (data) => {
				set({
					nodes: data.nodes,
					edges: data.edges,
				});

				// ロード直後に履歴をクリアする
				useCanvasStore.temporal.getState().clear();
			},

			// 保存用に現在のデータをまとめる
			getProjectData: () => ({
				version: "1.0.0",
				timestamp: Date.now(),
				nodes: get().nodes,
				edges: get().edges,
			}),

			// コピー機能
			copySelection: () => {
				const selected = get().nodes.filter((n) => n.selected);
				if (selected.length > 0) {
					set({ clipboardNodes: selected });
					console.log("Copied nodes:", selected.length);
				}
			},

			// ペースト機能
			pasteFromClipboard: () => {
				const { clipboardNodes, nodes } = get();
				if (clipboardNodes.length === 0) return;

				// IDを新しくして位置をずらす
				const newNodes = clipboardNodes.map((node) => ({
					...node,
					id: uuidv4(),
					position: {
						x: node.position.x + 50,
						y: node.position.y + 50,
					},
					selected: true,
				}));

				// 元の選択を解除
				const deserializedNodes = nodes.map((n) => ({ ...n, selected: false }));

				set({ nodes: [...deserializedNodes, ...newNodes] });
			},

			// 画像ノード追加アクション
			addImageNode: (position, path) => {
				const newNode: AppNode = {
					id: uuidv4(),
					type: "image-node",
					position,
					data: {
						label: "Image",
						link: path,
					},
					style: { width: 200, height: 150 },
				};
				// 既存のノード配列に追加
				set({ nodes: [...get().nodes, newNode] });
			},

			// エッジ選択（ノード選択は解除）
			selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

			// エッジ更新
			updateEdge: (id, changes) => {
				set({
					edges: get().edges.map((edge) =>
						edge.id === id ? { ...edge, ...changes } : edge,
					),
				});
			},
		}),
		{
			partialize: (state) => ({
				nodes: state.nodes,
				edges: state.edges,
			}),
		},
	),
);
