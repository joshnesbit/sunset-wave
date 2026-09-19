# sunset wave

A wave of 100+ neighbor gatherings across San Francisco's Outer Sunset, all on one day: **Saturday, March 20, 2027**, the spring equinox.

The idea is simple. We host small gatherings on our actual blocks with our actual neighbors. We meet the folks we've lived next to for years, find that we care about each other and our shared place, and start shaping the neighborhood of our dreams. It begins with an invitation tucked under doors, coffee and donuts in a driveway, and a few or a few dozen neighbors getting together.

Sponsored by the [Sunset Social Club](https://sunsetsocialclub.org). Open to any Outer Sunset resident, membership not required. Every host gets $200.

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | The landing page and the Wave map: a grid of Outer Sunset blocks where neighbors say "I'll host" or "I'll help." |
| `about.html` | what sunset wave is, how hosting and joining work, the Sunset Social Club, and where the idea comes from. |
| `app.js` | Map rendering, the claim form, the roster of hosts, and the block dialog. |
| `blocks.js` | The geography: avenues 48th to 19th, cross streets Lincoln to Sloat, Sunset Blvd, and the reservoir. |
| `seed.js` | Example blocks so the map isn't blank. Clear these before sharing. |
| `styles.css` | All styling, including the mobile layout. |
| `materials/host-invitation.html` | Printable letter-size invitation to hand to a prospective host. |
| `program/plan.md` | The program plan: captains, Host Night, seeding order, open questions. |

## Running it

Open `index.html` in a browser. There is no build step and no dependencies.

To print the host invitation, open `materials/host-invitation.html` and print to letter paper.

## How the map works

- Each tile is one block: an avenue between two cross streets, like "46th Ave between Kirkham & Lawton."
- Coral tiles have a host. Outlined tiles have a neighbor ready to help but no host yet. Green tiles are Sunset Blvd and the reservoir.
- Clicking a tile opens the claim form (empty block) or the host's details (claimed block).

**Sign-ups are stored in the browser's localStorage only.** Nothing is sent anywhere yet. Before sharing publicly, the form needs a real destination (a form backend, a spreadsheet, or a small API) so captains can actually reach hosts.

## Lineage

sunset wave follows the microgrant gathering recipe: small grants, real gatherings, neighbors with neighbors.

- [With Neighbors](https://withneighbors.org), a national effort supporting local microgrant gathering programs.
- Microgrant Gatherings from Connective Tissue and the Trust for Civic Life.
- [Outer Sunset Today](https://outersunset.today), the neighborhood's daily dashboard.
- Built with [Relational Builder](https://relationalbuilder.org), an open-source app builder for tools that strengthen neighborhood connection. The `.reltech.yml` manifest carries the project's lineage; adding the `relational-tech` topic on GitHub lists it at [updates.relationaltechproject.org](https://updates.relationaltechproject.org).

Any neighborhood is welcome to copy this for their own wave.
