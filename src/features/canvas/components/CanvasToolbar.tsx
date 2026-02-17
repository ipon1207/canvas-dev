import { Panel } from "@xyflow/react";
import { FolderOpen, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	loadProjectFromFile,
	saveProjectToFile,
} from "@/features/file-system/api/file";
import { useCanvasStore } from "../stores/useCanvasStore";

export function CanvasToolbar() {
	const { addNode, getProjectData, loadProject } = useCanvasStore();

	// 保存ボタンのハンドラ
	const handleSave = async () => {
		const data = getProjectData();
		await saveProjectToFile(data);
	};

	// 読み込みボタンのハンドラ
	const handleLoad = async () => {
		const data = await loadProjectFromFile();
		if (data) {
			loadProject(data);
		}
	};

	return (
		<Panel position="top-right" className="m-4 flex gap-2">
			<Button onClick={handleSave} variant="outline" size="icon" title="Save">
				<Save className="h-4 w-4" />
			</Button>

			<Button onClick={handleLoad} variant="outline" size="icon" title="Load">
				<FolderOpen className="h-4 w-4" />
			</Button>

			<Button
				onClick={addNode}
				className="shadow-lg hover:scale-105 transition-transform"
			>
				<Plus className="mr-2 h-4 w-4" />
				Add Node
			</Button>
		</Panel>
	);
}
