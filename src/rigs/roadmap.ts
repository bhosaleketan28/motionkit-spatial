import { RIG_FAMILIES } from "./types";
import type { RigFamily } from "./types";

export interface RoadmapRigEntry {
  description: string;
  family: RigFamily;
  id: string;
  maturity: "roadmap";
  name: string;
  preview: "grid" | "focus" | "stack" | "wave";
  status: "in-development";
  tags: readonly string[];
}

export const roadmapRigEntries: readonly RoadmapRigEntry[] = validateRoadmapEntries([
  {
    description: "A modular field of media tiles with controlled group motion.",
    family: "grid",
    id: "roadmap-grid-wall",
    maturity: "roadmap",
    name: "Grid Wall",
    preview: "grid",
    status: "in-development",
    tags: ["product", "multi-card"],
  },
  {
    description: "A stable hero frame supported by a restrained secondary deck.",
    family: "focus",
    id: "roadmap-focus-deck",
    maturity: "roadmap",
    name: "Focus Deck",
    preview: "focus",
    status: "in-development",
    tags: ["hero", "minimal"],
  },
  {
    description: "Layered cards advancing through a compact depth sequence.",
    family: "stack",
    id: "roadmap-stack-flow",
    maturity: "roadmap",
    name: "Stack Flow",
    preview: "stack",
    status: "in-development",
    tags: ["rhythmic", "perspective"],
  },
  {
    description: "Media travelling along an authored wave-shaped motion path.",
    family: "path",
    id: "roadmap-wave-path",
    maturity: "roadmap",
    name: "Wave Path",
    preview: "wave",
    status: "in-development",
    tags: ["looping", "cinematic"],
  },
]);

function validateRoadmapEntries(entries: RoadmapRigEntry[]) {
  if (entries.length > 4) throw new Error("Rig roadmap may show no more than four honest entries.");
  const ids = new Set<string>();
  entries.forEach((entry) => {
    if (
      !entry.id ||
      ids.has(entry.id) ||
      !RIG_FAMILIES.includes(entry.family) ||
      entry.maturity !== "roadmap" ||
      entry.status !== "in-development" ||
      !entry.name.trim() ||
      !entry.description.trim() ||
      !entry.tags.length ||
      entry.tags.some((tag) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag))
    ) {
      throw new Error(`Invalid roadmap rig entry: ${entry.id || "(empty)"}.`);
    }
    ids.add(entry.id);
  });
  return entries;
}
