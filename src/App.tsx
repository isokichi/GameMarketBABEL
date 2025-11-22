import React, { useState, useEffect, useCallback } from "react";
// 新しく作成したコンポーネントをインポート
import InitialScreen from "@/components/InitialScreen";
import MediaPlayer from "@/components/MediaPlayer";
import ResultScreenContainer from "@/components/ResultScreenContainer";

// --- 型定義 ---
export type TeamData = {
  id: string;
  label: string;
  // GraphScreenで表示する現在のスコア
  score: number;
  // GASから取得する詳細データ
  baseScore: number;
  songBonusAchieved: boolean;
  variableBonusesAchieved: boolean[]; // 4つの真偽値
  danceBonusAchieved: boolean;
  finalScore: number; // GASから取得する最終合計点
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

// ボーナススコアの定数
export const SONG_BONUS_SCORE = 20;
export const VARIABLE_BONUS_SCORE = 10;
export const DANCE_BONUS_SCORE = 10;

// GASのデプロイURL
const GAS_URL = "https://script.google.com/macros/s/AKfycbzDDF6g1NMXEYpOi7VsSQQNaBf_LEfW56Pu-0opeVH5H7npWi8I6BbvkgQQRV1Qn4-Srw/exec";

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
  const [isInitialBgmPlayed, setIsInitialBgmPlayed] = useState(false); // App.tsxで管理
  const [videoKeyToLoad, setVideoKeyToLoad] = useState<string | null>(null); // MediaPlayerに渡す動画キー
  const [currentBgmSource, setCurrentBgmSource] = useState<string>('/audio/BGM.wav'); // 現在再生中のBGMソース

  // BGMの再生/一時停止を切り替えるコールバック
  const handleBgmPlayToggle = useCallback((play: boolean) => {
    setIsBgmPlaying(play);
  }, []);

  // 動画終了時に待機画面に戻るコールバック（MediaPlayer内で完結させるため、App.tsxでは画面遷移は行わない）
  const handleVideoEnded = useCallback(() => {
    // setCurrentScreen('initial'); // MediaPlayer内で待機画面に遷移させるため、App.tsxでは画面遷移を行わない
    setVideoKeyToLoad(null); // 動画終了でキーをリセット
    setCurrentBgmSource('/audio/resultBGM.mp3'); // 動画終了で結果発表BGMに切り替え
    // handleBgmPlayToggle(true); // BGM再開はAppのuseEffectで制御する
  }, [setCurrentBgmSource]); // 依存配列からhandleBgmPlayToggleを削除し、setCurrentBgmSourceのみにする

  // GAS連携とボーナスデータ設定、Media画面への遷移を行う関数
  const fetchBonusAndTransitionToMedia = useCallback(async (key: string) => { // キーを受け取る
    console.log(`App.tsx: ボーナス取得を開始します。`);
    // handleBgmPlayToggle(false); // Media画面に入る前にメインBGMを停止 (ボーナス読み込み中はBGMを止めない)
    try {
      const response = await fetch(`${GAS_URL}?action=getNextBonus`);
      const data = await response.json();

      if (data.error) {
        console.error("GASからのエラー:", data.error);
        throw new Error(data.error);
      } else {
        console.log("App.tsx: GASから取得したボーナスデータ:", data);
        const { b19, c19, d19, e19 } = data;
        setBonusNumbers([b19, c19, d19, e19]);
        setVideoKeyToLoad(key); // 押されたキーを保存
        setCurrentScreen('media'); // Media画面に切り替え
      }
    } catch (error) {
      console.error("App.tsx: GASからのデータ取得中にエラーが発生しました:", error);
      setCurrentScreen('initial'); // エラー時はinitialに戻る
      setVideoKeyToLoad(null); // エラー時はキーをリセット
      handleBgmPlayToggle(true); // エラー時はinitialに戻るのでBGMを再開
    }
  }, [handleBgmPlayToggle, setBonusNumbers, setCurrentScreen, setVideoKeyToLoad]); // 依存配列にsetVideoKeyToLoadを追加

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // 最初のキー入力でBGMを再生
      if (!isInitialBgmPlayed) {
        handleBgmPlayToggle(true);
        setIsInitialBgmPlayed(true);
        console.log("App.tsx: 最初のユーザー操作でBGMを再生しました。");
      }

      if (key === 'l') {
        setCurrentScreen(prevScreen => {
          if (prevScreen === 'result') {
            handleBgmPlayToggle(true); // 結果画面を閉じたらBGM再開
            setVideoKeyToLoad(null); // 結果画面を閉じたらキーをリセット
            return 'initial';
          } else {
            handleBgmPlayToggle(false); // 結果画面を開いたらBGM一時停止
            return 'result';
          }
        });
      } else if (videoKeyMap[key]) { // どの画面からでも動画キーを処理できるように変更
        fetchBonusAndTransitionToMedia(key); // 押されたキーを渡す
      }
      // Fキー (フルスクリーン) とスペースキー (動画再生/一時停止) はMediaPlayerで処理される
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleBgmPlayToggle, isInitialBgmPlayed, currentScreen, fetchBonusAndTransitionToMedia, setVideoKeyToLoad]); // 依存配列にsetVideoKeyToLoadを追加

  // BGMソースが変更されたときにBGMの再生状態を同期する
  useEffect(() => {
    // Media画面で結果BGMが設定された場合、BGMを再生する
    if (currentScreen === 'media' && currentBgmSource === '/audio/resultBGM.mp3') {
      setIsBgmPlaying(true);
    } 
    // Initial画面でメインBGMが設定され、かつ一度でもBGMが再生されたことがある場合
    else if (currentScreen === 'initial' && currentBgmSource === '/audio/BGM.wav' && isInitialBgmPlayed) {
      setIsBgmPlaying(true);
    }
    // その他の場合はBGMを停止
    else {
      setIsBgmPlaying(false);
    }
  }, [currentScreen, currentBgmSource, isInitialBgmPlayed]);


  return (
    <>
      <InitialScreen 
        currentScreen={currentScreen} 
        showStartMessage={!isInitialBgmPlayed && currentScreen === 'initial'} // initial画面でまだBGMが再生されていなければメッセージを表示
      />
      <MediaPlayer
        onVideoEnded={handleVideoEnded}
        currentScreen={currentScreen}
        isBgmPlaying={isBgmPlaying}
        onBgmPlayToggle={handleBgmPlayToggle}
        bonusNumbers={bonusNumbers} // bonusNumbersをMediaPlayerに渡す
        setBonusNumbers={setBonusNumbers} // setBonusNumbersもMediaPlayerに渡す
        initialVideoKey={videoKeyToLoad} // MediaPlayerに動画キーを渡す
        currentBgmSource={currentBgmSource} // MediaPlayerにBGMソースを渡す
      />
      <ResultScreenContainer
        currentScreen={currentScreen}
        onBackToInitial={() => setCurrentScreen('initial')} // 結果画面から戻る機能が必要な場合
        onBgmPlayToggle={handleBgmPlayToggle}
        // ResultScreenContainerからinitialに戻る際にBGMをメインに戻す
        onResultScreenClosed={() => setCurrentBgmSource('/audio/BGM.wav')}
      />
    </>
  );
};

export default App;
