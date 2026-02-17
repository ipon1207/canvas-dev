import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { type ProjectData, ProjectSchema } from "../schema/project";

// 保存処理
export async function saveProjectToFile(data: ProjectData) {
	try {
		// 1. 保存場所を選ぶダイアログを開く
		const path = await save({
			filters: [{ name: "Canvas Project", extensions: ["json"] }],
			defaultPath: "my-project.json",
		});

		if (!path) return;

		// 2. データを文字列(JSON)に変換
		const content = JSON.stringify(data, null, 2);

		// 3. ファイルに書き込む
		await writeTextFile(path, content);
		console.log("Saved to:", path);
	} catch (error) {
		console.error("Failed to save:", error);
		alert("Failed to save file.");
	}
}

// 読み込み処理
export async function loadProjectFromFile(): Promise<ProjectData | null> {
	try {
		// 1. ファイル選択ダイアログを開く
		const path = await open({
			multiple: false,
			filters: [{ name: "Canvas Project", extensions: ["json"] }],
		});

		if (!path) return null;

		// 2. ファイルを読み込む
		const content = await readTextFile(path as string);
		const rawData = JSON.parse(content);

		// 3. Zodでバリデーション
		const parsedData = ProjectSchema.parse(rawData);
		return parsedData;
	} catch (error) {
		console.error("Failed to load:", error);
		alert("Failed to load file or invalid file format.");
		return null;
	}
}
