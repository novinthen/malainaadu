import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { NewsVideo } from './NewsVideo';

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="news"
      component={NewsVideo}
      durationInFrames={390}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
