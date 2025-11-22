import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import {
  BAR_HEIGHT,
  FONT_FAMILY,
  GAP,
  HIGHLIGHT_COLOR,
  NORMAL_COLOR,
  PADDING_X,
  PADDING_Y,
  STROKE_COLOR,
  STROKE_WIDTH,
  type TeamData,
} from "@/App";

const ScoreRow: React.FC<{
  item: TeamData;
  index: number;
  maxScore: number;
  totalWidth: number;
  currentStep: number;
  isWinner: boolean;
  shouldHighlight: boolean; // 新しく追加
}> = ({ item, index, maxScore, totalWidth, currentStep, isWinner, shouldHighlight }) => { // shouldHighlightを受け取る
  const barRef = useRef<Konva.Rect>(null);
  const textRef = useRef<Konva.Text>(null);
  const [animationFinished, setAnimationFinished] = useState(false);

  const yPos = PADDING_Y + index * (BAR_HEIGHT + GAP) + 40;
  const barStartX = PADDING_X + 57;
  const maxBarWidth = totalWidth - barStartX - PADDING_X - 60;

  const targetBarWidth =
    maxScore > 0 ? (item.score / maxScore) * maxBarWidth : 0;
  const targetTextX = barStartX + targetBarWidth + 15;

  useEffect(() => {
    const barNode = barRef.current;
    const textNode = textRef.current;

    if (barNode && textNode) {
      setAnimationFinished(false); // 各ステップのアニメーション開始前にリセット

      // currentStepが0でない場合にアニメーションを開始
      if (currentStep > 0) {
        // --- アニメーション開始 ---
        barNode.to({
          width: targetBarWidth,
          duration: 1.5, // アニメーション速度を1.5秒に調整
          easing: Konva.Easings.StrongEaseInOut,
          onFinish: () => {
            setAnimationFinished(true);
          },
        });

        textNode.to({
          x: targetTextX,
          opacity: 1,
          duration: 1.5, // アニメーション速度を1.5秒に調整
          easing: Konva.Easings.StrongEaseInOut,
        });
      } else {
        // --- リセット（currentStep === 0の場合）---
        barNode.width(0); // 初期状態ではバーを非表示
        textNode.opacity(0); // テキストも非表示
        textNode.x(barStartX + 15);
        // setAnimationFinished(false) はuseEffect冒頭で既に実行されているため、ここでは不要
      }
    }
  }, [targetBarWidth, targetTextX, currentStep, barStartX]); // barStartXも依存配列に追加

  // ハイライト条件をshouldHighlightとアニメーション完了に依存させる
  const isHighlighted = shouldHighlight && animationFinished;

  return (
    <Group y={yPos}>
      <Rect
        ref={barRef}
        x={barStartX}
        y={-BAR_HEIGHT / 2}
        width={0}
        height={BAR_HEIGHT}
        stroke={isHighlighted ? HIGHLIGHT_COLOR : STROKE_COLOR}
        strokeWidth={STROKE_WIDTH}
        fill={isHighlighted ? HIGHLIGHT_COLOR : NORMAL_COLOR}
        cornerRadius={2}
        shadowColor={HIGHLIGHT_COLOR}
        shadowBlur={isHighlighted ? 20 : 0}
        shadowOpacity={isHighlighted ? 0.8 : 0}
      />
      <Text
        ref={textRef}
        x={barStartX + 15}
        y={-10}
        text={item.score.toString()}
        fontSize={24}
        fontStyle="bold"
        fontFamily={FONT_FAMILY}
        fill={isHighlighted ? HIGHLIGHT_COLOR : STROKE_COLOR}
        opacity={0}
        shadowColor={HIGHLIGHT_COLOR}
        shadowBlur={isHighlighted ? 10 : 0}
        shadowOpacity={isHighlighted ? 0.6 : 0}
      />
    </Group>
  );
};

export default ScoreRow;
