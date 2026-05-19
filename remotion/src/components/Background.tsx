import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../theme';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  // slow drifting radial gradient
  const x = interpolate(t, [0, 1], [30, 70]);
  const y = interpolate(t, [0, 1], [40, 60]);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at ${x}% ${y}%, rgba(232,193,106,0.18) 0%, rgba(168,128,46,0.08) 28%, ${COLORS.bgDeep} 65%)`,
        }}
      />
      {/* subtle grain via repeating gradient */}
      <AbsoluteFill
        style={{
          opacity: 0.35,
          background:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
        }}
      />
      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const FloatingOrbs: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 15, y: 25, size: 280, speed: 0.4, hue: 'rgba(232,193,106,0.25)' },
    { x: 80, y: 70, size: 360, speed: -0.3, hue: 'rgba(200,69,58,0.18)' },
    { x: 65, y: 20, size: 220, speed: 0.6, hue: 'rgba(255,217,138,0.2)' },
    { x: 25, y: 80, size: 200, speed: -0.5, hue: 'rgba(232,193,106,0.18)' },
  ];
  return (
    <AbsoluteFill>
      {orbs.map((o, i) => {
        const dy = Math.sin((frame * o.speed) / 30) * 40;
        const dx = Math.cos((frame * o.speed) / 40) * 30;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.size,
              height: o.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${o.hue} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              transform: `translate(${dx}px, ${dy}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
