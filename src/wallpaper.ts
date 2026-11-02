import { OceanEngine } from "./engine";
import type { SharkKind, SharkSpec } from "./world";

type Property = { value: unknown };
type Properties = Record<string, Property | undefined>;
declare global {
  interface Window {
    wallpaperPropertyListener: {
      applyGeneralProperties(properties: { fps?: number }): void;
      applyUserProperties(properties: Properties): void;
      setPaused(paused: boolean): void;
    };
  }
}

const kinds: SharkKind[] = ["classic", "greathammer", "tiger", "thresher", "nurse", "hammerhead", "zebra", "mako"];
const sizes = [1, 0.84, 0.68, 0.6, 0.44, 0.54, 0.76, 0.5];
const settings = { count: 5, scale: 1, species: "mixed", interactive: true, fps: 30, paused: false };
let engine: OceanEngine | undefined;
const canvas = document.querySelector("canvas")!;

function numberProperty(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function restart() {
  engine?.destroy();
  const sharks: SharkSpec[] = Array.from({ length: settings.count }, (_, i) => ({
    kind: settings.species === "mixed" ? kinds[i] : settings.species as SharkKind,
    size: sizes[i] * settings.scale,
  }));
  engine = new OceanEngine(canvas, sharks, { fps: settings.fps, interactive: settings.interactive });
  engine.setPaused(settings.paused);
}

// Register immediately, before Wallpaper Engine sends its initial property values.
window.wallpaperPropertyListener = {
  applyGeneralProperties(properties) {
    if (typeof properties.fps === "number" && Number.isFinite(properties.fps) && properties.fps > 0) {
      settings.fps = Math.max(1, Math.min(144, properties.fps));
      engine?.setFrameRate(settings.fps);
    }
  },
  applyUserProperties(properties) {
    const previous = `${settings.count}/${settings.scale}/${settings.species}`;
    if (properties.sharkcount) settings.count = Math.round(numberProperty(properties.sharkcount.value, settings.count, 1, 8));
    if (properties.sharksize) settings.scale = numberProperty(properties.sharksize.value, settings.scale * 100, 60, 140) / 100;
    const species = properties.sharkspecies?.value;
    if (typeof species === "string" && (species === "mixed" || kinds.includes(species as SharkKind))) settings.species = species;
    if (typeof properties.interactive?.value === "boolean") settings.interactive = properties.interactive.value;
    if (`${settings.count}/${settings.scale}/${settings.species}` !== previous) restart();
    else engine?.setInteractive(settings.interactive);
  },
  setPaused(paused) {
    settings.paused = Boolean(paused);
    engine?.setPaused(settings.paused);
  },
};

restart();
window.addEventListener("pagehide", () => engine?.destroy());
