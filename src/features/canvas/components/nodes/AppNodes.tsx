import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppNode } from "../../types/canvas";

// NodeProps<ProjectNodeData> で型を効かせる
export function AppNodeComponent({ data, selected }: NodeProps<AppNode>) {
	return (
		// selected プロパティで「選択中」のスタイルを切り替え
		<Card
			className={`w-50 shadow-md transition-all ${selected ? "border-blue-500 ring-2 ring-blue-200" : ""}`}
		>
			{/* 上の接続点 */}
			<Handle type="target" position={Position.Top} className="bg-zinc-400!" />

			<CardHeader className="p-3 pb-0">
				<div className="flex items-center font-bold text-zinc-700 truncate">
					<CardTitle className="text-sm font-bold text-zinc-700">
						{data.label}
					</CardTitle>

					{/* ステータスがあればバッジを表示 */}
					{data.status && (
						<Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
							{data.status}
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="p-3 pt-2">
				<p className="text-xs text-zinc-500">
					{data.description || "No description"}
				</p>
				{/* ステータスバッジなどを追加可能 */}
			</CardContent>

			{/* 下の接続点 */}
			<Handle
				type="source"
				position={Position.Bottom}
				className="bg-zinc-400!"
			/>
		</Card>
	);
}
