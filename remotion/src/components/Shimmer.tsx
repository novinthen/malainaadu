import { useCurrentFrame, interpolate } from 'remotion';

// Gold shimmer text that sweeps a highlight across the letters
export const ShimmerText: React.FC<{
  children: React.ReactNode;
  fontSize: number;
  fontFamily: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  delay?: number;
}> = ({ children, fontSize, fontFamily, fontWeight = 700, letterSpacing = '0', delay = 0 }) => {
  const frame = useCurrentFrame();
  const t = (frame - delay) / 90; // sweep cycle
  const sweep = interpolate(t % 1, [0, 1], [-50, 150]);

  return (
    <span
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight: 1,
        backgroundImage: `linear-gradient(100deg,
          #A8802E 0%,
          #E8C16A 25%,
          #FFF4D0 ${sweep}%,
          #E8C16A ${sweep + 8}%,
          #A8802E 100%)`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  );
};
