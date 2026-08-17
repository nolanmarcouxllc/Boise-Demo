# Westfield Branch Intelligence Command Center

An interactive presentation concept for an in-person meeting with a Building Materials Distribution
branch. It shows how a single operational layer could sit above existing branch systems and connect
orders, routing, dispatch, transportation, exceptions and management visibility.

> **Demonstration Environment — Sanitized Sample Data.**
> Every customer, order, route, truck, driver, carrier and exception in this application is fictional
> and was created for this walkthrough. No Boise Cascade production systems or customer data are
> connected, and nothing here claims that any integration has been technically validated.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

Desktop-first, intended for a conference-room display. Responsive down to tablet width.

## Two modes

| Mode | What it is |
| --- | --- |
| **Presentation** | A guided sequence with larger type, presenter notes and Previous / Next controls at the bottom of the screen. |
| **Explore** | The full command center with persistent left navigation — go to any screen, open any record. |

Switch with the control in the top right, or press `F`.

### Keyboard

- `→` next section · `←` previous section
- `F` toggle Presentation / Explore
- `Esc` close a detail panel

## The twelve screens

1. **Opening** — the invisible problem, told as one order moving through six stages
2. **Branch Overview** — metrics, priorities, transportation snapshot, order pressure, management brief
3. **Agent Network** — ten agents in four groups, with inputs, outputs, owners and hard limits
4. **Order Flow** — the twelve-step order lifecycle, editable during the meeting
5. **Transportation Control Tower** — map, timeline and list views of the service day
6. **Exception Center** — one queue, twelve categories, nine filters
7. **Route Optimization Lab** — a sandbox that responds to changed constraints
8. **Planned vs. Actual** — route and stop variance across fourteen simulated days
9. **Management Intelligence** — the morning brief, with every statement traceable
10. **Opportunity and Value** — before/after and a transparent value simulator
11. **Discovery Board** — capture the branch's corrections live and export them
12. **Next Step** — participants, agenda, and a generated scoping summary

## The ten agents

**Input control** — Agility-to-Routing Watchdog · Last-Minute Order Change Agent
**Planning** — Order Consolidation · Duplicate-Stop · Route Overlap · Multi-Vehicle Optimization ·
Private-Fleet vs Third-Party
**Execution and learning** — Planned-versus-Actual · Branch Exception Command
**Management** — Management Morning Brief

Each agent shows a permission level — Observe, Recommend, or Approve & Execute — together with the
human who owns the decision and an explicit list of what the agent may not do on its own. Nothing in
the demonstration executes without a confirmation step.

## Where things live

```
src/
  data/         Simulated records: branch, customers, locations, products, orders, routes,
                exceptions, agents, recommendations, history, workflow. index.ts derives the
                branch metrics and carries the derivation text shown next to each number.
  screens/      One file per screen.
  components/   Shell, detail drawer, recommendation card, map, shared UI primitives.
  state/        App context (mode, section, selection, notes), section list, localStorage hook.
  lib/          The sandbox planning heuristic and the note-export helpers.
```

### Data set size

30 orders · 12 customers · 20 delivery locations · 8 private-fleet trucks · 8 drivers ·
5 approved carriers · 10 routes · 15 exceptions · 25 recommendations · 14 days of history.

Records are interconnected: an order links to its route, its exceptions, its customer and every
recommendation that references it, in both directions.

## Notes and storage

Discovery Board notes, workflow corrections, simulated approvals and the mode/section you were last
on are stored in this browser's `localStorage` only. Nothing is sent to any external service, and the
application makes no analytics or telemetry calls.

## Maps

The control tower uses Leaflet with OpenStreetMap tiles when the network allows it. If tiles cannot
load, it falls back automatically to a self-contained schematic drawn from the same route geometry —
there is no configuration to change and no API key anywhere in the project. Route geometry is a
simplified corridor model for display; it is not the output of a routing engine.

## What the numbers are and are not

The value simulator and the optimization lab are transparent models, not forecasts. Every output
shows the formula and the assumptions that produced it, and results are labelled as illustrative
ranges requiring validation against Boise data. The planning heuristic in the lab is a sweep-and-pack
model with straight-line distances and a fixed road factor — it does not replace Trimble Maps,
PC*MILER, or any production routing engine, and the interface says so on the screen.
