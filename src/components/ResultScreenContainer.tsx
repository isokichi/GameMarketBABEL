import React, { useState, useEffect, useRef } from 'react';
import GraphScreen from '@/components/GraphScreen'; // 既存のGraphScreenをインポート
import type { TeamData } from '@/App'; // TeamData型をインポート

// GASウェブアプリのURL (fetch API用)
// GASウェブアプリのURL (fetch API用)
// App.tsxと統一するために変更
const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbzDDF6g1NMXEYpOi7VsSQQNaBf_LEfW56Pu-0opeVH5H7npWi8I6BbvkgQQRV1Qn4-Srw/exec';

interface ResultScreenContainerProps {
    currentScreen: 'initial' | 'media' | 'result';
    onBackToInitial: () => void;
    onBgmPlayToggle: (play: boolean) => void; // 新しく追加
    onResultScreenClosed: () => void; // 結果画面が閉じられたときに呼び出される
}

const ResultScreenContainer: React.FC<ResultScreenContainerProps> = ({ currentScreen, onBackToInitial, onBgmPlayToggle, onResultScreenClosed }) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<TeamData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const resultBgmPlayerRef = useRef<HTMLAudioElement>(null); // resultBGMの参照

    useEffect(() => {
        if (currentScreen === 'result') {
            // 結果画面BGMの再生
            if (resultBgmPlayerRef.current) {
                resultBgmPlayerRef.current.currentTime = 0; // 最初から再生
                resultBgmPlayerRef.current.play().catch((e: unknown) => console.error("結果BGMの再生に失敗しました:", e));
            }
            onBgmPlayToggle(false); // メインBGMを一時停止

            setLoading(true);
            setError(null);
            fetch(`${gasWebAppUrl}?action=getChartData`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("GASからのチャートデータレスポンス:", data); // 追加
                    if (data.error) {
                        console.error(`チャートデータの読み込みに失敗しました: ${data.error}`);
                        setError(`データの読み込みに失敗しました: ${data.error}`);
                        setChartData([]);
                    } else {
                        // GASからのデータをTeamData形式に変換
                        const transformedData: TeamData[] = [];
                        const teamCols = ['C', 'D', 'E', 'F']; // チームごとの列

                        // ボーナススコアの定数
                        const SONG_BONUS_SCORE = 20;
                        const VARIABLE_BONUS_SCORE = 10;
                        const DANCE_BONUS_SCORE = 10;

                        teamCols.forEach(col => {
                            const baseScore = (data[`${col}4`] || 0) as number;
                            const songBonusAchieved = (data[`${col}5`] === true); // booleanに変換
                            const variableBonusesAchieved = [
                                (data[`${col}6`] === true),
                                (data[`${col}7`] === true),
                                (data[`${col}8`] === true),
                                (data[`${col}9`] === true),
                            ];
                            const danceBonusAchieved = (data[`${col}10`] === true); // booleanに変換
                            const finalScore = (data[`${col}11`] || 0) as number;

                            // 初期表示スコアは素点とする
                            const initialScore = baseScore;

                            transformedData.push({
                                id: col,
                                label: `チーム ${col}`,
                                score: initialScore, // 初期スコア
                                baseScore: baseScore,
                                songBonusAchieved: songBonusAchieved,
                                variableBonusesAchieved: variableBonusesAchieved,
                                danceBonusAchieved: danceBonusAchieved,
                                finalScore: finalScore,
                            });
                        });
                        setChartData(transformedData);
                    }
                })
                .catch((err: unknown) => {
                    console.error(`チャートデータの読み込み中に通信エラーが発生しました:`, err);
                    setError(`通信エラーが発生しました: ${err instanceof Error ? err.message : String(err)}`);
                    setChartData([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // 結果画面ではない場合、結果BGMを停止
            if (resultBgmPlayerRef.current) {
                resultBgmPlayerRef.current.pause();
                resultBgmPlayerRef.current.currentTime = 0;
            }
        }

        // クリーンアップ関数
        return () => {
            if (resultBgmPlayerRef.current) {
                resultBgmPlayerRef.current.pause();
                resultBgmPlayerRef.current.currentTime = 0;
            }
            // 結果画面が閉じられるときにonResultScreenClosedを呼び出す
            onResultScreenClosed();
        };
    }, [currentScreen, onBgmPlayToggle, onResultScreenClosed]); // onBgmPlayToggleとonResultScreenClosedを依存配列に追加

    if (currentScreen !== 'result') {
        return null; // 結果画面ではない場合は何も表示しない
    }

    return (
        <div id="result-screen" className="result-screen" style={{ display: 'flex' }}>
            {/* resultBGMプレイヤーを追加 */}
            <audio ref={resultBgmPlayerRef} src="/audio/resultBGM.mp3" loop></audio> {/* 追記 */}
            {loading && <div id="loading-message" className="loading-message">集計中...</div>}
            {error && !loading && <div className="error-message" style={{ color: 'red', fontSize: '1.5em' }}>{error}</div>}
            {!loading && !error && chartData.length > 0 && (
                <GraphScreen data={chartData} />
            )}
            {/* エラーがなくデータもない場合、データなしメッセージなどを表示することも可能 */}
            {!loading && !error && chartData.length === 0 && (
                <div className="no-data-message" style={{ color: 'gray', fontSize: '1.5em' }}>表示するデータがありません。</div>
            )}
        </div>
    );
};

export default ResultScreenContainer;
