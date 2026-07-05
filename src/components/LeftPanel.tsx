const rigs = [
  { id: "orbit-carousel", name: "Orbit Carousel", status: "Active" },
  { id: "film-strip", name: "Film Strip", status: "Soon" },
  { id: "card-totem", name: "Card Totem", status: "Soon" },
  { id: "showcase-stream", name: "Showcase Stream", status: "Soon" },
];

interface LeftPanelProps {
  activeRigId: string;
}

export function LeftPanel({ activeRigId }: LeftPanelProps) {
  return (
    <aside className="panel left-panel" aria-label="Motion rigs">
      <div>
        <p className="eyebrow">MotionKit</p>
        <h1>Spatial</h1>
        <p className="product-headline">Create spatial motion from your screenshots.</p>
        <p className="product-copy">
          Upload 4 images, choose a shape and background, then export a WebM.
        </p>
      </div>

      <section className="best-used" aria-label="Best used for">
        <p className="eyebrow">Best Used For</p>
        <ul>
          <li>Product screenshots</li>
          <li>App screens</li>
          <li>Feature visuals</li>
          <li>Social launch videos</li>
        </ul>
      </section>

      <nav className="rig-list" aria-label="Rig list">
        {rigs.map((rig) => (
          <button
            className={rig.id === activeRigId ? "rig-item rig-item-active" : "rig-item"}
            disabled={rig.id !== activeRigId}
            key={rig.id}
            type="button"
          >
            <span>{rig.name}</span>
            <small>{rig.status}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}
