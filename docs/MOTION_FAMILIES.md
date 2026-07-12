# Motion Families

Motion families describe the dominant spatial structure of a rig. They are stable product taxonomy, not renderer dispatch keys. Production behavior always comes from the registered rig definition.

| Family | Meaning | Current state |
| --- | --- | --- |
| Orbit | Media circulates around a focal region with cyclic depth or perspective. | Orbit Carousel production rig |
| Stream | Media travels through a continuous ordered band. | Film Strip production rig |
| Grid | Media is organized as a modular field with coordinated movement. | Grid Wall roadmap concept |
| Focus | One primary frame leads while supporting media remains subordinate. | Focus Deck roadmap concept |
| Stack | Media advances through overlapping layers or a deck. | Stack Flow roadmap concept |
| Cluster | Media moves as a grouped spatial constellation. | No current entry |
| Path | Media follows an authored line, curve, or wave. | Wave Path roadmap concept |
| Depth | Forward and backward travel is the defining motion structure. | No current entry |

Tags are complementary discovery language. A rig may be tagged `editorial`, `looping`, `perspective`, `hero`, or `multi-card`, but tags never replace its single family.

The gallery hides empty family filters. Roadmap concepts remain outside `src/rigs/registry.ts`, are limited to four, and are always labelled unavailable.
