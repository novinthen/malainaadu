import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { Background, FloatingOrbs } from './components/Background';
import { Scene1Logo, Scene2Tagline, Scene3Headlines, Scene4CTA } from './scenes/Scenes';

// Crossfade wrapper for each scene
const Fade: React.FC<{ from: number; duration: number; children: React.ReactNode }> = ({
  from, duration, children,
}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const opacity = interpolate(
    local,
    [0, 12, duration - 18, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const MainVideo: React.FC = () => {
  // Scene timings (overlap by ~18f for crossfade)
  // Scene1: 0-120, Scene2: 110-230, Scene3: 220-360, Scene4: 350-450
  return (
    <AbsoluteFill style={{ background: '#05050A' }}>
      <Background />
      <FloatingOrbs />

      <Sequence from={0} durationInFrames={130}>
        <Fade from={0} duration={130}><Scene1Logo /></Fade>
      </Sequence>
      <Sequence from={110} durationInFrames={130}>
        <Fade from={0} duration={130}><Scene2Tagline /></Fade>
      </Sequence>
      <Sequence from={220} durationInFrames={150}>
        <Fade from={0} duration={150}><Scene3Headlines /></Fade>
      </Sequence>
      <Sequence from={360} durationInFrames={90}>
        <Fade from={0} duration={90}><Scene4CTA /></Fade>
      </Sequence>
    </AbsoluteFill>
  );
};
