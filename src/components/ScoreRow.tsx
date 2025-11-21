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
  startAnimation: boolean;
  isWinner: boolean;
}> = ({ item, index, maxScore, totalWidth, startAnimation, isWinner }) => {
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
      if (startAnimation) {
        // --- アニメーション開始 ---
        barNode.to({
          width: targetBarWidth,
          duration: 2,
          easing: Konva.Easings.StrongEaseInOut,
          // 【修正】setTimeoutを使ってState更新を非同期にし、エラーを回避
          onFinish: () => {
            setTimeout(() => {
              setAnimationFinished(true);
            }, 0);
          },
        });

        textNode.to({
          x: targetTextX,
          opacity: 1,
          duration: 2,
          easing: Konva.Easings.StrongEaseInOut,
        });
      } else {
        // --- リセット ---
        barNode.width(0);
        textNode.opacity(0);
        textNode.x(barStartX + 15);
        setTimeout(() => {
          setAnimationFinished(false);
        }, 0);
      }
    }
  }, [targetBarWidth, targetTextX, startAnimation]);

  // アニメーション完了かつ優勝チームの場合に強調
  const isHighlighted = isWinner && animationFinished;

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
