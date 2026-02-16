# Contributing to CanvasDev

開発に参加していただきありがとうございます！
以下のガイドラインに従って開発を進めてください。

## 開発フロー (Git Flow)

1. **Branching**
    - `main`：常に動作する安定版です。直接コミットは禁止です。
    - `Feature Branch`：`feature/機能名`（例：`feature/add-node/component`）という名前でブランチを切って開発してください。

2. **Commit Messages**
    - [Conventional Commits](https://www.conventionalcommits.org/) に従ってください
    - 例：`feat: button コンポーネントの追加`

## コードスタイルと品質管理

このプロジェクトでは、**Biome** を使用してコードの品質を管理しています。

### 自動整形とLint

コミット前に以下のコマンドを実行して、コードの問題がないか確認して下さい。（Husky により、コミット時に自動実行されます）

```bash
# チェックと自動修正
npm run biome:check
# または
npx @biomejs/biome check --write ./src
```

### 推奨エディタ設定

VS Code を使用する場合、プロジェクト推奨の拡張機能 (`.vscode/extensions.json`) をすべてインストールしてください。保存時に自動整形が適用されます。

## Pull Request(PR)

- PRを作成する際は、変更内容の概要と確認して動作テストの内容を記述してください。
- 必ず `main` ブランチに対してPRを送ってください。
