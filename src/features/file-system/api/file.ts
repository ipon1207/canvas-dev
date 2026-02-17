import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { type ProjectData, ProjectSchema } from "../schema/project";

// 「上書き保存」処理
export async function saveProjectToPath(path: string, data: ProjectData) {
	try {
		const content = JSON.stringify(data, null, 2);
		await writeTextFile(path, content);
		console.log("Saved to:", path);
		return true;
	} catch (error) {
		console.error("Failed to save:", error);
		return false;
	}
}

// 「名前を付けて保存」処理
export async function saveAsProject(data: ProjectData): Promise<string | null> {
	try {
		// 1. 保存場所を選ぶダイアログを開く
		const path = await save({
			filters: [{ name: "Canvas Project", extensions: ["json"] }],
			defaultPath: "my-project.json",
		});

		if (!path) return null;

		// 2. データを文字列(JSON)に変換
		const content = JSON.stringify(data, null, 2);

		// 3. ファイルに書き込む
		await writeTextFile(path, content);
		return path;
	} catch (error) {
		console.error("Failed to save:", error);
		alert("Failed to save file.");
		return null;
	}
}

// 読み込み処理
export async function loadProjectFromFile(): Promise<{
	data: ProjectData;
	path: string;
} | null> {
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
		return { data: parsedData, path: path as string };
	} catch (error) {
		console.error("Failed to load:", error);
		alert("Failed to load file or invalid file format.");
		return null;
	}
}
