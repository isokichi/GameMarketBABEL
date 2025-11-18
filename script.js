document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const bgmPlayer = document.getElementById('bgmPlayer'); // BGMプレイヤー要素を追加
    const mediaContainer = document.getElementById('media-container');
    const initialScreen = document.getElementById('initial-screen'); // 初期画面要素を追加
    const resultScreen = document.getElementById('result-screen'); // 結果画面要素を追加
    const loadingMessage = document.getElementById('loading-message'); // 集計中メッセージ要素を追加
    const chartContainer = resultScreen.querySelector('.chart-container'); // チャートコンテナ要素を追加
    const barC11 = document.getElementById('bar-c11'); // C11の棒グラフ要素を追加
    const barD11 = document.getElementById('bar-d11'); // D11の棒グラフ要素を追加
    const barE11 = document.getElementById('bar-e11'); // E11の棒グラフ要素を追加
    const barF11 = document.getElementById('bar-f11'); // F11の棒グラフ要素を追加

    // GASウェブアプリのURL (fetch API用)
    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycby9AMrzGPcm3QBhWn2oBdCg6x76yBK4nvi-qhJP9dPvWy5Xpl0y70-aqgb95vm-o9bn4A/exec';

    // 棒グラフを更新する関数
    function updateBarChart(data) {
        const maxValue = Math.max(data.c11, data.d11, data.e11, data.f11, 1); // 最小値を1として、0除算を避ける

        const setBarHeight = (barElement, value) => {
            const percentage = (value / maxValue) * 100;
            barElement.style.height = `${percentage}%`;
            barElement.querySelector('span').textContent = value;
        };

        setBarHeight(barC11, data.c11);
        setBarHeight(barD11, data.d11);
        setBarHeight(barE11, data.e11);
        setBarHeight(barF11, data.f11);
    }

    // メディアファイルのパスを定義します。
    const videoSources = {
        'q': 'videos/01.mp4',
        'w': 'videos/02.mp4',
        'e': 'videos/03.mp4',
        'r': 'videos/04.mp4',
        't': 'videos/05.mp4',
        'y': 'videos/06.mp4',
        'u': 'videos/07.mp4',
        'i': 'videos/08.mp4',
        'o': 'videos/09.mp4',
        'p': 'videos/10.mp4',
        'a': 'videos/11.mp4',
        's': 'videos/12.mp4'
    };

    // 待機画面要素のマッピング
    const waitingScreens = {
        'q': document.getElementById('waiting-screen-01'),
        'w': document.getElementById('waiting-screen-02'),
        'e': document.getElementById('waiting-screen-03'),
        'r': document.getElementById('waiting-screen-04'),
        't': document.getElementById('waiting-screen-05'),
        'y': document.getElementById('waiting-screen-06'),
        'u': document.getElementById('waiting-screen-07'),
        'i': document.getElementById('waiting-screen-08'),
        'o': document.getElementById('waiting-screen-09'),
        'p': document.getElementById('waiting-screen-10'),
        'a': document.getElementById('waiting-screen-11'),
        's': document.getElementById('waiting-screen-12')
    };

    let currentVideoKey = null; // 現在ロードされている動画のキーを追跡
    let isBgmPlayedInitially = false; // BGMが最初に再生されたかどうかを追跡するフラグ

    // すべてのメディアと待機画面を停止し、非表示にするヘルパー関数
    const stopAllMediaAndScreens = () => {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoPlayer.style.display = 'none';
        Object.values(waitingScreens).forEach(screen => {
            if (screen) screen.style.display = 'none';
        });
        if (initialScreen) {
            initialScreen.style.display = 'none'; // 初期画面も非表示にする
        }
        // 結果発表画面も非表示にする
        if (resultScreen) {
            resultScreen.style.display = 'none';
            loadingMessage.style.display = 'none';
            chartContainer.style.display = 'none';
        }
        mediaContainer.style.display = 'flex'; // media-containerを表示
        currentVideoKey = null;
        if (bgmPlayer) {
            bgmPlayer.currentTime = 0; // BGMを最初から再生
            bgmPlayer.play().catch(e => console.error("BGMの再生に失敗しました:", e)); // BGMを再開
        }
    };

    // 動画再生終了時のイベントリスナー
    videoPlayer.addEventListener('ended', () => {
        console.log('動画再生が終了しました。初期画面に戻ります。');
        stopAllMediaAndScreens(); // すべてのメディアと画面を停止・非表示
        if (initialScreen) {
            initialScreen.style.display = 'block'; // 初期画面を表示
        }
    });

    document.addEventListener('keydown', (event) => {
        // 最初のキー入力でBGMを再生
        if (!isBgmPlayedInitially && bgmPlayer) {
            bgmPlayer.play().then(() => {
                isBgmPlayedInitially = true;
                console.log("最初のユーザー操作でBGMを再生しました。");
            }).catch(e => console.error("最初のBGM再生に失敗しました:", e));
        }

        const key = event.key.toLowerCase(); // 小文字に変換してキーを比較

        if (videoSources[key]) {
            stopAllMediaAndScreens(); // すべてをリセット
            currentVideoKey = key;
            videoPlayer.src = videoSources[key];
            if (waitingScreens[key]) {
                waitingScreens[key].style.display = 'flex'; // 対応する待機画面を表示
            }
            if (bgmPlayer) {
                bgmPlayer.pause(); // 動画再生中はBGMを一時停止
            }
            console.log(`動画をロード: ${videoSources[key]}。待機画面を表示中。スペースキーで再生/停止。`);
        } else if (key === 'f') { // 'F' キーでフルスクリーンを切り替える
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`フルスクリーンモードへの切り替えに失敗しました: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
            console.log(`フルスクリーンモードを切り替えました。`);
        } else if (key === 'l') { // 'L' キーで結果画面の表示/非表示を切り替え、データを取得してグラフを更新
            console.log("Lキーが押されました。");
            if (resultScreen) {
                console.log("resultScreen要素が見つかりました。現在のdisplay:", resultScreen.style.display);
                if (resultScreen.style.display === 'none' || resultScreen.style.display === '') { // 初期状態が空の場合も考慮
                    mediaContainer.style.display = 'none'; // media-containerを非表示
                    resultScreen.style.display = 'flex';
                    loadingMessage.style.display = 'block'; // 集計中メッセージを表示
                    chartContainer.style.display = 'none'; // グラフを非表示
                    console.log("resultScreenをflexに設定し、集計中メッセージを表示しました。");

                    if (bgmPlayer) {
                        bgmPlayer.pause(); // 結果画面表示中はBGMを一時停止
                    }

                    // スプレッドシートのC11, D11, E11, F11の値をGASから取得
                    fetch(`${gasWebAppUrl}?action=getChartData`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json();
                        })
                        .then(data => {
                            loadingMessage.style.display = 'none'; // 集計中メッセージを非表示
                            chartContainer.style.display = 'block'; // グラフを表示
                            if (data.error) {
                                console.error(`チャートデータの読み込みに失敗しました: ${data.error}`);
                                // エラー表示を棒グラフの代わりに表示することも可能
                            } else {
                                updateBarChart(data);
                                console.log('チャートデータを更新しました:', data);
                            }
                        })
                        .catch(error => {
                            loadingMessage.style.display = 'none'; // エラー時も集計中メッセージを非表示
                            console.error(`チャートデータの読み込み中に通信エラーが発生しました: ${error.message}`);
                        });
                } else {
                    resultScreen.style.display = 'none';
                    loadingMessage.style.display = 'none'; // 閉じる際も非表示
                    chartContainer.style.display = 'none'; // 閉じる際も非表示
                    mediaContainer.style.display = 'flex'; // media-containerを表示
                    if (bgmPlayer) {
                        bgmPlayer.play().catch(e => console.error("BGMの再生に失敗しました:", e)); // BGMを再開
                    }
                    console.log("resultScreenをnoneに設定しました。");
                }
            } else {
                console.error("resultScreen要素が見つかりませんでした。");
            }
        } else if (key === ' ') { // スペースキーで再生/停止を切り替える
            if (currentVideoKey && waitingScreens[currentVideoKey] && waitingScreens[currentVideoKey].style.display === 'flex') {
                // 待機画面が表示されている場合、動画を再生
                waitingScreens[currentVideoKey].style.display = 'none'; // 待機画面を非表示
                videoPlayer.style.display = 'block'; // 動画プレイヤーを表示
                videoPlayer.play();
                if (bgmPlayer) {
                    bgmPlayer.pause(); // 動画再生中はBGMを一時停止
                }
                console.log('動画を再生しました。');
            } else if (videoPlayer.style.display === 'block') { // 動画が再生中の場合、一時停止
                if (videoPlayer.paused) {
                    videoPlayer.play();
                    if (bgmPlayer) {
                        bgmPlayer.pause(); // 動画再生中はBGMを一時停止
                    }
                    console.log('動画を再生しました。');
                } else {
                    videoPlayer.pause();
                    if (bgmPlayer) {
                        bgmPlayer.play().catch(e => console.error("BGMの再生に失敗しました:", e)); // 動画一時停止中はBGMを再開
                    }
                    console.log('動画を一時停止しました。');
                }
            }
        } else {
            console.log(`キー '${event.key}' に対応するメディアはありません。`);
        }
    });

    // ページロード時に初期画面を表示
    if (initialScreen) {
        initialScreen.style.display = 'block';
        // if (bgmPlayer) {
        //     bgmPlayer.play().catch(e => console.error("BGMの再生に失敗しました:", e)); // 初期画面でBGMを再生
        // }
    }
});
