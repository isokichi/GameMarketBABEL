# Game Market BABEL アプリケーション

このプロジェクトは、既存の動画再生・待機画面表示機能と、Lキーによる結果確認画面を、ReactおよびViteを使用したモダンなアプリケーションとして統合したものです。

## Getting Started

### 依存関係のインストール

プロジェクトのルートディレクトリで、以下のコマンドを実行して必要な依存関係をインストールします。

```bash
npm install
```

### 開発サーバーの起動

開発中にアプリケーションを実行するには、以下のコマンドを使用します。

```bash
npm run dev
```

これにより、ローカルの開発サーバーが起動し、変更がリアルタイムで反映されます。通常、`http://localhost:5173`のようなURLでアクセスできます。

### 本番ビルドの作成

アプリケーションの本番環境向けのビルドを作成するには、以下のコマンドを実行します。

```bash
npm run build
```

このコマンドは、最適化された静的ファイル（`dist`ディレクトリに生成されます）を作成します。

### アプリケーションの実行（ビルド後）

本番ビルドされたアプリケーションを実行するには、静的ファイルサーバーが必要です。以下のコマンドを使用すると、`dist`ディレクトリの内容をサーブする一時的なサーバーを起動できます。

```bash
npx serve dist
```

これにより、`http://localhost:5000`（または別の利用可能なポート）のようなURLでアプリケーションにアクセスできます。

### アプリケーションの操作

-   **初期画面**: アプリケーション起動時に表示されます。
-   **動画再生**: `q`, `w`, `e`などのキーを押して動画をロードし、スペースキーで再生・一時停止できます。動画終了後、初期画面に戻ります。
-   **BGM**: 最初のキー入力でBGMが再生され、動画再生中は一時停止し、初期画面に戻ると再開されます。
-   **結果画面**: `L`キーを押すと、GASウェブアプリから取得したチャートデータが表示されます。再度`L`キーを押すと結果画面が閉じます。
-   **フルスクリーン**: `F`キーを押すとフルスクリーンモードに切り替わります。

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
