import React, { useState, useEffect } from 'react';
import GraphScreen from '@/components/GraphScreen'; // 既存のGraphScreenをインポート
import type { TeamData } from '@/App'; // TeamData型をインポート

// GASウェブアプリのURL (fetch API用)
const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycby9AMrzGPcm3QBhWn2oBdCg6x76yBK4nvi-qhJP9dPvWy5Xpl0y70-aqgb95vm-o9bn4A/exec';

interface ResultScreenContainerProps {
    currentScreen: 'initial' | 'media' | 'result';
    onBackToInitial: () => void;
}

const ResultScreenContainer: React.FC<ResultScreenContainerProps> = ({ currentScreen }) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<TeamData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentScreen === 'result') {
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
                    if (data.error) {
                        console.error(`チャートデータの読み込みに失敗しました: ${data.error}`);
                        setError(`データの読み込みに失敗しました: ${data.error}`);
                        setChartData([]);
                    } else {
                        // GASからのデータをTeamData形式に変換
                        // 現在のGraphScreenはid, label, scoreを期待する
                        const transformedData: TeamData[] = [
                            { id: "c11", label: "C11", score: data.c11 || 0 },
                            { id: "d11", label: "D11", score: data.d11 || 0 },
                            { id: "e11", label: "E11", score: data.e11 || 0 },
                            { id: "f11", label: "F11", score: data.f11 || 0 },
                        ];
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
        }
    }, [currentScreen]);

    if (currentScreen !== 'result') {
        return null; // 結果画面ではない場合は何も表示しない
    }

    return (
        <div id="result-screen" className="result-screen" style={{ display: 'flex' }}>
            {loading && <div id="loading-message" className="loading-message">集計中...</div>}
            {error && !loading && <div className="error-message" style={{ color: 'red', fontSize: '1.5em' }}>{error}</div>}
            {!loading && !error && chartData.length > 0 && (
                <div className="chart-container" style={{ display: 'block' }}>
                    {/* GraphScreenにTeamDataを渡す */}
                    <GraphScreen data={chartData} />
                </div>
            )}
            {/* エラーがなくデータもない場合、データなしメッセージなどを表示することも可能 */}
            {!loading && !error && chartData.length === 0 && (
                <div className="no-data-message" style={{ color: 'gray', fontSize: '1.5em' }}>表示するデータがありません。</div>
            )}
        </div>
    );
};

export default ResultScreenContainer;
