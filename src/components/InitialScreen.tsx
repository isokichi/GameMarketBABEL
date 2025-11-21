import React from 'react';

interface InitialScreenProps {
    currentScreen: 'initial' | 'media' | 'result';
}

const InitialScreen: React.FC<InitialScreenProps> = ({ currentScreen }) => {
    return (
        <div id="initial-screen" className="waiting-screen" style={{ display: currentScreen === 'initial' ? 'flex' : 'none' }}>
            <img src="/images/BABEL_visual_RGB.png" alt="Initial Screen" />
        </div>
    );
};

export default InitialScreen;
