# Hoppy Motion Families

Motion families describe the dominant spatial structure of a Hoppy rig. They are stable product taxonomy, not renderer dispatch keys. Production behavior always comes from the registered rig definition.

| Family | Meaning | Current state |
| --- | --- | --- |
| Orbit | Media circulates around a focal region with cyclic depth or perspective. | Orbit Carousel production rig |
| Stream | Media travels through a continuous ordered band. | Film Strip production rig |
| Grid | Media is organized as a modular field with coordinated movement. | Grid Wall production rig |
| Focus | One primary frame leads while supporting media remains subordinate. | Focus Deck production rig |
| Stack | Media advances through overlapping layers or a deck. | Stack Flow production rig |
| Cluster | Media moves as a grouped spatial constellation. | No current entry |
| Path | Media follows an authored line, curve, or wave. | Wave Path production rig |
| Depth | Forward and backward travel is the defining motion structure. | No current entry |

Tags are complementary discovery language. A rig may be tagged `editorial`, `looping`, `perspective`, `hero`, or `multi-card`, but tags never replace its single family.

The six implemented families remain structurally distinct: Orbit uses circular depth, Stream uses a repeating band, Grid uses fixed cells and changing focus, Focus uses hero/support roles, Stack uses a layered cyclic queue, and Path uses open-curve sampling. The gallery hides the empty Cluster and Depth filters.

## Presentation Differentiation

| Rig | Immediate visual read | Preview emphasis |
| --- | --- | --- |
| Orbit Carousel | Cards circulate around a center with front/back depth | Balanced spread, readable rear cards, clear front focus |
| Grid Wall | Six fixed cells form an architectural field | Complete grid, visible focus weighting, restrained drift |
| Focus Deck | One hero frame leads four supports | Dominant center hero with enough support context |
| Film Strip | Ordered frames move through a continuous horizontal band | Smaller cards, clear gaps, multiple frames in view |
| Wave Path | Frames travel along an open authored curve | Wider path, visible amplitude, readable tangent rotation |
| Stack Flow | Cards advance through an overlapping queue | Compact layered pile with readable depth steps |

Presentation recipes are preview metadata only. They do not create motion-family aliases, change registered defaults, or replace rig-owned renderer geometry.
