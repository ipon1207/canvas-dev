# CanvasDev v2

**CanvasDev** は、開発タスク、ローカルファイル、ドキュメントを無限キャンバス上で視覚的に整理・管理するための「開発コックピット」アプリケーションです。

Tauri v2 による軽量かつ高速な動作と、React Flow による直感的なノードベースUIを特徴としています。

## 🚀 特徴

- **Node-based UI:** タスクやメモをカードとして自由に配置・接続
- **File System Integration:** ローカルフォルダへの直接アクセス・連携
- **Project Management:** マークダウンによる詳細メモ、ステータス管理
- **Native Performance:** Rust バックエンドによる高速なファイル操作と省メモリ設計

## 🛠 技術スタック

- **Framework:** [Tauri v2](https://v2.tauri.app/) (Rust + React)
- **Frontend:** React, TypeScript, [Vite](https://vitejs.dev/)
- **UI Library:** [React Flow](https://reactflow.dev/), [shadcn/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Validation:** [Zod](https://zod.dev/)
- **Tooling:** [Biome](https://biomejs.dev/) (Linter/Formatter)

## 💻 開発環境のセットアップ (Windows)

このプロジェクトは Windows ネイティブ環境での開発を前提としています。

### 前提条件

1.  **Node.js (LTS):** [公式サイト](https://nodejs.org/)からインストール
2.  **Rust:** [rustup](https://rustup.rs/) を使用してインストール
3.  **C++ Build Tools:** Visual Studio Installer にて「C++ によるデスクトップ開発」をインストール

### インストール

```bash
# リポジトリのクローン
git clone [https://github.com/your-name/canvas-dev.git](https://github.com/your-name/canvas-dev.git)
cd canvas-dev

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run tauri dev
```

これによって、Frontend (Vite) と Backend (Rust) と同時にビルドされ、アプリケーションウィンドウが起動します。

## 🏗 ビルド (Release)

配布用のインストーラー (`.exe` / `.msi`) を生成します。

```bash
npm run tauri build
```

生成物は `src-tauri/target/release/bundle/nsis` 等に出力されます。

## 🤝 Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 📄 License

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。
