export interface DemoScenario {
  description: string;
  id: "product-showcase" | "editorial-story" | "brand-campaign";
  mediaSet: string;
  name: string;
  presetId: string;
  presetName: string;
  rigId: string;
  rigName: string;
}

export const demoScenarios: readonly DemoScenario[] = [
  {
    description: "Build a focused product story with one dominant hero and supporting details.",
    id: "product-showcase",
    mediaSet: "Forma One",
    name: "Product Showcase",
    presetId: "product-hero",
    presetName: "Product Hero",
    rigId: "focus-deck",
    rigName: "Focus Deck",
  },
  {
    description: "Turn a cohesive visual series into a paced, cinematic editorial sequence.",
    id: "editorial-story",
    mediaSet: "Northline Editorial",
    name: "Editorial Story",
    presetId: "editorial-flow",
    presetName: "Editorial Flow",
    rigId: "film-strip",
    rigName: "Film Strip",
  },
  {
    description: "Present a campaign as a modular system with a clear moving focal point.",
    id: "brand-campaign",
    mediaSet: "Atlas System",
    name: "Brand Campaign",
    presetId: "editorial-wall",
    presetName: "Editorial Wall",
    rigId: "grid-wall",
    rigName: "Grid Wall",
  },
];
