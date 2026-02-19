import { Handle, type NodeProps, Position } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import type { AppNode } from "../../types/canvas";

export function MarkdownNode({ data, selected }: NodeProps<AppNode>) {
	// Markdownのデフォルトテキスト
	const content =
		data.description ||
		"# New Note\nSelect this node and edit the **description** in the side panel.";

	return (
		<div
			className={`bg-white dark:bg-zinc-900 border-2 rounded-xl p-5 min-w-62.5 max-w-112.5 shadow-sm transition-all ${selected ? "border-amber-500 ring-2 ring-amber-200" : "border-zinc-200 dark:border-zinc-700"}`}
		>
			<Handle type="target" position={Position.Top} className="bg-zinc-400!" />

			{/* prose クラスを付けることで、Tailwind Typography が自動でスタイルを当てる */}
			{/* ダークモード対応のために dark:prose-invert もつける */}
			<div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word">
				<ReactMarkdown>{content}</ReactMarkdown>
			</div>

			<Handle
				type="source"
				position={Position.Bottom}
				className="bg-zinc-400!"
			/>
		</div>
	);
}
