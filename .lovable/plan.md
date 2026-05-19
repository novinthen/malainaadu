## Goal
Add audio to `malai-naadu-latest-news.mp4`: a Tamil AI voiceover reading the headline + excerpt, layered over a soft cinematic music bed, then re-render the MP4.

## What I need from you
Your **ElevenLabs API key** (free tier works). I'll request it via the secrets tool once you approve this plan. Get it from elevenlabs.io → Profile → API Keys.

## Steps

1. **Store `ELEVENLABS_API_KEY`** as a secret.

2. **Generate the voiceover** (one-shot script via `code--exec`, output to `remotion/public/audio/voice.mp3`):
   - Model: `eleven_multilingual_v2` (handles Tamil)
   - Voice: Sarah (`EXAVITQu4vr4xnSDxMaL`) — clear female news read
   - Text: `"விளையாட்டு செய்தி. ISTAF உலகக் கிண்ணம். மலேசியாவுக்கு குவாட்ரன் கோப்பை. மீண்டும் சாம்பியன் பட்டம். <excerpt>"`
   - Settings: stability 0.6, similarity_boost 0.8, speed 1.0

3. **Generate the music bed** (ElevenLabs Music API → `remotion/public/audio/music.mp3`):
   - Prompt: "Cinematic news intro bed, subtle orchestral swell with soft taiko drum and shimmering strings, hopeful and triumphant, no vocals, 13 seconds"
   - Duration: 13s

4. **Wire audio into `remotion/src/NewsVideo.tsx`**:
   ```tsx
   <Audio src={staticFile('audio/music.mp3')} volume={0.18} />
   <Audio src={staticFile('audio/voice.mp3')} volume={1} startFrom={15} />
   ```
   Voiceover delayed ~0.5s so it lands after the brand mast appears. Music ducks naturally via low volume.

5. **Update `remotion/scripts/render-news.mjs`** — remove `muted: true` so audio is encoded into the MP4 (Nix ffmpeg supports `aac` codec, just not `libfdk_aac`; default `aac` works fine).

6. **Re-render** → `/mnt/documents/malai-naadu-latest-news.mp4` (overwrites current file).

7. **QA**: probe the MP4 with `ffprobe` to confirm an audio stream is present, and extract a 2-second preview clip to verify audio is audible.

## Technical notes
- Voiceover length will likely be ~10–12s at speed 1.0; if it overruns the 13s composition I'll either trim the excerpt sentence or bump composition to 420 frames (14s).
- All audio files live in `remotion/public/audio/` and are referenced via `staticFile()` — they ship with the Remotion bundle, no external hosting needed.
- One-time generation: once the MP3s exist they're committed, so future re-renders don't re-hit ElevenLabs.

## Out of scope
- No UI changes to the web app.
- Not building a generic "generate video for any article" pipeline — this targets the currently rendered ISTAF article. Say the word if you want me to make it parametric next.