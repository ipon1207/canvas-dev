import { Position } from "@xyflow/react";
import dagre from "dagre";
import type { AppEdge, AppNode } from "../types/canvas";

// ノードのデフォルトサイズ（実測できない場合のフォールバック）
const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 150;

// ノード間のスペーシング
const NODE_SEP = 50; // 同ランク内のノード間隔
const RANK_SEP = 80; // ランク間の間隔

export const getLayoutedElements = (
	nodes: AppNode[],
	edges: AppEdge[],
	direction: "TB" | "LR", // TB: Top to Bottom, LR: Left to Right
) => {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	// レイアウトの基本設定（ノード間・ランク間のスペーシングを追加）
	dagreGraph.setGraph({
		rankdir: direction,
		nodesep: NODE_SEP,
		ranksep: RANK_SEP,
	});

	// ノードを登録（React Flow が実測したサイズがあればそれを使う）
	nodes.forEach((node) => {
		const width = node.measured?.width ?? DEFAULT_NODE_WIDTH;
		const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT;
		dagreGraph.setNode(node.id, { width, height });
	});

	// エッジを登録
	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	// 計算実行
	dagre.layout(dagreGraph);

	// 計算結果をノードの position に反映
	const layoutedNodes = nodes.map((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const width = node.measured?.width ?? DEFAULT_NODE_WIDTH;
		const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT;

		return {
			...node,
			position: {
				x: nodeWithPosition.x - width / 2,
				y: nodeWithPosition.y - height / 2,
			},
			targetPosition: direction === "LR" ? Position.Left : Position.Top,
			sourcePosition: direction === "LR" ? Position.Right : Position.Bottom,
		};
	});

	return { nodes: layoutedNodes, edges };
};
