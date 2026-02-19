import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	type Connection,
	type EdgeChange,
	type NodeChange,
} from "@xyflow/react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { temporal } from "zundo";
import { create } from "zustand";
import type { ProjectData } from "@/features/file-system/schema/project";
import type { AppEdge, AppNode, ProjectNodeData } from "../types/canvas";

// 親ノードが子ノードより前に来るようにソートする
function sortNodesParentFirst(nodes: AppNode[]): AppNode[] {
	const sorted: AppNode[] = [];
	const remaining = [...nodes];
	const addedIds = new Set<string>();

	// まず親を持たないノードを追加
	for (const node of remaining) {
		if (!node.parentId) {
			sorted.push(node);
			addedIds.add(node.id);
		}
	}

	// 残りのノードを親が追加済みになるまで繰り返し追加
	let prevLength = -1;
	while (sorted.length < nodes.length && sorted.length !== prevLength) {
		prevLength = sorted.length;
		for (const node of remaining) {
			if (
				!addedIds.has(node.id) &&
				node.parentId &&
				addedIds.has(node.parentId)
			) {
				sorted.push(node);
				addedIds.add(node.id);
			}
		}
	}

	// 循環参照などにより追加されなかったノード拾い上げる
	if (sorted.length < nodes.length) {
		console.error(
			"Circular reference or missing parent detected during node sorting. Remaining nodes will be appended",
		);
		for (const node of remaining) {
			if (!addedIds.has(node.id)) {
				// 親子関係を維持したまま強制的に末尾に追加
				sorted.push(node);
			}
		}
	}

	return sorted;
}

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
	updateNodeParent: (id: string, parentId: string | undefined) => void;
	loadProject: (data: ProjectData) => void;
	getProjectData: () => ProjectData;
	copySelection: () => void;
	pasteFromClipboard: () => void;
	addImageNode: (position: { x: number; y: number }, path: string) => void;
	selectEdge: (id: string | null) => void;
	updateEdge: (id: string, data: Partial<AppEdge>) => void;
	addMarkdownNode: () => void;
	addGroupNode: () => void;
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
			selectNode: (id) =>
				set({
					selectedNodeId: id,
					nodes: get().nodes.map((node) => ({
						...node,
						selected: node.id === id,
					})),
				}),

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

			// ノードの親（グループ）を変更する
			updateNodeParent: (id, newParentId) => {
				const { nodes } = get();

				// 循環参照のチェック（親チェーンを辿って自分自身に到達しないか確認）
				if (newParentId) {
					let currentId: string | undefined = newParentId;
					while (currentId) {
						if (currentId === id) {
							console.error(
								`Circular reference detected: Cannot set ${newParentId} as parent of ${id}`,
							);
							toast.error("Cannot create circular group reference");
							return;
						}
						const currentNode = nodes.find((n) => n.id === currentId);
						currentId = currentNode?.parentId;
					}
				}

				const targetNode = nodes.find((n) => n.id === id);
				if (!targetNode) return;

				const oldParentId = targetNode.parentId;

				// 位置の変換: 絶対座標 <-> 親からの相対座標
				let newPosition = { ...targetNode.position };

				if (oldParentId && !newParentId) {
					// グループから外す: 相対座標 → 絶対座標
					const oldParent = nodes.find((n) => n.id === oldParentId);
					if (oldParent) {
						newPosition = {
							x: targetNode.position.x + oldParent.position.x,
							y: targetNode.position.y + oldParent.position.y,
						};
					}
				} else if (!oldParentId && newParentId) {
					// グループに入れる: 絶対座標 → 相対座標
					const newParent = nodes.find((n) => n.id === newParentId);
					if (newParent) {
						newPosition = {
							x: targetNode.position.x - newParent.position.x,
							y: targetNode.position.y - newParent.position.y,
						};
					}
				} else if (oldParentId && newParentId && oldParentId !== newParentId) {
					// グループ間の移動: 旧親の相対 → 絶対 → 新親の相対
					const oldParent = nodes.find((n) => n.id === oldParentId);
					const newParent = nodes.find((n) => n.id === newParentId);
					if (oldParent && newParent) {
						newPosition = {
							x:
								targetNode.position.x +
								oldParent.position.x -
								newParent.position.x,
							y:
								targetNode.position.y +
								oldParent.position.y -
								newParent.position.y,
						};
					}
				}

				// ノードを更新
				let updatedNodes = nodes.map((node) =>
					node.id === id
						? {
								...node,
								parentId: newParentId,
								extent: newParentId ? ("parent" as const) : undefined,
								position: newPosition,
							}
						: node,
				);

				// 親ノードが子ノードより前に来るようにソート
				updatedNodes = sortNodesParentFirst(updatedNodes);

				set({ nodes: updatedNodes });
			},

			// データを丸ごと読み込む
			loadProject: (data) => {
				set({
					nodes: sortNodesParentFirst(data.nodes as AppNode[]),
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
			selectEdge: (id) =>
				set({
					selectedEdgeId: id,
					selectedNodeId: null,
					edges: get().edges.map((edge) => ({
						...edge,
						selected: edge.id === id,
					})),
					nodes: get().nodes.map((node) => ({
						...node,
						selected: false,
					})),
				}),

			// エッジ更新
			updateEdge: (id, changes) => {
				set({
					edges: get().edges.map((edge) =>
						edge.id === id ? { ...edge, ...changes } : edge,
					),
				});
			},

			// Markdownノード追加
			addMarkdownNode: () => {
				const newNode: AppNode = {
					id: uuidv4(),
					type: "markdown-node",
					position: {
						x: Math.random() * 200 + 100,
						y: Math.random() * 200 + 100,
					},
					data: {
						label: "Markdown Note",
						description: "# Idea\n- Point1\n- Point 2",
					},
				};
				set({ nodes: [...get().nodes, newNode] });
			},

			// グループノード追加
			addGroupNode: () => {
				const newNode: AppNode = {
					id: uuidv4(),
					type: "group-node",
					position: { x: 50, y: 50 },
					data: { label: "New Group" },
					style: { width: 400, height: 300 },
					zIndex: -1, // 背景に配置
				};
				set({ nodes: [...get().nodes, newNode] });
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
