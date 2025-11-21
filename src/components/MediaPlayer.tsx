import React, { useRef, useEffect, useState, useCallback } from 'react';

// 動画ソースのマッピング (App.tsxから移植)
const videoSources: Record<string, string> = {
    'q': '/videos/Tr01.mp4',
    'w': '/videos/Tr02.mp4',
    'e': '/videos/Tr03.mp4',
    'r': '/videos/Tr04.mp4',
    't': '/videos/Tr05.mp4',
    'y': '/videos/Tr06.mp4',
    'u': '/videos/Tr07.mp4',
    'i': '/videos/Tr08.mp4',
    'o': '/videos/Tr09.mp4',
    'p': '/videos/Tr10.mp4',
    'a': '/videos/Tr11.mp4',
    's': '/videos/Tr12.mp4'
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

import type { Dispatch, SetStateAction } from 'react'; // DispatchとSetStateActionを型としてインポート

interface MediaPlayerProps {
    onVideoEnded: () => void;
    currentScreen: 'initial' | 'media' | 'result';
    isBgmPlaying: boolean;
    onBgmPlayToggle: (play: boolean) => void;
    bonusNumbers: number[]; // App.tsxから受け取るボーナス数字
    setBonusNumbers: Dispatch<SetStateAction<number[]>>; // App.tsxから受け取るsetBonusNumbers
    initialVideoKey: string | null; // App.tsxから受け取る初期動画キー
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ onVideoEnded, currentScreen, isBgmPlaying, onBgmPlayToggle, bonusNumbers, setBonusNumbers, initialVideoKey }) => {
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const bgmPlayerRef = useRef<HTMLAudioElement>(null);
    const [currentVideoKey, setCurrentVideoKey] = useState<string | null>(initialVideoKey); // 初期値をinitialVideoKeyにする
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [showWaitingScreen, setShowWaitingScreen] = useState(false);
    const [showPausedMessage, setShowPausedMessage] = useState(false); // 一時停止メッセージ表示ステート

    // BGM再生/一時停止のロジック
    useEffect(() => {
        if (bgmPlayerRef.current) {
            if (isBgmPlaying) {
                bgmPlayerRef.current.currentTime = 0; // 最初から再生
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

    // initialVideoKeyの変更を監視し、動画をロードする
    useEffect(() => {
        if (currentScreen === 'media' && initialVideoKey && videoSources[initialVideoKey]) {
            if (videoPlayerRef.current) {
                videoPlayerRef.current.src = videoSources[initialVideoKey];
                setCurrentVideoKey(initialVideoKey);
                setShowWaitingScreen(true); // 待機画面を表示
                setIsVideoPlaying(false); // 動画はまだ再生されていない
                setShowPausedMessage(false); // ロード時は一時停止メッセージを非表示
                // onBgmPlayToggle(false); // App.tsxでBGMを停止しているため不要
                console.log(`MediaPlayer: initialVideoKeyで動画をロード: ${videoSources[initialVideoKey]}。待機画面を表示中。スペースキーで再生/停止。`);
            }
        } else if (currentScreen !== 'media' && initialVideoKey === null) {
            // initialVideoKeyがクリアされた場合、currentVideoKeyもクリア
            setCurrentVideoKey(null);
            setShowWaitingScreen(false);
            setIsVideoPlaying(false);
            setShowPausedMessage(false); // 他の画面では一時停止メッセージを非表示
        }
    }, [currentScreen, initialVideoKey]); // initialVideoKeyとcurrentScreenを監視

    // キーボードイベントハンドラ
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        if (currentScreen !== 'media') return; // media画面以外ではメディア操作を受け付けない

        // 動画ロードのロジックはinitialVideoKeyのuseEffectで処理するため削除

        if (key === 'f') { // 'F' キーでフルスクリーンを切り替える
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
                    setShowPausedMessage(false); // 再生時は一時停止メッセージを非表示
                    onBgmPlayToggle(false); // 動画再生中はBGMを一時停止
                    // setBonusNumbers([]); // 動画再生開始でボーナスカードを非表示 (App.tsxで管理)
                    console.log('動画を再生しました。');
                } else if (isVideoPlaying) {
                    // 動画が再生中の場合、一時停止
                    videoPlayerRef.current.pause();
                    setIsVideoPlaying(false);
                    setShowPausedMessage(true); // 一時停止時はメッセージを表示
                    // onBgmPlayToggle(true); // 動画一時停止中はBGMを流さない
                    console.log('動画を一時停止しました。');
                } else {
                    // 動画が一時停止中の場合、再生
                    videoPlayerRef.current.play();
                    setIsVideoPlaying(true);
                    setShowPausedMessage(false); // 再生時は一時停止メッセージを非表示
                    onBgmPlayToggle(false); // 動画再生中はBGMを一時停止
                    console.log('動画を再生しました。');
                }
            }
        } else {
            console.log(`キー '${event.key}' に対応するメディアはありません。`);
        }
    }, [currentScreen, currentVideoKey, isVideoPlaying, showWaitingScreen, onBgmPlayToggle, setBonusNumbers, setShowPausedMessage]);

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
                <div id={`waiting-screen-${currentVideoKey}`} className="waiting-screen" style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img src={waitingImageSources[currentVideoKey]} alt={`Waiting Screen ${currentVideoKey}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    
                    {/* ボーナスカードの表示 */}
                    {bonusNumbers.length > 0 && bonusNumbers.map((num, index) => {
                        const positions = [
                            // ミスったので現地調整
                            { top: '41.7%', left: '52.8%', height: '24.8%' }, // 1枚目
                            { top: '41.7%', left: '69.0%', height: '24.8%' }, // 2枚目
                            { top: '67.9%', left: '52.8%', height: '24.8%' }, // 3枚目
                            { top: '67.9%', left: '69.0%', height: '24.8%' }, // 4枚目
                        ];
                        const style = positions[index] || {}; // 指定がない場合は空オブジェクト

                        return (
                            <img
                                key={index}
                                src={`/images/bonuscard${num.toString().padStart(2, '0')}.png`}
                                alt={`Bonus Card ${num}`}
                                style={{
                                    position: 'absolute',
                                    backgroundColor: 'rgba(0, 0, 0, 0)', // 半透明の背景を完全に透明に
                                    zIndex: 10, // 待機画面の上に表示
                                    ...style, // 指定された位置とサイズを適用
                                }}
                            />
                        );
                    })}
                </div>
            )}
            {/* 一時停止メッセージ */}
            {showPausedMessage && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '3em',
                    padding: '20px 40px',
                    borderRadius: '10px',
                    zIndex: 20,
                }}>
                    一時停止中
                </div>
            )}
        </div>
    );
};

export default MediaPlayer;
