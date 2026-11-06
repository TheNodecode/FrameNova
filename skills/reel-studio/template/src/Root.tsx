import { Composition } from "remotion";
import { Reel } from "./Reel";
import { spec } from "./spec";

export const RemotionRoot: React.FC = () => (
  <Composition id="Reel" component={Reel} durationInFrames={Math.round(spec.durationSec * spec.format.fps)} fps={spec.format.fps} width={spec.format.width} height={spec.format.height} />
);
