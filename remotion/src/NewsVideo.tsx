import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { loadFont as loadTamil } from '@remotion/google-fonts/NotoSerifTamil';
import { loadFont as loadSans } from '@remotion/google-fonts/Inter';
import { loadFont as loadDisplay } from '@remotion/google-fonts/PlayfairDisplay';
import { COLORS } from './theme';
import { ShimmerText } from './components/Shimmer';
import { Background, FloatingOrbs } from './components/Background';

const tamil = loadTamil('normal', { weights: ['700'], subsets: ['tamil'] });
const sans = loadSans('normal', { weights: ['400', '600'], subsets: ['latin'] });
const display = loadDisplay('normal', { weights: ['700', '900'], subsets: ['latin'] });

const ARTICLE = {
  category: 'விளையாட்டு',
  kicker: 'புதிய செய்தி',
  title: 'ISTAF உலகக் கிண்ணம்: மலேசியாவுக்கு குவாட்ரன் கோப்பை! மீண்டும் சாம்பியன் பட்டம்!',
  excerpt:
    'ISTAF உலகக் கிண்ணத்தில் மலேசியாவின் குவாட்ரன் அணி, இந்தியாவை தோற்கடித்து தனது சாம்பியன் பட்டத்தை வெற்றிகரமாகத் தக்கவைத்துக் கொண்டது.',
  image: 'images/news.webp',
};

