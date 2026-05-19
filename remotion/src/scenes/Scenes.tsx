import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';
import { loadFont as loadTamil } from '@remotion/google-fonts/NotoSerifTamil';
import { loadFont as loadDisplay } from '@remotion/google-fonts/PlayfairDisplay';
import { loadFont as loadSans } from '@remotion/google-fonts/Inter';
import { COLORS } from '../theme';
import { ShimmerText } from '../components/Shimmer';

const tamil = loadTamil('normal', { weights: ['700'], subsets: ['tamil'] });
const display = loadDisplay('normal', { weights: ['700', '900'], subsets: ['latin'] });
const sans = loadSans('normal', { weights: ['400', '600'], subsets: ['latin'] });

export const Scene1Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Diamond burst in
  const diamondScale = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const diamondRot = interpolate(frame, [0, 90], [-45, 0]);
  const diamondOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Tamil title rises
  const titleY = spring({ frame: frame - 18, fps, config: { damping: 18, stiffness: 90 } });
  const titleTranslate = interpolate(titleY, [0, 1], [40, 0]);
  const titleOpacity = interpolate(frame, [18, 38], [0, 1], { extrapolateRight: 'clamp' });

  // Tagline
  const tagOpacity = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: 'clamp' });
  const tagY = interpolate(frame, [50, 75], [20, 0], { extrapolateRight: 'clamp' });

  // Ring rotation
  const ringRot = interpolate(frame, [0, 120], [0, 60]);

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* rotating gold ring */}
      <div
        style={{
          position: 'absolute',
          width: 620,
          height: 620,
          borderRadius: '50%',
          border: '1px solid rgba(232,193,106,0.25)',
          transform: `rotate(${ringRot}deg) scale(${0.9 + diamondScale * 0.1})`,
          opacity: diamondOpacity * 0.8,
        }}
      >
        <div style={{
          position: 'absolute', top: -6, left: '50%', width: 12, height: 12,
          borderRadius: '50%', background: COLORS.goldBright,
          boxShadow: '0 0 24px rgba(255,217,138,0.9)',
          transform: 'translateX(-50%)',
        }} />
      </div>
      <div
        style={{
          position: 'absolute',
          width: 760,
          height: 760,
          borderRadius: '50%',
          border: '1px solid rgba(232,193,106,0.12)',
          transform: `rotate(${-ringRot * 0.7}deg)`,
          opacity: diamondOpacity * 0.5,
        }}
      />

      {/* diamond emblem */}
      <div
        style={{
          width: 140,
          height: 140,
          marginBottom: 40,
          background: `linear-gradient(135deg, ${COLORS.goldDeep}, ${COLORS.goldBright}, ${COLORS.goldDeep})`,
          transform: `rotate(${45 + diamondRot}deg) scale(${diamondScale})`,
          opacity: diamondOpacity,
          boxShadow: '0 0 60px rgba(232,193,106,0.6), inset 0 0 30px rgba(255,255,255,0.3)',
          borderRadius: 8,
        }}
      />

      {/* Tamil masthead */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleTranslate}px)`,
          textAlign: 'center',
        }}
      >
        <ShimmerText
          fontSize={160}
          fontFamily={tamil.fontFamily}
          fontWeight={700}
          letterSpacing="-0.02em"
          delay={20}
        >
          மலை நாடு
        </ShimmerText>
      </div>

      {/* English subtitle line */}
      <div
        style={{
          marginTop: 28,
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div style={{ width: 60, height: 1, background: COLORS.gold, opacity: 0.6 }} />
        <span
          style={{
            fontFamily: display.fontFamily,
            fontSize: 32,
            fontWeight: 400,
            color: COLORS.cream,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
          }}
        >
          Malai Naadu
        </span>
        <div style={{ width: 60, height: 1, background: COLORS.gold, opacity: 0.6 }} />
      </div>
    </AbsoluteFill>
  );
};

export const Scene2Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = ['மலேசிய', 'தமிழ்', 'செய்திகள்'];
  const enLines = ['Malaysian', 'Tamil', 'News'];

  return (
    <AbsoluteFill style={{ alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 200 }}>
      {lines.map((line, i) => {
        const sp = spring({ frame: frame - i * 12, fps, config: { damping: 16, stiffness: 100 } });
        const ty = interpolate(sp, [0, 1], [60, 0]);
        const op = interpolate(frame, [i * 12, i * 12 + 20], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{ opacity: op, transform: `translateY(${ty}px)`, marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 32 }}>
            <ShimmerText
              fontSize={180}
              fontFamily={tamil.fontFamily}
              fontWeight={700}
              letterSpacing="-0.02em"
              delay={i * 12}
            >
              {line}
            </ShimmerText>
            <span style={{
              fontFamily: sans.fontFamily,
              fontSize: 22,
              color: COLORS.mute,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}>
              {enLines[i]}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Scene3Headlines: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlines = [
    { tag: 'அரசியல்', text: 'மலேசியா-இந்தியா வர்த்தக ஒப்பந்தம் வலுப்பெறுகிறது' },
    { tag: 'பொருளாதாரம்', text: 'ரிங்கிட் மதிப்பு ஆசிய நாணயங்களில் முன்னேற்றம்' },
    { tag: 'விளையாட்டு', text: 'பேட்மிண்டன் வீரர் சர்வதேச கோப்பையில் வெற்றி' },
  ];

  // Section title
  const titleSp = spring({ frame, fps, config: { damping: 18 } });
  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ padding: 120, flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ opacity: titleOp, transform: `translateX(${interpolate(titleSp, [0, 1], [-30, 0])}px)`, marginBottom: 50, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 8, height: 50, background: COLORS.gold }} />
        <span style={{
          fontFamily: display.fontFamily, fontSize: 44, fontWeight: 700, color: COLORS.cream,
          letterSpacing: '0.05em',
        }}>
          இன்றைய தலைப்புச் செய்திகள்
        </span>
      </div>

      {headlines.map((h, i) => {
        const start = 20 + i * 22;
        const sp = spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 90 } });
        const tx = interpolate(sp, [0, 1], [80, 0]);
        const op = interpolate(frame, [start, start + 25], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{
            opacity: op,
            transform: `translateX(${tx}px)`,
            marginBottom: 28,
            padding: '28px 36px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(232,193,106,0.18)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            backdropFilter: 'blur(0px)',
          }}>
            <span style={{
              fontFamily: tamil.fontFamily,
              fontSize: 18,
              padding: '8px 18px',
              borderRadius: 999,
              background: 'rgba(232,193,106,0.15)',
              color: COLORS.goldBright,
              fontWeight: 700,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}>
              {h.tag}
            </span>
            <span style={{
              fontFamily: tamil.fontFamily,
              fontSize: 38,
              color: COLORS.cream,
              fontWeight: 700,
              flex: 1,
            }}>
              {h.text}
            </span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const Scene4CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp1 = spring({ frame, fps, config: { damping: 16, stiffness: 100 } });
  const sp2 = spring({ frame: frame - 15, fps, config: { damping: 18 } });
  const sp3 = spring({ frame: frame - 30, fps, config: { damping: 20 } });

  const scale = interpolate(sp1, [0, 1], [0.85, 1]);
  const op = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div style={{ opacity: op, transform: `scale(${scale})`, textAlign: 'center' }}>
        <div style={{
          fontFamily: tamil.fontFamily, fontSize: 56, fontWeight: 700, color: COLORS.cream,
          marginBottom: 24, letterSpacing: '-0.01em',
        }}>
          ஒவ்வொரு கணமும் புதிய செய்தி
        </div>
      </div>

      <div style={{
        marginTop: 30,
        opacity: interpolate(sp2, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(sp2, [0, 1], [30, 0])}px)`,
      }}>
        <ShimmerText fontSize={120} fontFamily={display.fontFamily} fontWeight={900} letterSpacing="-0.02em" delay={15}>
          malainaadu.com
        </ShimmerText>
      </div>

      <div style={{
        marginTop: 40,
        opacity: interpolate(sp3, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(sp3, [0, 1], [20, 0])}px)`,
        display: 'flex', gap: 40, alignItems: 'center',
      }}>
        <div style={{ width: 80, height: 1, background: COLORS.gold, opacity: 0.5 }} />
        <span style={{
          fontFamily: sans.fontFamily, fontSize: 20, color: COLORS.mute,
          letterSpacing: '0.5em', textTransform: 'uppercase',
        }}>
          Malaysia · Tamil · 24/7
        </span>
        <div style={{ width: 80, height: 1, background: COLORS.gold, opacity: 0.5 }} />
      </div>
    </AbsoluteFill>
  );
};
