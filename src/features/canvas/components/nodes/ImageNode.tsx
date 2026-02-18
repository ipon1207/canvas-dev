import { convertFileSrc } from "@tauri-apps/api/core";
import { Handle, type NodeProps, NodeResizer, Position } from "@xyflow/react";
import { memo } from "react";
import type { AppNode } from "../../types/canvas";

// メモ化してパフォーマンスを確保
export const ImageNode = memo(({ data, selected }: NodeProps<AppNode>) => {
	// ローカルパスをWebView用URLに変換
	const imageSrc = data.link ? convertFileSrc(data.link) : "";

	return (
		<div
			className={`relative group ${selected ? "ring-2 ring-blue-500" : ""}`}
			style={{ width: "100%", height: "100%" }}
		>
			{/* リサイズハンドル（選択時のみ表示） */}
			<NodeResizer
				color="#3b82f6"
				isVisible={selected}
				minWidth={100}
				minHeight={100}
			/>

			<Handle type="target" position={Position.Top} className="bg-zinc-400!" />

			{/* 画像表示 */}
			{imageSrc ? (
				<img
					src={imageSrc}
					alt="Dropped"
					className="w-full h-full object-cover rounded-md shadow-md"
					style={{ width: "100%", height: "100%" }}
				/>
			) : (
				<div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-500 text-xs">
					No Image
				</div>
			)}

			<Handle
				type="source"
				position={Position.Bottom}
				className="bg-zinc-400!"
			/>
		</div>
	);
});
