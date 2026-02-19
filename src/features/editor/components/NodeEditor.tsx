import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCanvasStore } from "@/features/canvas/stores/useCanvasStore";
import type { ProjectNodeData } from "@/features/canvas/types/canvas";

export function NodeEditor() {
	const {
		nodes,
		selectedNodeId,
		selectNode,
		updateNodeData,
		updateNodeParent,
	} = useCanvasStore();

	// 現在キャンバスにあるグループノードの一覧を取得
	const groupNodes = nodes.filter((n) => n.type === "group-node");

	// 選択中のノードを探す
	const selectedNode = nodes.find((n) => n.id === selectedNodeId);

	// パネルが開いているかどうかのフラグ
	const isOpen = !!selectedNodeId;

	// パネルを閉じるときの処理
	const handleClose = (open: boolean) => {
		if (!open) selectNode(null);
	};

	if (!selectedNode) return null;

	// 親ノードを変更する処理
	const handleParentChange = (parentId: string) => {
		const newParentId = parentId === "none" ? undefined : parentId;
		updateNodeParent(selectedNode.id, newParentId);
	};

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className="w-100 sm:w-135" side="right">
				<SheetHeader>
					<SheetTitle>Edit Node</SheetTitle>
					<SheetDescription>Make changes to your node here.</SheetDescription>
				</SheetHeader>

				<div className="grid gap-6 py-4">
					{/* グループ選択プルダウン（グループ自身には表示しない） */}
					{selectedNode.type !== "group-node" && groupNodes.length > 0 && (
						<div className="grid gap-2">
							<Label>Group (Parent Node)</Label>
							<Select
								value={selectedNode.parentId || "none"}
								onValueChange={handleParentChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a group" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Group</SelectItem>
									{groupNodes.map((group) => (
										<SelectItem key={group.id} value={group.id}>
											{group.data.label || "Unnamed Group"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
					<div className="grid gap-2">
						<Label htmlFor="title">Title</Label>
						<Input
							id="title"
							value={selectedNode.data.label}
							onChange={(e) =>
								updateNodeData(selectedNode.id, { label: e.target.value })
							}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="status">Status</Label>
						<Select
							value={selectedNode.data.status ?? "todo"}
							onValueChange={(val) => {
								const status = val as ProjectNodeData["status"];
								updateNodeData(selectedNode.id, { status });
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="todo">To Do</SelectItem>
								<SelectItem value="inprogress">In Progress</SelectItem>
								<SelectItem value="done">Done</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="link" className="flex items-center gap-2">
							<ExternalLink className="h-3 w-3" />
							Link (URL or Local Path)
						</Label>
						<Input
							id="link"
							placeholder="https://github.com... or C:/Projects/..."
							value={selectedNode.data.link ?? ""}
							onChange={(e) =>
								updateNodeData(selectedNode.id, { link: e.target.value })
							}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={selectedNode.data.description || ""}
							onChange={(e) =>
								updateNodeData(selectedNode.id, { description: e.target.value })
							}
						/>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
