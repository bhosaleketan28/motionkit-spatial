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
      </div>

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
