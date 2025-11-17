document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const mediaContainer = document.getElementById('media-container');
    const spreadsheetInfoDiv = document.getElementById('spreadsheet-info');
    const a1ValueSpan = document.getElementById('a1-value');

    // GASウェブアプリのURL (fetch API用)
    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwRp9p623y1tLQhEljZpYZDhMDJ-NYsxgwByi8Y6F6sdmCLvYVdze_d8-IxX7lLdVUSwQ/exec';

    // メディアファイルのパスを定義します。
    // ここに実際の動画ファイルのパスを設定してください。
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

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase(); // 小文字に変換してキーを比較

        // すべてのメディアを停止し、非表示にするヘルパー関数
        const stopAllMedia = () => {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            videoPlayer.style.display = 'none';
        };

        if (videoSources[key]) {
            stopAllMedia();
            videoPlayer.src = videoSources[key];
            videoPlayer.style.display = 'block';
            videoPlayer.play();
            console.log(`動画を再生: ${videoSources[key]}`);
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
        } else {
            console.log(`キー '${event.key}' に対応するメディアはありません。`);
        }
    });
});
