import { OceanEngine, type SharkKind, type SharkSpec } from "./src";

// Optional roster override, e.g. ?sharks=hammerhead,zebra,mako,nurse
const allowed = new Set<SharkKind>(["classic", "hammerhead", "zebra", "tiger", "greathammer", "mako", "thresher", "nurse"]);
const requested = new URLSearchParams(location.search).get("sharks")?.split(",") ?? [];
const kinds = requested.map(kind => kind.trim()).filter((kind): kind is SharkKind => allowed.has(kind as SharkKind)).slice(0, 8);
const sharks: SharkSpec[] | undefined = kinds.length
  ? kinds.map((kind, i) => ({ kind, size: Math.max(0.4, 1 - i * 0.14) }))
  : undefined;

new OceanEngine(document.querySelector("canvas")!, sharks);
