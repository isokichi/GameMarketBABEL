import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import useImage from "use-image";
import bgImageSrc from "@/assets/result_bg.webp";
import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH, type TeamData } from "@/App";
import ScoreRow from "@/components/ScoreRow";

const GraphScreen: React.FC<{
  data: TeamData[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}> = ({ data }) => {
  const maxScore = Math.max(...data.map((d) => d.score));
  const [bgImg] = useImage(bgImageSrc, "anonymous");

  const [startAnimation, setStartAnimation] = useState(false);

  const [dimensions, setDimensions] = useState({
    width: VIRTUAL_WIDTH,
    height: VIRTUAL_HEIGHT,
    scale: 1,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setStartAnimation(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
          {data.map((item, index) => (
            <ScoreRow
              key={item.id}
              item={item}
              index={index}
              maxScore={maxScore}
              totalWidth={VIRTUAL_WIDTH}
              startAnimation={startAnimation}
              isWinner={maxScore > 0 && item.score === maxScore}
            />
          ))}
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
