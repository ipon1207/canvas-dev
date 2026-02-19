import { Panel } from "@xyflow/react";
import {
	ArrowDownAZ,
	BoxSelect,
	Download,
	FileText,
	FolderOpen,
	Plus,
	Redo,
	Save,
	Undo,
} from "lucide-react";
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
import { downloadImage } from "../utils/download";
import { getLayoutedElements } from "../utils/layout";

export function CanvasToolbar() {
	const {
		addNode,
		getProjectData,
		loadProject,
		currentPath,
		setCurrentPath,
		copySelection,
		pasteFromClipboard,
		nodes,
		edges,
		setNodes,
		addMarkdownNode,
		addGroupNode,
	} = useCanvasStore();

	const { undo, redo, pastStates, futureStates } =
		useCanvasStore.temporal.getState();

	// 履歴があるかどうかでボタンを無効化する
	const canUndo = pastStates.length > 0;
	const canRedo = futureStates.length > 0;

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

	// レイアウト実行
	const handleAutoLayout = useCallback(() => {
		const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, "TB");

		setNodes(layoutedNodes);

		toast.success("Auto-layout applied!");
	}, [nodes, edges, setNodes]);

	const handleExport = useCallback(async () => {
		const success = await downloadImage(nodes);
		if (success) {
			toast.success("Image exported successfully!");
		} else {
			toast.error("Failed to export image");
		}
	}, [nodes]);

	// キーボードショートカット
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// コピペやUndoは入力フォーム内では発動させない
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			const isCtrl = e.ctrlKey || e.metaKey;

			if (isCtrl) {
				switch (e.key.toLowerCase()) {
					case "s": // save
						e.preventDefault();
						executeSave();
						break;
					case "z": // Undo（ShiftありならRedo）
						e.preventDefault();
						if (e.shiftKey) {
							redo();
						} else {
							undo();
						}
						break;
					case "y": // Redo (Windows Style)
						e.preventDefault();
						redo();
						break;
					case "c": // Copy
						e.preventDefault();
						copySelection();
						break;
					case "v": // Paste
						e.preventDefault();
						pasteFromClipboard();
						break;
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [executeSave, undo, redo, copySelection, pasteFromClipboard]);

	return (
		<Panel position="top-right" className="m-4 flex gap-2">
			{/* Undo/Redo Buttons */}
			<div className="flex gap-1 mr-2 border-r pr-2 border-zinc-200 dark:border-zinc-700">
				<Button
					onClick={() => undo()}
					disabled={!canUndo}
					variant="ghost"
					size="icon"
					title="Undo (Ctrl+Z)"
				>
					<Undo className="h-4 w-4" />
				</Button>
				<Button
					onClick={() => redo()}
					disabled={!canRedo}
					variant="ghost"
					size="icon"
					title="Redo (Ctrl+Y)"
				>
					<Redo className="h-4 w-4" />
				</Button>
			</div>

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

			<Button
				onClick={addMarkdownNode}
				variant="secondary"
				className="shadow-lg hover:scale-105 transition-transform bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100"
			>
				<FileText className="mr-2 h-4 w-4" />
			</Button>

			<Button
				onClick={addGroupNode}
				variant="secondary"
				className="shadow-lg hover:scale-105 transition-transform bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100"
			>
				<BoxSelect className="mr-2 h-4 w-4" />
			</Button>

			<div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1" />

			<Button
				onClick={handleAutoLayout}
				variant="outline"
				size="icon"
				title="Auto Layout"
			>
				<ArrowDownAZ className="h-4 w-4" />
			</Button>

			<Button
				onClick={handleExport}
				variant="outline"
				size="icon"
				title="Export as PNG"
			>
				<Download className="h-4 w-4" />
			</Button>
		</Panel>
	);
}
