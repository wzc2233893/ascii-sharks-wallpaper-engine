import { AsciiRenderer } from "./renderer";
import { World, type SharkSpec } from "./world";

const STEP = 1 / 60;
const MAX_STEPS = 4;

export interface OceanOptions {
  fps?: number;
  interactive?: boolean;
}

/** Owns animation, input and lifecycle for a browser or a wallpaper host. */
export class OceanEngine {
  private world: World;
  private renderer: AsciiRenderer;
  private raf = 0;
  private last = 0;
  private nextRender = 0;
  private acc = 0;
  private visible = true;
  private paused = false;
  private interactive = true;
  private fps = 60;
  private reducedMotion: MediaQueryList;
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;
  private disposed = false;

  constructor(private canvas: HTMLCanvasElement, sharks?: SharkSpec[], options: OceanOptions = {}) {
    this.world = new World(sharks);
    this.renderer = new AsciiRenderer(canvas);
    this.renderer.setFontFamily(getComputedStyle(canvas).fontFamily);
    this.fps = this.validFrameRate(options.fps ?? 60);
    this.interactive = options.interactive ?? true;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.intersectionObserver.observe(canvas);

    this.reducedMotion.addEventListener("change", this.onMotionPreference);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
    window.addEventListener("blur", this.onPointerLeave);

    this.resize();
    document.fonts?.load(`600 16px ${getComputedStyle(canvas).fontFamily}`).then(() => {
      if (!this.disposed && this.reducedMotion.matches) this.drawStill();
    });
    this.schedule();
  }

  setFrameRate(fps: number) {
    this.fps = this.validFrameRate(fps);
    this.schedule();
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.onPointerLeave();
    this.schedule();
  }

  setInteractive(enabled: boolean) {
    this.interactive = enabled;
    if (!enabled) this.onPointerLeave();
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.onMotionPreference);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("blur", this.onPointerLeave);
  }

  private validFrameRate(fps: number) {
    return Number.isFinite(fps) ? Math.max(1, Math.min(144, fps)) : 30;
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.resize(rect.width, rect.height, dpr);
    this.world.resize(rect.width, rect.height, this.renderer.cellWidth, this.renderer.cellHeight);
    if (this.reducedMotion.matches) this.drawStill();
  }

  private schedule() {
    cancelAnimationFrame(this.raf);
    if (this.disposed || this.paused || document.hidden || !this.visible || this.reducedMotion.matches) return;
    this.last = performance.now();
    this.nextRender = this.last;
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    if (this.disposed || this.paused || document.hidden || !this.visible) return;
    this.raf = requestAnimationFrame(this.frame);
    if (now + 0.1 < this.nextRender) return;
    const interval = 1000 / this.fps;
    this.nextRender += Math.max(1, Math.floor((now - this.nextRender) / interval) + 1) * interval;
    // A low host FPS still advances the ecosystem at its normal speed.
    const dt = Math.min(Math.max(0.1, 1 / this.fps), Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.acc += dt;
    let steps = 0;
    const maxSteps = Math.max(MAX_STEPS, Math.ceil(1 / (this.fps * STEP)));
    while (this.acc + 1e-9 >= STEP && steps < maxSteps) {
      this.world.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === maxSteps && this.acc >= STEP) this.acc = 0;
    this.renderer.render(this.world, dt);
  };

  private drawStill() {
    if (this.world.time < 4) {
      for (let i = 0; i < 240; i++) this.world.step(STEP);
    }
    this.renderer.render(this.world, STEP);
  }

  private onMotionPreference = () => {
    if (this.reducedMotion.matches) {
      cancelAnimationFrame(this.raf);
      this.drawStill();
    } else this.schedule();
  };

  private onVisibilityChange = () => {
    if (document.hidden) this.onPointerLeave();
    this.schedule();
  };

  private toLocal(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
  }

  private onPointerMove = (e: PointerEvent) => {
    if (!this.interactive || this.paused) return;
    const { x, y, inside } = this.toLocal(e);
    this.world.pointer = { x, y, active: inside && e.pointerType !== "touch" };
  };

  private onPointerDown = (e: PointerEvent) => {
    if (!this.interactive || this.paused) return;
    const { x, y, inside } = this.toLocal(e);
    if (inside && !this.reducedMotion.matches) this.world.splash(x, y);
  };

  private onPointerLeave = () => {
    this.world.pointer.active = false;
  };
}
