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

export const roadmapRigEntries: readonly RoadmapRigEntry[] = validateRoadmapEntries([]);

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
