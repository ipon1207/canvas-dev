import { openPath, openUrl, revealItemInDir } from "@tauri-apps/plugin-opener";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppNode } from "../../types/canvas";

/** URLスキームかどうかを判定する */
function isUrl(value: string): boolean {
	return /^https?:\/\//i.test(value);
}

/** 拡張子がないパスをフォルダとみなす */
function looksLikeDirectory(value: string): boolean {
	const normalized = value.replace(/[\\/]+$/, "");
	const lastSegment = normalized.split(/[\\/]/).pop() ?? "";
	return !lastSegment.includes(".");
}

// NodeProps<ProjectNodeData> で型を効かせる
export function AppNodeComponent({ data, selected }: NodeProps<AppNode>) {
	// リンクを開くハンドラ
	const handleOpenLink = async (e: React.MouseEvent) => {
		e.stopPropagation();

		if (data.link) {
			try {
				if (isUrl(data.link)) {
					// URLならデフォルトブラウザで開く
					await openUrl(data.link);
				} else if (looksLikeDirectory(data.link)) {
					// フォルダパスならエクスプローラーで表示
					await revealItemInDir(data.link);
				} else {
					// ファイルパスならデフォルトアプリで開く
					await openPath(data.link);
				}
			} catch (err) {
				console.error("Failed to open link:", err);
				toast.error("Could not open link");
			}
		}
	};
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

					<div className="flex gap-1">
						{/* リンクがある場合のみボタンを表示 */}
						{data.link && (
							<Button
								variant="ghost"
								size="icon"
								className="h-5 w-5 hover:bg-zinc-100"
								onClick={handleOpenLink}
								title={data.link}
							>
								<ExternalLink className="h-3 w-3 text-zinc-500" />
							</Button>
						)}

						{/* ステータスがあればバッジを表示 */}
						{data.status && (
							<Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
								{data.status}
							</Badge>
						)}
					</div>
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
