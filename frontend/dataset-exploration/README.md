# Stechgrow OS · Dataset Exploration

Aditya Arakkal’s independent Dataset Exploration frontend module for Stechgrow OS. Inspect a dataset’s schema, quality and individual records before moving into deeper analysis. Built with React 19, Vite 8, Lucide icons, Recharts and plain responsive CSS.

This module complements **Bhoomi’s Automated EDA** and **Nishita’s Data Analysis**. Their sidebar entries identify separate team modules; their screens and AI analysis are outside this project’s scope.

Repository: [stechgrow-dataset-exploration](https://github.com/adityaarakkal/stechgrow-dataset-exploration/tree/feat/dataset-exploration).

## Features

- Dataset switching with cancellable loading, explicit empty/error demos, retry and recovery. A new dataset resets preview search, quality filter, sorting, page size, pagination, column visibility and column selection.
- Calculated overview: row/column counts, missing cells and percentages, exact repeated rows, populated cells and completeness. A per-column breakdown shows missing values relative to dataset rows.
- Searchable column explorer with type filters, unique/non-missing/missing counts, sample values, numeric minimum/maximum/mean/median, date bounds and distributions. Accessible distribution values are available as a table.
- Record preview with case-insensitive search across all columns (including hidden columns), ascending/descending/original sorting, missing/repeated-row filters, column visibility, pagination and 10/25/50 rows per page. At least one column stays visible.
- Full-dataset CSV export and filtered export respecting the current sort and visible columns. Filtered export includes all matching rows, not only the current page. CSV quoting and formula-prefix protection are included.
- Keyboard-labelled controls, skip link, visible focus states, sortable table semantics and a mobile navigation drawer with focus trapping, Escape dismissal and focus restoration.
- Responsive panels and independently scrolling preview tables; locally served fonts and logo, without third-party runtime asset requests.

## Design references

The visual system comes from the MCP-inspected [Stechgrow frame 1:5019](https://www.figma.com/design/Uc6Y01mU393hd8n7gq41Jk/Stechgrow?node-id=1-5019) and matching [original frame 2209:703](https://www.figma.com/design/fw1JN4VsoIb22yl84EWVv5/Stechgrow-OS?node-id=2209-703). These EDA frames supply the shared design system, not this module’s functionality or chart imagery.

Applied values: `#111111` canvas, `#1E1E1E` panels, `#2C2C2C` insets, white primary text, `#5353F6` violet, `#FF4DA4` pink and `#2EFF9A` green. Urbanist Medium supplies the 48px desktop title and 20px navigation, with 24px card labels, 16px table headers and 14px body/cell text. At the wide desktop breakpoint the sidebar panels are 360px wide, have 20px outer margins/corners, and the brand panel is 192px tall. Summary cards have 10px corners, 208px minimum height and 14px gaps. Widths, text sizes and spacing adapt at narrower breakpoints.

The `#818181` secondary reference token is retained; small supporting text uses `#B3B3B3` for better contrast. Selected states and functional data visualizations extend the shared palette for this module.

The original logo was downloaded with Figma MCP `download_assets` from node `1:5023` into `public/assets/stechgrow-logo.svg`; its intrinsic 157.832 × 43.851 geometry is preserved. Other icons reuse the existing Lucide dependency. No avatar or decorative EDA charts were copied. Urbanist Regular, Medium and Semibold are served locally from `public/fonts/` with the [SIL Open Font License](public/fonts/OFL.txt).

## Install and run

Use Node.js **22.12 or newer** (verified with Node 24.14.0) and npm. Use the committed lockfile for reproducible installation:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The default is `http://localhost:5173`; Vite selects another port if necessary.

```bash
npm test          # 18 calculation, fixture and loading tests
npm run build    # Production output in dist/
npm run preview  # Serve the production build locally
```

No lint or typecheck script is configured. This is a JavaScript/JSX project. The production bundler currently emits non-fatal `use client` directive warnings from Lucide; the client-only bundle builds and runs successfully.

## Browser verification

`scripts/verify-browser.mjs` contains 12 Chromium checks covering initial/loading state, exact style tokens, local fonts/assets, all dataset summaries, column selection/search/types/samples/distributions, table search/sort/pagination/filter combinations, column visibility, dataset switching, error/retry/empty states, CSV downloads, responsive overflow and keyboard/mobile navigation. Every test also checks browser console errors/warnings and HTTP asset failures. Layout checks cover 1920, 1440, 1280, 1024, 1023, 834, 768, 700, 390, 360 and 320px widths; screenshots are saved at five representative sizes.

Playwright is an optional verification tool and is not added to application dependencies. Start the app in one terminal, then install the browser tooling into a temporary directory in another:

```bash
npm install --prefix /tmp/stechgrow-browser-check --no-save playwright
/tmp/stechgrow-browser-check/node_modules/.bin/playwright install chromium
PLAYWRIGHT_MODULE=/tmp/stechgrow-browser-check/node_modules/playwright/index.mjs npm run test:browser
```

Set `BASE_URL` if Vite uses another address/port. Set `BROWSER_EXECUTABLE` to use an existing Chromium executable. Screenshots default to ignored `artifacts/browser/`; override with `BROWSER_ARTIFACT_DIR`. Chromium automation does not establish Safari/Firefox compatibility or replace a full assistive-technology audit.

## Demo datasets and metric definitions

All data is deterministic, synthetic and calculated locally. Monetary values are INR. No real customer data, uploaded files or network APIs are used.

| Dataset | Rows | Columns | Cells | Missing cells | Missing % | Completeness | Repeated rows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Customer accounts | 240 | 8 | 1,920 | 38 | 2.0% | 98.0% | 4 |
| Sales orders | 180 | 7 | 1,260 | 23 | 1.8% | 98.2% | 3 |
| Product inventory | 96 | 6 | 576 | 13 | 2.3% | 97.7% | 0 |
| Empty dataset | 0 | 2 | 0 | 0 | 0.0% | No cells | 0 |

The unavailable dataset intentionally rejects after the simulated 350ms loading delay to demonstrate recovery.

- Missing means `null`, `undefined`, empty or whitespace-only text. Zero and `false` are populated values.
- Repeated rows compare the complete declared schema, normalizing missing values, and count occurrences **after the first**. They do not mean duplicate IDs or every member of a repeated group.
- Overview missing percentage uses all cells. Column missing percentage uses all rows. There are 35 customer rows, 21 order rows and 12 inventory rows containing at least one missing cell.
- Profiles and overview metrics always describe the full dataset. Preview filters only affect visible matching records and filtered exports.
- Missing values sort last in either direction. Numerical distributions use six bins; dates group by ISO calendar month; category/string distributions show the seven most frequent values plus the remaining tail.

## Structure and integration

```text
src/App.jsx                       Loading, dataset selection and application shell
src/components/Sidebar.jsx       Navigation and module boundaries
src/components/Overview.jsx      Dataset overview and data quality
src/components/ColumnExplorer.jsx Column profiles, samples and distribution
src/components/DatasetPreview.jsx Record controls, table and CSV export
src/data/datasets.js             Deterministic demos and abortable local loader
src/lib/exploration.js           Pure calculations, queries and CSV helpers
src/styles.css                  Shared tokens, typography and responsive styles
scripts/verify-browser.mjs       Optional end-to-end browser verification
public/assets/                  Original Stechgrow branding
public/fonts/                   Urbanist and its license
```

To integrate into Stechgrow OS, mount the exploration content in the shared application shell, replace the static team-module labels with the parent router’s real routes, and supply the authenticated dataset list/loading adapter. Components accept explicit dataset/profile/selection props; the loader boundary is `loadDataset(id, AbortSignal)`. The current dataset shape is:

```js
{
  id: 'example', name: 'Example', file: 'example.csv', description: 'Dataset summary',
  columns: [{ key: 'value', type: 'number' }],
  rows: [{ value: 42 }]
}
```

Supported types are `string`, `category`, `number`, `date` and `boolean`; current date statistics expect normalized ISO date strings. Replace the local loader with the agreed backend contract, validate incoming schema/values, and retain cancellation and loading/error states. For large datasets, move profiling, sorting, search, pagination and exports to backend endpoints and distinguish total versus filtered counts. Client-wide statistics currently require the complete dataset in memory. No API contract, authentication, upload parser, AI insights or teammate screens are invented here.

`node_modules/`, `dist/`, `coverage/`, browser artifacts, environment files, logs and OS metadata are ignored. Dependencies are not tracked; `package.json` and `package-lock.json` remain the installation source of truth.
