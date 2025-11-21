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

// GASのデプロイURL
const GAS_URL = "https://script.google.com/macros/s/AKfycbwt6Ga3QDhCikbJadAyKpT17HcOAgrw-eN6WyXE9dRsPWkQSP6LDdN20pHN_1xa1XjK/exec";

// 動画再生キーマップ
const videoKeyMap: Record<string, boolean> = {
  'q': true, 'w': true, 'e': true, 'r': true, 't': true, 'y': true,
  'u': true, 'i': true, 'o': true, 'p': true, 'a': true, 's': true,
};


// ==========================================
// 3. App (メイン管理コンポーネント)
// ==========================================
const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'initial' | 'media' | 'result'>('initial'); // 'waiting'スクリーンを削除
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]); // ボーナスカードの数字を保持するステート

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
        // 動画キーが押されたら待機画面を維持しつつボーナスデータを取得
        // Media画面への切り替えはスペースキーで行う
        console.log(`ボーナス取得キー '${key}' が押されました。`);
        fetch(`${GAS_URL}?action=getNextBonus`)
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              console.error("GASからのエラー:", data.error);
            } else {
              console.log("GASから取得したボーナスデータ:", data);
              const { b19, c19, d19, e19 } = data;
              console.log("B19:", b19, "C19:", c19, "D19:", d19, "E19:", e19); // 個々の値をログ出力
              setBonusNumbers([b19, c19, d19, e19]); // ボーナス数字をステートに保存
              setCurrentScreen('media'); // メディア画面に切り替え
            }
          })
          .catch(error => {
            console.error("GASからのデータ取得中にエラーが発生しました:", error);
            // エラーが発生した場合も、ロゴ画面に留まる
            setCurrentScreen('initial');
          });
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
        bonusNumbers={bonusNumbers} // bonusNumbersをMediaPlayerに渡す
        setBonusNumbers={setBonusNumbers} // setBonusNumbersもMediaPlayerに渡す
      />
      <ResultScreenContainer
        currentScreen={currentScreen}
        onBackToInitial={() => setCurrentScreen('initial')} // 結果画面から戻る機能が必要な場合
        onBgmPlayToggle={handleBgmPlayToggle}
      />
    </>
  );
};

export default App;