// ---------- Scene 1: Brand + category intro ----------
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeSp = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const badgeOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });
  const badgeY = interpolate(badgeSp, [0, 1], [40, 0]);

  const titleOp = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: 'clamp' });
  const titleSp = spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 90 } });
  const titleY = interpolate(titleSp, [0, 1], [60, 0]);

  const lineW = interpolate(frame, [40, 80], [0, 360], { extrapolateRight: 'clamp' });
  const kickerOp = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      {/* Category badge */}
      <div
        style={{
          opacity: badgeOp,
          transform: `translateY(${badgeY}px)`,
          padding: '14px 36px',
          borderRadius: 999,
          background: 'rgba(232,193,106,0.15)',
          border: '1px solid rgba(232,193,106,0.45)',
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontFamily: tamil.fontFamily,
            color: COLORS.goldBright,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          {ARTICLE.category}
        </span>
      </div>

      {/* Mast */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, textAlign: 'center' }}>
        <ShimmerText
          fontSize={140}
          fontFamily={tamil.fontFamily}
          fontWeight={700}
          letterSpacing="-0.02em"
          delay={20}
        >
          மலை நாடு
        </ShimmerText>
      </div>

      {/* Divider line that grows */}
      <div
        style={{
          marginTop: 30,
          height: 1,
          width: lineW,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
        }}
      />

      {/* Kicker */}
      <div
        style={{
          opacity: kickerOp,
          marginTop: 28,
          fontFamily: tamil.fontFamily,
          fontSize: 28,
          color: COLORS.cream,
          letterSpacing: '0.5em',
        }}
      >
        {ARTICLE.kicker}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: Image with Ken Burns + headline rise ----------
const SceneImage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Image entrance: clip-path reveal + slow zoom
  const reveal = spring({ frame, fps, config: { damping: 22, stiffness: 70 } });
  const clip = interpolate(reveal, [0, 1], [100, 0]);
  const zoom = interpolate(frame, [0, durationInFrames], [1.05, 1.18]);
  const drift = interpolate(frame, [0, durationInFrames], [-2, 2]);

  // Headline card rises from bottom at ~frame 30
  const cardSp = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 80 } });
  const cardY = interpolate(cardSp, [0, 1], [120, 0]);
  const cardOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' });

  // Tag pill
  const tagOp = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {/* Image with reveal mask */}
      <AbsoluteFill
        style={{
          clipPath: `inset(${clip}% 0 0 0)`,
        }}
      >
        <Img
          src={staticFile(ARTICLE.image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom}) translateX(${drift}%)`,
          }}
        />
        {/* Image gradient overlay for legibility */}
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,10,0.55) 0%, rgba(5,5,10,0) 30%, rgba(5,5,10,0) 45%, rgba(5,5,10,0.85) 85%, rgba(5,5,10,0.98) 100%)',
          }}
        />
      </AbsoluteFill>

      {/* Top tag */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 100,
          opacity: tagOp,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: COLORS.red,
            boxShadow: '0 0 24px rgba(200,69,58,0.9)',
          }}
        />
        <span
          style={{
            fontFamily: sans.fontFamily,
            color: COLORS.cream,
            fontSize: 22,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Malai Naadu · {ARTICLE.kicker}
        </span>
      </div>

      {/* Headline card */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 100,
          padding: '0 100px',
          opacity: cardOp,
          transform: `translateY(${cardY}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '8px 22px',
            borderRadius: 8,
            background: COLORS.gold,
            color: COLORS.bgDeep,
            fontFamily: tamil.fontFamily,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginBottom: 28,
          }}
        >
          {ARTICLE.category}
        </div>
        <div
          style={{
            fontFamily: tamil.fontFamily,
            fontSize: 72,
            lineHeight: 1.15,
            color: COLORS.cream,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textShadow: '0 4px 30px rgba(0,0,0,0.6)',
            maxWidth: 1500,
          }}
        >
          {ARTICLE.title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 3: Excerpt + CTA ----------
const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp1 = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const exOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const exY = interpolate(sp1, [0, 1], [40, 0]);

  const ctaOp = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: 'clamp' });
  const ctaSp = spring({ frame: frame - 30, fps, config: { damping: 16 } });
  const ctaScale = interpolate(ctaSp, [0, 1], [0.85, 1]);

  const tailOp = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ padding: '0 140px', justifyContent: 'center', flexDirection: 'column' }}>
      {/* Accent bar */}
      <div
        style={{
          width: interpolate(frame, [0, 30], [0, 8], { extrapolateRight: 'clamp' }),
          height: 80,
          background: COLORS.gold,
          marginBottom: 36,
        }}
      />
      <div
        style={{
          opacity: exOp,
          transform: `translateY(${exY}px)`,
          fontFamily: tamil.fontFamily,
          fontSize: 48,
          lineHeight: 1.4,
          color: COLORS.cream,
          fontWeight: 700,
          maxWidth: 1400,
        }}
      >
        {ARTICLE.excerpt}
      </div>

      <div
        style={{
          marginTop: 80,
          opacity: ctaOp,
          transform: `scale(${ctaScale})`,
          transformOrigin: 'left center',
        }}
      >
        <ShimmerText
          fontSize={110}
          fontFamily={display.fontFamily}
          fontWeight={900}
          letterSpacing="-0.02em"
          delay={30}
        >
          malainaadu.com
        </ShimmerText>
      </div>

      <div
        style={{
          marginTop: 40,
          opacity: tailOp,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        <div style={{ width: 80, height: 1, background: COLORS.gold, opacity: 0.6 }} />
        <span
          style={{
            fontFamily: sans.fontFamily,
            fontSize: 20,
            color: COLORS.mute,
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
          }}
        >
          Malaysia · Tamil · 24/7
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Crossfade helper ----------
const Fade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 14, duration - 18, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ---------- Root ----------
// Scene1 0-100, Scene2 90-280, Scene3 270-390  -> total 390 frames (~13s)
export const NewsVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bgDeep }}>
      <Background />
      <FloatingOrbs />

      <Sequence from={0} durationInFrames={100}>
        <Fade duration={100}><SceneIntro /></Fade>
      </Sequence>
      <Sequence from={90} durationInFrames={190}>
        <Fade duration={190}><SceneImage /></Fade>
      </Sequence>
      <Sequence from={270} durationInFrames={120}>
        <Fade duration={120}><SceneOutro /></Fade>
      </Sequence>
    </AbsoluteFill>
  );
};
