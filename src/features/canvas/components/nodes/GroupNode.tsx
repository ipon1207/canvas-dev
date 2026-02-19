import { type NodeProps, NodeResizer } from "@xyflow/react";
import { memo } from "react";
import type { AppNode } from "../../types/canvas";

export const GroupNode = memo(({ data, selected }: NodeProps<AppNode>) => {
	return (
		<div
			className={`w-full h-full bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed rounded-xl p-4 transition-colors ${selected ? "border-blue-500 ring-2 ring-blue-200" : "border-blue-300 dark:border-blue-700"}`}
		>
			{/* リサイズ用ハンドル */}
			<NodeResizer
				color="#3b82f6"
				isVisible={selected}
				minWidth={250}
				minHeight={200}
			/>

			{/* グループのタイトル（背景に薄く表示） */}
			<div className="font-bold text-blue-800 dark:text-blue-300 text-xl opacity-40 select-none pointer-events-none">
				{data.label || "Group"}
			</div>
		</div>
	);
});
