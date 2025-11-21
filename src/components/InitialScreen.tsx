import React from 'react';

interface InitialScreenProps {
    currentScreen: 'initial' | 'media' | 'result';
    showStartMessage: boolean; // 開始メッセージ表示フラグ
}

const InitialScreen: React.FC<InitialScreenProps> = ({ currentScreen, showStartMessage }) => {
    return (
        <div id="initial-screen" className="waiting-screen" style={{ display: currentScreen === 'initial' ? 'flex' : 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/images/BABEL_visual_RGB.png" alt="Initial Screen" style={{ maxWidth: '80%', maxHeight: '80%' }} />
            {showStartMessage && (
                <p style={{ color: 'white', fontSize: '2em', marginTop: '20px' }}>いずれかのキーを押して開始</p>
            )}
        </div>
    );
};

export default InitialScreen;
