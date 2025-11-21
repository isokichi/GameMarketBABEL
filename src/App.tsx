import React, { useState, useEffect, useCallback } from "react";
// 新しく作成したコンポーネントをインポート
import InitialScreen from "@/components/InitialScreen";
import MediaPlayer from "@/components/MediaPlayer";
import ResultScreenContainer from "@/components/ResultScreenContainer";

// --- 型定義 ---
export type TeamData = {
  id: string;
  label: string;
  score: number;
};

// --- 定数・設定 ---
export const VIRTUAL_WIDTH = 800;
export const VIRTUAL_HEIGHT = 450;
export const PADDING_X = 50;
export const PADDING_Y = 110;
export const BAR_HEIGHT = 40;
export const GAP = 38;
export const STROKE_COLOR = "#ffffff";
export const STROKE_WIDTH = 3;
export const FONT_FAMILY = "Arial, Helvetica, sans-serif";

// 強調表示用の色設定
export const HIGHLIGHT_COLOR = "#FFD700"; // ゴールド
export const NORMAL_COLOR = "#535353";

const videoKeyMap: Record<string, boolean> = {
  'q': true, 'w': true, 'e': true, 'r': true, 't': true, 'y': true,
  'u': true, 'i': true, 'o': true, 'p': true, 'a': true, 's': true,
};

// ==========================================
// 3. App (メイン管理コンポーネント)
// ==========================================
const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'initial' | 'media' | 'result'>('initial');
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  // BGMの再生/一時停止を切り替えるコールバック
  const handleBgmPlayToggle = useCallback((play: boolean) => {
    setIsBgmPlaying(play);
  }, []);

  // 動画終了時に初期画面に戻るコールバック
  const handleVideoEnded = useCallback(() => {
    setCurrentScreen('initial');
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === 'l') {
        // Lキーで結果画面をトグル
        setCurrentScreen(prevScreen => {
          if (prevScreen === 'result') {
            handleBgmPlayToggle(true); // 結果画面を閉じたらBGM再開
            return 'initial';
          } else {
            handleBgmPlayToggle(false); // 結果画面を開いたらBGM一時停止
            return 'result';
          }
        });
      } else if (videoKeyMap[key]) {
        // 動画キーが押されたらメディア画面に切り替え
        setCurrentScreen('media');
      }
      // Fキー (フルスクリーン) とスペースキー (動画再生/一時停止) はMediaPlayerで処理される
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleBgmPlayToggle]); // handleBgmPlayToggleは useCallback でメモ化されているので依存配列に入れても問題ない

  return (
    <>
      <InitialScreen currentScreen={currentScreen} />
      <MediaPlayer
        onVideoEnded={handleVideoEnded}
        currentScreen={currentScreen}
        isBgmPlaying={isBgmPlaying}
        onBgmPlayToggle={handleBgmPlayToggle}
      />
      <ResultScreenContainer
        currentScreen={currentScreen}
        onBackToInitial={() => setCurrentScreen('initial')} // 結果画面から戻る機能が必要な場合
      />
    </>
  );
};

export default App;
