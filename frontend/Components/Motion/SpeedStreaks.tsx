import type { CSSProperties } from "react";
import { usePrefersReducedMotion } from "../../src/hook/usePrefersReduceMotion";

export type Streak = {
  top: string;
  width: string;
  duration: number;
  delay?: number;
  tone?: "accent" | "neutral";
};

const DEFAULT_STREAKS: Streak[] = [
  { top: "12%", width: "30%", duration: 2.2 },
  { top: "26%", width: "24%", duration: 2.8, delay: 1.4, tone: "neutral" },
  { top: "36%", width: "28%", duration: 1.7, delay: 2.8, tone: "neutral" },
  { top: "48%", width: "36%", duration: 2.6, delay: 4.2 },
  { top: "63%", width: "26%", duration: 3.1, delay: 5.6, tone: "neutral" },
  { top: "69%", width: "28%", duration: 2.5, delay: 10 },
  { top: "74%", width: "22%", duration: 2.4, delay: 7.0, tone: "neutral" },
  { top: "88%", width: "32%", duration: 3.0, delay: 8.4 },
];

const KEYFRAMES = "@keyframes fd-streak{0%{transform:translateX(-120%)}100%{transform:translateX(420%)}}";

type Props = {
  streaks?: Streak[];
  enabled?: boolean;
  respectReducedMotion?: boolean;
};

const SpeedStreaks = ({ streaks = DEFAULT_STREAKS, enabled = true, respectReducedMotion = false }: Props) => {
  const reduced = usePrefersReducedMotion();
  if (!enabled || (respectReducedMotion && reduced)) return null;

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      <style>{KEYFRAMES}</style>
      {streaks.map((s, i) => {
        const color = s.tone === "neutral" ? "var(--divider-strong, #bfc2b8)" : "var(--color-accent, #c8f53a)";
        const style: CSSProperties = {
          position: "absolute",
          left: 0,
          top: s.top,
          width: s.width,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color})`,
          animationName: "fd-streak",
          animationDuration: `${s.duration}s`,
          animationDelay: `-${s.delay ?? 0}s`,
          animationFillMode: "backwards",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          transform: "translateX(-120%)",
          willChange: "transform",
        };
        return <span key={i} style={style} />;
      })}
    </div>
  );
}

export default SpeedStreaks;
