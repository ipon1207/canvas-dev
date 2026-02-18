import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { toPng } from "html-to-image";
import type { AppNode } from "../types/canvas";

// 画像の幅・高さの最大値（ブラウザ制限対策）
const imageWidth = 1024;
const imageHeight = 768;

export async function downloadImage(nodes: AppNode[]) {
	// 1. React Flow のビューポート要素 (.react-flow__viewport) を取得
	const viewportParams = document.querySelector(
		".react-flow__viewport",
	) as HTMLElement;

	if (!viewportParams || nodes.length === 0) return;

	// 2. 全ノードが収まる範囲 (Bounds) を計算
	const nodesBounds = getNodesBounds(nodes);

	// 3. 範囲がぴったり収まるような変換係数 (transform) を計算
	const transform = getViewportForBounds(
		nodesBounds,
		imageWidth,
		imageHeight,
		0.5, // 最小ズーム
		2, // 最大ズーム
		50, // 余白
	);

	// 4. 画像生成オプション
	const option = {
		width: imageWidth,
		height: imageHeight,
		style: {
			width: `${imageWidth}px`,
			height: `${imageHeight}px`,
			transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
		},
	};

	try {
		// 5. データURL (base64) として生成
		const dataUrl = await toPng(viewportParams, option);

		// 6. Tauriの保存ダイアログを開く
		const path = await save({
			filters: [{ name: "Image", extensions: ["png"] }],
			defaultPath: "canvas-export.png",
		});

		if (!path) return false;

		// 7. Base64をバイナリに変換して保存
		const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
		// バイナリ変換
		const binaryData = Uint8Array.from(atob(base64Data), (c) =>
			c.charCodeAt(0),
		);

		await writeFile(path, binaryData);

		return true;
	} catch (error) {
		console.error("Export failed:", error);
		return false;
	}
}
