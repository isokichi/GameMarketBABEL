import React, { useRef, useEffect, useState, useCallback } from 'react';

// 動画ソースのマッピング (App.tsxから移植)
const videoSources: Record<string, string> = {
    'q': '/videos/01.mp4',
    'w': '/videos/02.mp4',
    'e': '/videos/03.mp4',
    'r': '/videos/04.mp4',
    't': '/videos/05.mp4',
    'y': '/videos/06.mp4',
    'u': '/videos/07.mp4',
    'i': '/videos/08.mp4',
    'o': '/videos/09.mp4',
    'p': '/videos/10.mp4',
    'a': '/videos/11.mp4',
    's': '/videos/12.mp4'
};

// 待機画面画像のパス
const waitingImageSources: Record<string, string> = {
    'q': '/images/scoreboard01.png',
    'w': '/images/scoreboard02.png',
    'e': '/images/scoreboard03.png',
    'r': '/images/scoreboard04.png',
    't': '/images/scoreboard05.png',
    'y': '/images/scoreboard06.png',
    'u': '/images/scoreboard07.png',
    'i': '/images/scoreboard08.png',
    'o': '/images/scoreboard09.png',
    'p': '/images/scoreboard10.png',
    'a': '/images/scoreboard11.png',
    's': '/images/scoreboard12.png'
};

interface MediaPlayerProps {
    onVideoEnded: () => void;
    currentScreen: 'initial' | 'media' | 'result';
    isBgmPlaying: boolean;
    onBgmPlayToggle: (play: boolean) => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ onVideoEnded, currentScreen, isBgmPlaying, onBgmPlayToggle }) => {
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const bgmPlayerRef = useRef<HTMLAudioElement>(null);
    const [currentVideoKey, setCurrentVideoKey] = useState<string | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [showWaitingScreen, setShowWaitingScreen] = useState(false);
    const [isInitialBgmPlayed, setIsInitialBgmPlayed] = useState(false);

    // BGM再生/一時停止のロジック
    useEffect(() => {
        if (bgmPlayerRef.current) {
            if (isBgmPlaying) {
                bgmPlayerRef.current.play().catch((e: unknown) => console.error("BGMの再生に失敗しました:", e));
            } else {
                bgmPlayerRef.current.pause();
            }
        }
    }, [isBgmPlaying]);

    // 動画再生終了時の処理
    const handleVideoEnded = useCallback(() => {
        setIsVideoPlaying(false);
        setCurrentVideoKey(null);
        onVideoEnded(); // 親コンポーネントに通知
        onBgmPlayToggle(true); // 動画終了でBGM再開
    }, [onVideoEnded, onBgmPlayToggle]);

    useEffect(() => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.addEventListener('ended', handleVideoEnded);
            return () => {
                videoPlayerRef.current?.removeEventListener('ended', handleVideoEnded);
            };
        }
    }, [handleVideoEnded]);

    // キーボードイベントハンドラ
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        // 最初のキー入力でBGMを再生
        if (!isInitialBgmPlayed && bgmPlayerRef.current) {
            bgmPlayerRef.current.play().then(() => {
                setIsInitialBgmPlayed(true);
                onBgmPlayToggle(true);
                console.log("最初のユーザー操作でBGMを再生しました。");
            }).catch((e: unknown) => console.error("最初のBGM再生に失敗しました:", e));
        }

        if (currentScreen !== 'media') return; // media画面以外ではメディア操作を受け付けない

        if (videoSources[key]) {
            // 新しい動画をロード
            if (videoPlayerRef.current) {
                videoPlayerRef.current.src = videoSources[key];
                setCurrentVideoKey(key);
                setShowWaitingScreen(true); // 待機画面を表示
                setIsVideoPlaying(false); // 動画はまだ再生されていない
                onBgmPlayToggle(false); // BGMを一時停止
                console.log(`動画をロード: ${videoSources[key]}。待機画面を表示中。スペースキーで再生/停止。`);
            }
        } else if (key === 'f') { // 'F' キーでフルスクリーンを切り替える
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch((err: unknown) => {
                    console.error(`フルスクリーンモードへの切り替えに失敗しました:`, err);
                });
            } else {
                document.exitFullscreen();
            }
            console.log(`フルスクリーンモードを切り替えました。`);
        } else if (key === ' ') { // スペースキーで再生/停止を切り替える
            if (currentVideoKey && videoPlayerRef.current) {
                if (showWaitingScreen) {
                    // 待機画面が表示されている場合、動画を再生
                    setShowWaitingScreen(false); // 待機画面を非表示
                    videoPlayerRef.current.play();
                    setIsVideoPlaying(true);
                    onBgmPlayToggle(false); // 動画再生中はBGMを一時停止
                    console.log('動画を再生しました。');
                } else if (isVideoPlaying) {
                    // 動画が再生中の場合、一時停止
                    videoPlayerRef.current.pause();
                    setIsVideoPlaying(false);
                    onBgmPlayToggle(true); // 動画一時停止中はBGMを再開
                    console.log('動画を一時停止しました。');
                } else {
                    // 動画が一時停止中の場合、再生
                    videoPlayerRef.current.play();
                    setIsVideoPlaying(true);
                    onBgmPlayToggle(false); // 動画再生中はBGMを一時停止
                    console.log('動画を再生しました。');
                }
            }
        } else {
            console.log(`キー '${event.key}' に対応するメディアはありません。`);
        }
    }, [currentScreen, currentVideoKey, isVideoPlaying, showWaitingScreen, onBgmPlayToggle, isInitialBgmPlayed]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div id="media-container" style={{ display: currentScreen === 'media' ? 'flex' : 'none' }}>
            <video id="videoPlayer" ref={videoPlayerRef} controls={false} style={{ display: (isVideoPlaying || showWaitingScreen) ? 'block' : 'none' }}></video>
            <audio id="bgmPlayer" ref={bgmPlayerRef} src="/audio/BGM.wav" loop></audio>

            {/* 各動画の待機画面 */}
            {currentVideoKey && showWaitingScreen && waitingImageSources[currentVideoKey] && (
                <div id={`waiting-screen-${currentVideoKey}`} className="waiting-screen">
                    <img src={waitingImageSources[currentVideoKey]} alt={`Waiting Screen ${currentVideoKey}`} />
                </div>
            )}
        </div>
    );
};

export default MediaPlayer;
