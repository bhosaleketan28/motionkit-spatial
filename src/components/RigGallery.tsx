import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { positiveModulo } from "../renderer/motionGeometry";
import { getRigPreviewMedia, getRigPreviewSettings } from "../preview/rigPreviewRuntime";
import { roadmapRigEntries } from "../rigs/roadmap";
import type { RoadmapRigEntry } from "../rigs/roadmap";
import { RIG_FAMILIES } from "../rigs/types";
import type { FrameSize, RegisteredRigDefinition, RigFamily } from "../rigs/types";

interface RigGalleryProps {
  activeRig: RegisteredRigDefinition;
  onClose: () => void;
  onSelectRig: (rigId: string) => void;
  prefersReducedMotion: boolean;
  rigs: readonly RegisteredRigDefinition[];
}

type FamilyFilter = "all" | RigFamily;
type PreviewDraw = (timestamp: number) => void;

interface PreviewRegistration {
  draw: PreviewDraw;
  visible: boolean;
}

export function RigGallery({
  activeRig,
  onClose,
  onSelectRig,
  prefersReducedMotion,
  rigs,
}: RigGalleryProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const [family, setFamily] = useState<FamilyFilter>("all");
  const scheduler = useSharedPreviewScheduler(prefersReducedMotion);
  const availableFamilies = useMemo(() => {
    const populated = new Set<RigFamily>([
      ...rigs.map((rig) => rig.family),
      ...roadmapRigEntries.map((entry) => entry.family),
    ]);
    return RIG_FAMILIES.filter((candidate) => populated.has(candidate));
  }, [rigs]);
  const production = family === "all" ? rigs : rigs.filter((rig) => rig.family === family);
  const roadmap = family === "all"
    ? roadmapRigEntries
    : roadmapRigEntries.filter((entry) => entry.family === family);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.querySelector(".rig-switch-dialog")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="rig-gallery-layer">
      <button aria-label="Close rig library" className="rig-gallery-scrim" type="button" onClick={onClose} />
      <section
        aria-labelledby="rig-gallery-title"
        aria-modal="true"
        className="rig-gallery"
        ref={dialogRef}
        role="dialog"
      >
        <header className="rig-gallery-header">
          <div>
            <p className="eyebrow">Motion library</p>
            <h2 id="rig-gallery-title">Choose a motion system</h2>
            <p>Production rigs are ready to use. Roadmap families are shown honestly as unavailable.</p>
          </div>
          <button aria-label="Close rig library" className="rig-gallery-close" ref={closeRef} type="button" onClick={onClose}>×</button>
        </header>

        <nav aria-label="Filter rigs by motion family" className="rig-family-filter" role="tablist">
          {(["all", ...availableFamilies] as FamilyFilter[]).map((option, index, options) => (
            <button
              aria-selected={family === option}
              className={family === option ? "selected" : ""}
              id={`rig-family-${option}`}
              key={option}
              onClick={() => setFamily(option)}
              onKeyDown={(event) => {
                let nextIndex = index;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % options.length;
                else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + options.length) % options.length;
                else if (event.key === "Home") nextIndex = 0;
                else if (event.key === "End") nextIndex = options.length - 1;
                else return;
                event.preventDefault();
                const next = options[nextIndex];
                setFamily(next);
                window.requestAnimationFrame(() => document.getElementById(`rig-family-${next}`)?.focus());
              }}
              role="tab"
              tabIndex={family === option ? 0 : -1}
              type="button"
            >
              {option === "all" ? "All" : formatFamily(option)}
            </button>
          ))}
        </nav>

        <div className="rig-gallery-scroll">
          {production.length ? (
            <section aria-labelledby="production-rigs-heading" className="rig-gallery-section">
              <div className="rig-gallery-section-heading">
                <h3 id="production-rigs-heading">Production rigs</h3>
                <span>{production.length} available</span>
              </div>
              <div className="rig-card-grid">
                {production.map((rig) => (
                  <ProductionRigCard
                    active={rig.id === activeRig.id}
                    key={rig.id}
                    prefersReducedMotion={prefersReducedMotion}
                    rig={rig}
                    scheduler={scheduler}
                    onSelect={() => onSelectRig(rig.id)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {roadmap.length ? (
            <section aria-labelledby="roadmap-rigs-heading" className="rig-gallery-section roadmap-section">
              <div className="rig-gallery-section-heading">
                <h3 id="roadmap-rigs-heading">Roadmap</h3>
                <span>Concept directions</span>
              </div>
              <div className="rig-card-grid">
                {roadmap.map((entry) => <RoadmapRigCard entry={entry} key={entry.id} />)}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ProductionRigCard({
  active,
  onSelect,
  prefersReducedMotion,
  rig,
  scheduler,
}: {
  active: boolean;
  onSelect: () => void;
  prefersReducedMotion: boolean;
  rig: RegisteredRigDefinition;
  scheduler: PreviewScheduler;
}) {
  return (
    <article aria-label={`${rig.name}, ${formatFamily(rig.family)} family, production`} className={active ? "rig-library-card active" : "rig-library-card"}>
      <RigPreviewCanvas prefersReducedMotion={prefersReducedMotion} rig={rig} scheduler={scheduler} />
      <div className="rig-library-card-body">
        <div className="rig-card-title-row">
          <div><span>{formatFamily(rig.family)}</span><h4>{rig.name}</h4></div>
          <small>Production</small>
        </div>
        <p>{rig.gallery.description}</p>
        <div className="rig-card-meta">
          <span>{formatMediaRequirement(rig)}</span>
          <span>{rig.supportedRatios.join(" · ")}</span>
        </div>
        <div className="rig-card-footer">
          <div className="rig-tag-list" aria-label={`${rig.name} tags`}>
            {rig.tags.slice(0, 3).map((tag) => <span key={tag}>{formatTag(tag)}</span>)}
          </div>
          <button className={active ? "rig-card-action active" : "rig-card-action"} disabled={active} type="button" onClick={onSelect}>
            {active ? "Active" : "Select"}
          </button>
        </div>
      </div>
    </article>
  );
}

function RoadmapRigCard({ entry }: { entry: RoadmapRigEntry }) {
  return (
    <article aria-label={`${entry.name}, ${formatFamily(entry.family)} family, in development`} className="rig-library-card roadmap-card">
      <RoadmapPreview variant={entry.preview} />
      <div className="rig-library-card-body">
        <div className="rig-card-title-row">
          <div><span>{formatFamily(entry.family)}</span><h4>{entry.name}</h4></div>
          <small>In development</small>
        </div>
        <p>{entry.description}</p>
        <div className="rig-card-footer">
          <div className="rig-tag-list">{entry.tags.map((tag) => <span key={tag}>{formatTag(tag)}</span>)}</div>
          <button aria-disabled="true" disabled type="button">Unavailable</button>
        </div>
      </div>
    </article>
  );
}

function RoadmapPreview({ variant }: { variant: RoadmapRigEntry["preview"] }) {
  return (
    <div aria-hidden="true" className={`rig-preview-viewport roadmap-preview roadmap-preview-${variant}`}>
      {Array.from({ length: variant === "grid" ? 9 : variant === "wave" ? 5 : 4 }, (_, index) => <span key={index} />)}
    </div>
  );
}

interface PreviewScheduler {
  register: (id: string, draw: PreviewDraw) => () => void;
  setVisible: (id: string, visible: boolean) => void;
}

function useSharedPreviewScheduler(reducedMotion: boolean): PreviewScheduler {
  const registrationsRef = useRef(new Map<string, PreviewRegistration>());
  const animationFrameRef = useRef<number | null>(null);
  const lastPaintRef = useRef(0);

  const register = useCallback((id: string, draw: PreviewDraw) => {
    registrationsRef.current.set(id, { draw, visible: true });
    return () => registrationsRef.current.delete(id);
  }, []);

  const setVisible = useCallback((id: string, visible: boolean) => {
    const registration = registrationsRef.current.get(id);
    if (registration) registration.visible = visible;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const frameInterval = 1000 / 22;
    const schedule = () => {
      if (animationFrameRef.current === null && !document.hidden) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
      }
    };
    const tick = (timestamp: number) => {
      animationFrameRef.current = null;
      if (!document.hidden && timestamp - lastPaintRef.current >= frameInterval) {
        lastPaintRef.current = timestamp;
        registrationsRef.current.forEach((registration) => {
          if (registration.visible) registration.draw(timestamp);
        });
      }
      schedule();
    };
    const handleVisibility = () => {
      if (document.hidden && animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      } else {
        schedule();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    schedule();
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      registrationsRef.current.clear();
    };
  }, [reducedMotion]);

  return useMemo(() => ({ register, setVisible }), [register, setVisible]);
}

function RigPreviewCanvas({
  prefersReducedMotion,
  rig,
  scheduler,
}: {
  prefersReducedMotion: boolean;
  rig: RegisteredRigDefinition;
  scheduler: PreviewScheduler;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let unregister: () => void = () => undefined;
    const frame = getPreviewFrame(rig.preview.ratio);
    const settings = getRigPreviewSettings(rig);
    const draw = (images: Array<HTMLImageElement | null>, progress: number) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      rig.preview.render({
        context,
        frame,
        progress,
        settings,
        slotCount: rig.slotCount,
        slotImages: images,
      });
    };

    getRigPreviewMedia(rig).then((images) => {
      if (cancelled) return;
      draw(images, rig.preview.staticProgress);
      if (!prefersReducedMotion) {
        unregister = scheduler.register(rig.id, (timestamp) => {
          const progress = positiveModulo(timestamp / 1000 / rig.preview.durationSeconds, 1);
          draw(images, progress);
        });
        scheduler.setVisible(rig.id, visibleRef.current);
      }
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
        scheduler.setVisible(rig.id, visibleRef.current);
      },
      { threshold: 0.08 },
    );
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      unregister();
    };
  }, [prefersReducedMotion, rig, scheduler]);

  const frame = getPreviewFrame(rig.preview.ratio);
  return (
    <div className="rig-preview-viewport" ref={viewportRef} style={{ "--rig-preview-accent": rig.preview.accent ?? "#70e0bf" } as React.CSSProperties}>
      <canvas
        aria-label={`${rig.name} animated renderer preview`}
        className="rig-preview-canvas"
        height={frame.height}
        ref={canvasRef}
        role="img"
        width={frame.width}
      />
      {prefersReducedMotion ? <span className="rig-preview-static-label">Static preview</span> : null}
    </div>
  );
}

function getPreviewFrame(ratio: RegisteredRigDefinition["preview"]["ratio"]): FrameSize {
  if (ratio === "9:16") return { width: 180, height: 320 };
  if (ratio === "1:1") return { width: 240, height: 240 };
  return { width: 320, height: 180 };
}

function formatFamily(family: RigFamily) {
  return family.charAt(0).toUpperCase() + family.slice(1);
}

function formatTag(tag: string) {
  return tag.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function formatMediaRequirement(rig: RegisteredRigDefinition) {
  const { minItems, maxItems } = rig.mediaRequirements;
  return minItems === maxItems ? `${maxItems} images` : `${minItems}–${maxItems} images`;
}
