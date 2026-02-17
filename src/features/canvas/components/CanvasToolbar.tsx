import { Panel } from "@xyflow/react";
import { FolderOpen, Plus, Save } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
	loadProjectFromFile,
	saveAsProject,
	saveProjectToPath,
} from "@/features/file-system/api/file";
import { useCanvasStore } from "../stores/useCanvasStore";

export function CanvasToolbar() {
	const { addNode, getProjectData, loadProject, currentPath, setCurrentPath } =
		useCanvasStore();

	// 上書き保存ロジック
	const executeSave = useCallback(async () => {
		const data = getProjectData();

		try {
			if (currentPath) {
				const success = await saveProjectToPath(currentPath, data);

				if (success) {
					toast.success("Project saved successfully!");
				} else {
					toast.error("Failed to save project");
				}
			} else {
				const newPath = await saveAsProject(data);
				if (newPath) {
					setCurrentPath(newPath);
					toast.success("Project saved successfully!");
				} else {
					// キャンセルされた場合は何もしない
				}
			}
		} catch (error) {
			console.error(error);
			toast.error("An unexpected error occurred while saving");
		}
	}, [currentPath, getProjectData, setCurrentPath]);

	// 読み込みボタンのハンドラ
	const handleLoad = async () => {
		const result = await loadProjectFromFile();
		if (result) {
			loadProject(result.data);
			setCurrentPath(result.path);
		}
	};

	// キーボードショートカット
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl+S or Cmd+S
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				executeSave();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [executeSave]);

	return (
		<Panel position="top-right" className="m-4 flex gap-2">
			<ModeToggle />
			<Button onClick={executeSave} variant="outline" size="icon" title="Save">
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
