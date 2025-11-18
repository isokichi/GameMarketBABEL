document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const mediaContainer = document.getElementById('media-container');
    const spreadsheetInfoDiv = document.getElementById('spreadsheet-info');
    const a1ValueSpan = document.getElementById('a1-value');

    // GASウェブアプリのURL (fetch API用)
    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbzkhwOzbSe1VY1po5OT6UObPiyChjZg0lysJrFYLNwFHqxsIvRu4LTq1CM1jwqasAImGQ/exec';

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

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase(); // 小文字に変換してキーを比較

        // すべてのメディアと待機画面を停止し、非表示にするヘルパー関数
        const stopAllMediaAndScreens = () => {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            videoPlayer.style.display = 'none';
            Object.values(waitingScreens).forEach(screen => {
                if (screen) screen.style.display = 'none';
            });
            currentVideoKey = null;
        };

        if (videoSources[key]) {
            stopAllMediaAndScreens(); // すべてをリセット
            currentVideoKey = key;
            videoPlayer.src = videoSources[key];
            // videoPlayer.style.display = 'none'; // 動画プレイヤーは非表示のまま
            if (waitingScreens[key]) {
                waitingScreens[key].style.display = 'flex'; // 対応する待機画面を表示
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
        } else if (key === 'l') { // 'L' キーでスプレッドシートのA1セルの情報を表示 (fetch APIを使用)
            spreadsheetInfoDiv.style.display = 'block';
            a1ValueSpan.textContent = '読み込み中...';

            fetch(gasWebAppUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        a1ValueSpan.textContent = `エラー: ${data.error}`;
                        console.error(`スプレッドシートA1セルの読み込みに失敗しました: ${data.error}`);
                    } else {
                        a1ValueSpan.textContent = data.a1Value;
                        console.log(`スプレッドシートA1セルの情報: ${data.a1Value}`);
                    }
                })
                .catch(error => {
                    a1ValueSpan.textContent = `通信エラー: ${error.message}`;
                    console.error(`スプレッドシートA1セルの読み込み中に通信エラーが発生しました: ${error.message}`);
                });
        } else if (key === ' ') { // スペースキーで再生/停止を切り替える
            if (currentVideoKey && waitingScreens[currentVideoKey] && waitingScreens[currentVideoKey].style.display === 'flex') {
                // 待機画面が表示されている場合、動画を再生
                waitingScreens[currentVideoKey].style.display = 'none'; // 待機画面を非表示
                videoPlayer.style.display = 'block'; // 動画プレイヤーを表示
                videoPlayer.play();
                console.log('動画を再生しました。');
            } else if (videoPlayer.style.display === 'block') { // 動画が再生中の場合、一時停止
                if (videoPlayer.paused) {
                    videoPlayer.play();
                    console.log('動画を再生しました。');
                } else {
                    videoPlayer.pause();
                    console.log('動画を一時停止しました。');
                }
            }
        } else {
            console.log(`キー '${event.key}' に対応するメディアはありません。`);
        }
    });
});
