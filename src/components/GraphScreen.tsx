import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import useImage from "use-image";
import bgImageSrc from "@/assets/result_bg.webp";
// ボーナススコア定数をインポート
import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH, type TeamData, SONG_BONUS_SCORE, VARIABLE_BONUS_SCORE, DANCE_BONUS_SCORE } from "@/App";
import ScoreRow from "@/components/ScoreRow";

const GraphScreen: React.FC<{
  data: TeamData[];
}> = ({ data }) => {
  const maxScore = Math.max(...data.map((d) => d.finalScore)); // maxScoreは最終スコアから計算
  const [bgImg] = useImage(bgImageSrc, "anonymous");

  const [currentStep, setCurrentStep] = useState(0); // 0: 初期表示 (素点のみ), 1: 曲ボーナス加算, 2: 可変ボーナス加算, 3: ダンスボーナス加算, 4: 最終合計
  const totalSteps = 4; // 素点、曲ボーナス、可変ボーナス、ダンスボーナス、最終の5段階 (0-4)

  const [dimensions, setDimensions] = useState({
    width: VIRTUAL_WIDTH,
    height: VIRTUAL_HEIGHT,
    scale: 1,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setCurrentStep((prevStep) => Math.min(prevStep + 1, totalSteps)); // ステップを進める
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // totalStepsは定数なので依存配列から削除

  useEffect(() => {
    const handleResize = () => {
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const targetRatio = 16 / 9;
      let newWidth = windowW;
      let newHeight = windowH;

      if (windowW / windowH > targetRatio) {
        newWidth = windowH * targetRatio;
        newHeight = windowH;
      } else {
        newWidth = windowW;
        newHeight = windowW / targetRatio;
      }

      setDimensions({
        width: newWidth,
        height: newHeight,
        scale: newWidth / VIRTUAL_WIDTH,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#000",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scale={{ x: dimensions.scale, y: dimensions.scale }}
      >
        <Layer>
          <Rect
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            fillPatternImage={bgImg}
            fillPatternRepeat="no-repeat"
            fillPatternScale={{
              x: VIRTUAL_WIDTH / (bgImg?.width || 1),
              y: VIRTUAL_HEIGHT / (bgImg?.height || 1),
            }}
          />
          {data.map((item, index) => {
            let displayedScore = 0; // 初期値を0にする

            // 各ステップで加算されるボーナスを判断
            if (currentStep >= 1 && item.songBonusAchieved) {
                displayedScore += SONG_BONUS_SCORE; // 1回目で曲ボーナス
            }
            if (currentStep >= 2) { // 2回目で可変ボーナス
                displayedScore += item.variableBonusesAchieved.filter(b => b).length * VARIABLE_BONUS_SCORE;
            }
            if (currentStep >= 3 && item.danceBonusAchieved) {
                displayedScore += DANCE_BONUS_SCORE; // 3回目でダンスボーナス
            }
            if (currentStep >= 4) { // 4回目で素点 (totalStepsは4なので、currentStepが4の時に実行)
                displayedScore += item.baseScore;
            }
            // finalScoreを表示するロジックは削除し、各ボーナスと素点の合計を表示するように変更

            return (
            <ScoreRow
              key={item.id}
              item={{ ...item, score: displayedScore }} // 計算されたスコアを渡す
              index={index}
              maxScore={maxScore}
              totalWidth={VIRTUAL_WIDTH}
              currentStep={currentStep} // startAnimationの代わりにcurrentStepを渡す
              isWinner={maxScore > 0 && item.finalScore === maxScore} // これは純粋な最終勝者判定
              shouldHighlight={currentStep === totalSteps && maxScore > 0 && item.finalScore === maxScore} // ハイライト条件を追加
            />
          )})}
        </Layer>
      </Stage>

      {/* <button
        onClick={onBack}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          border: "1px solid white",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        Edit Scores
      </button> */}
    </div>
  );
};
export default GraphScreen;
