import { useReactFlow } from "@xyflow/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useCanvasStore } from "../stores/useCanvasStore";

export function CanvasSearch() {
	const [query, setQuery] = useState("");
	const { nodes, selectNode } = useCanvasStore();

	// React Flow のカメラ操作APIを取得
	const { setCenter } = useReactFlow();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (!query.trim()) return;

		const lowerQuery = query.toLowerCase();

		// label または description にキーワードが含まれるノードを探す
		const foundNode = nodes.find((n) => {
			const labelMatch = n.data.label?.toLowerCase().includes(lowerQuery);
			const descMatch = n.data.description?.toLowerCase().includes(lowerQuery);
			return labelMatch || descMatch;
		});

		if (foundNode) {
			// 1. ノードを選択状態にする
			selectNode(foundNode.id);

			// 2. ノードの中心座標を計算する（measured があればそれを使用、なければデフォルト値）
			const nodeWidth = foundNode.measured?.width ?? 200;
			const nodeHeight = foundNode.measured?.height ?? 100;

			const centerX = foundNode.position.x + nodeWidth / 2;
			const centerY = foundNode.position.y + nodeHeight / 2;

			// 3. カメラをアニメーション付きで移動させる
			setCenter(centerX, centerY, {
				zoom: 1.2,
				duration: 800,
			});
		} else {
			toast.error("No matching nodes found.");
		}
	};

	return (
		<form onSubmit={handleSearch} className="relative flex items-center">
			<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
			<Input
				type="text"
				placeholder="Search nodes... (Press Enter)"
				className="w-56 pl-8 h-9 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
		</form>
	);
}
