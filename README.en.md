# Slidair

[日本語](README.md) | [English](README.en.md)

**A presentation system for designing atmosphere.**

Combine seasons, time of day, weather, scenery, and slide roles to create a coherent deck that does not distract from the presentation.

Slidair treats backgrounds not as mere “decoration,” but as a design system that gives the whole presentation a consistent atmosphere. It preserves muted colors, whitespace, readability, and information hierarchy while applying one visual world to the cover, section dividers, content, quotes, and closing slides.

Slidair now works as a browser-based presentation system where you can edit, reorder, track history, share, and present multiple slides—not just generate backgrounds.

## MVP

- 16:9 presentation preview
- Four seasons: `spring / summer / autumn / winter`
- Four times of day: `morning / day / evening / night`
- Four weather states: `clear / cloudy / rain / snow`
- 32 scenery options: none, fireworks, lake, city, space, underwater, countryside, clear sky, deep sea, sunrise, sunlight through leaves, bamboo grove, cherry-blossom haze, cherry-lined road, hydrangeas, flower field, autumn leaves, snowfield, dunes, moonlit sea, aurora, mountain haze, tidal pool, sea of clouds, wisteria trellis, stone garden, evening valley, foggy harbor, rainy window, birch forest, night lighthouse, and Rust Forge
- Slide roles: `cover / section / content / quote / closing`
- Decks of up to 48 slides
- Add, switch, duplicate, delete, move, and drag-reorder slides from the slide list (Alt+Arrow, Ctrl/Cmd+D, Delete)
- Undo / Redo for the most recent 50 actions (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)
- Apply a random atmosphere or the current time to the whole deck while preserving roles, text, and order
- Generate a sample deck instantly
- Apply an Atmosphere Story (five beats from cover to closing) to the full deck
- Suggest three atmosphere options using local text classification
- Reproducible presets via URL parameters, plus shareable URLs containing the full deck
- Live editing of titles, body text, and subtitles in edit mode
- Automatically fit content based on text length
- Save each slide’s background, role, and text as a draft deck in the browser
- Save named decks on this device and open or delete them from a list
- Rename and duplicate saved decks, sort by update time, and export individual JSON files
- Export editable Slidair JSON (`.slidair.json`) for use on another device or with an AI tool
- Export the current slide as a 1920×1080 PNG (with text or background only)
- Presentation mode that displays only the slide at a larger size (Esc, arrow keys, PageUp/PageDown, and Space)
- Fixed footer navigation for mobile (Preview, Deck, Background, Present)
- PWA support (add to home screen and cache the offline shell)
- AI integration: load `deck.json` and use the local stdio MCP (`npm run mcp)); see `docs/deck-schema.md` for the specification
- Example MCP setup for free connections from Cursor, Claude Desktop, and VS Code ([setup guide](docs/mcp-setup.md))
- A quiet wordmark that conveys presentation atmosphere, with a header for state controls
- Space-specific nebula assets and lighting adjusted by role and time of day ([detailed analysis](docs/space-art-direction.md))
- Ten soft nature backgrounds—including underwater, countryside, clear sky, deep sea, and sunrise—plus the technical Rust Forge background ([asset and production notes](docs/landscape-presets.md), [prompts for additional assets](docs/scene-expansion-prompts.md))
- CSS gradients, SVG noise, and slow transitions
- `prefers-reduced-motion` support
- Filter scenery by category, favorite it, and save recently used scenes
- Switch OG image metadata by scenery
- Node unit tests, Chromium smoke tests, and accessibility audits run in GitHub Actions
- Manual mode that works offline

## Run

No build tool is required. Open `index.html` in a browser or start a static server.

```powershell
cd C:\src\slide-atmosphere
node server.mjs
```

Open <http://localhost:4173> in a browser.

PNG export uses an endpoint in `server.mjs`, so start the app through the static server rather than opening the file directly.

Pure checks for state conversion and the static server use Node.js’s built-in test runner. Browser regression and accessibility audits are also available:

```powershell
npm test

npm run test:browser

npm run audit:a11y
```

The published `build/` directory can be regenerated from source. Run the synchronization check before committing and in CI.

```powershell
npm run build
npm run check:build
```

You can pin the state in the URL:

```text
http://localhost:4173/?season=autumn&period=night&weather=rain&scene=none&role=cover
```

## Design

### Five state axes

```text
WorldState = season + period + weather + scene + role
```

- `season`: muted accent color at the bottom of slides
- `period`: brightness and color temperature
- `weather`: saturation, contrast, and texture
- `scene`: independent background. Fireworks, lake, city, and 26 nature and fantasy scenes use low-contrast blur or quiet light. Space uses nebula light; deep sea, moonlit sea, and aurora keep a dark base at every time of day.
- `role`: information hierarchy during a presentation

Season sets the entry point to a visual world and is limited to the lower accent color. Scenery is an independent axis that adds personality to the background. When a scene is selected, atmospheric treatments for rain, snow, and clouds are not layered over it. Strong imagery does not fill the central safe area, and slide role remains an independent axis.

### Separate environment from content

A regular URL briefly shares only the currently selected background. The Share button can encode the full multi-slide deck—including titles, body text, and subtitles—in the URL as base64url. A received deck is temporarily saved in that tab’s sessionStorage, so it can be continued in edit mode without overwriting the recipient’s local draft.

By separating text and information structure from environmental state (season, time, weather, and scenery), the deck’s overall atmosphere can change while its content stays intact.

### Layers

1. Base gradient
2. Blurred light
3. Atmospheric color from weather
4. Vignette around the edges
5. Barely visible SVG noise
6. Optional scenery image

Strong light and motion stay out of the central safe area, and scenery images sit behind the text. Readability of titles, body text, and diagrams takes priority.

## Future work

- Automatic mode based on the current time
- Connect to weather data such as Open-Meteo
- Fixed fallback when data cannot be retrieved
- Export 1920×1080 PNGs
- Preset export for PowerPoint / Google Slides
- Separate live preview for presenters from static output for audiences
- MCP interface for AI agents
- Background API that generates only scenes not represented by existing presets

The AI Agent / MCP / background-generation API design is being discussed in [Issue #5](https://github.com/nitr0yukkuri/slidair/issues/5).

For the detailed product plan, risks, and implementation decisions, see [`docs/design-analysis.md`](docs/design-analysis.md). The [technical article](docs/technical-article.md) also summarizes implementation context and verification.
