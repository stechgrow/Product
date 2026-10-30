# Dataset Exploration integration handoff

Owner: Aditya Arakkal. Shared components and frontend integration: Caleb Fernandes.

## Source and scope

- Source: https://github.com/adityaarakkal/stechgrow-dataset-exploration
- Source branch: `feat/dataset-exploration`
- Verified source commit: `1f1bf88622a8d339ac4ef39fea31a37d042af772`
- Destination: https://github.com/stechgrow/Product
- Integration branch: `feat/dataset-exploration`
- Base: official `main` at `7b3f159b308cb9b4898f88c8ca5017ce041b109c`

All 22 tracked source files, including tests, browser verification, lockfile, fonts, logo and the original README, are copied byte for byte from that source commit. This handoff and the repository README are the only added documentation. The source repository and its Git history remain independent. No source-history merge or cherry-pick is required.

## Official repository inspection (30 October 2026)

Git advertised these five branches, including branches outside the default GitHub view:

| Branch | Inspected tip | Contents |
| --- | --- | --- |
| `main` (default) | `7b3f159` | `PRODUCT` placeholder only; no application or package configuration. |
| `Shared-Components-&-Frontend-Integration` | `7380684` | Caleb's `index.html`, `app.js`, `styles.css` and `Reusable Ui components.html`; static shared UI prototype, no package configuration. Includes an EDA demo. |
| `feature/upload-flow` | `0eabc6c` | Anshi Figer's separate React/Vite Upload Flow app at the branch root. |
| `risk-detection` | `a83c9ba` | Separate React/Vite Risk Detection app at the branch root. |
| `advisory` | `420fa9b` | Alciya's separate Next.js/TypeScript Advisory app, README-equivalent `INTEGRATION.md`, components and styles; its history has a different root from `main`. |

There is no established independent-module directory or shared React application on `main` or Caleb's branch. React/Next.js apps exist on other branches for their individual features. No dedicated Dataset Exploration, Bhoomi Automated EDA or Nishita Data Analysis implementation was found in these branch snapshots. Navigation labels, reference styles and Caleb's EDA demo are preserved as teammates' work.

The selected approach is an additive feature branch from official `main`, with the standalone app at `frontend/dataset-exploration/`. This avoids taking ownership of another feature's root-level app or imposing an unrelated-history merge. Existing branches and the root `PRODUCT` file are untouched. The module has its own package file, lockfile, assets, tests and ignore rules; it adds no root dependencies or configuration.

## Run and verify independently

From the repository root:

```bash
cd frontend/dataset-exploration
npm ci
npm test
npm run build
npm run dev
```

Use Node.js 22.12 or newer. Vite serves this directory as the application root; open the URL it prints. `npm run preview` serves the production build. The unchanged module README documents the optional Playwright setup and `npm run test:browser`. Dependencies, build output and browser artifacts are ignored and must not be committed.

This is the completed frontend demo with deterministic local datasets. It requires no backend credentials. Upload, authentication, AI analysis and the other team's screens are separate integration work.

## Guidance for Caleb's shared application integration

1. Choose the team's shared application and router before embedding. `src/App.jsx` is the complete standalone demo shell, with its own sidebar, header, dataset selection and loading states. Its internal `Explorer` function composes `Overview`, `ColumnExplorer` and `DatasetPreview`; those components already accept explicit props. Extract a public feature entry point when adopting the shared shell, preserving the keyed dataset reset, cancellation, loading, error and empty states.
2. Reuse the eventual shared sidebar/header and connect actual routes. The current sidebar explicitly identifies Bhoomi's Automated EDA and Nishita's Data Analysis as separate modules. Do not replace their implementations with this demo.
3. `src/main.jsx` imports `src/styles.css`, which includes global resets, `:root` tokens, body rules and generic class names. Keep this app on its own development/preview server until CSS is scoped or reconciled with the shared design system. Do not import that stylesheet globally into another application without this adaptation.
4. The standalone HTML, CSS and sidebar use root-relative `/assets/` and `/fonts/` URLs. They work when this module is served at its own web root. Hosting it under a URL subpath requires adapting Vite base settings and all asset URLs; the filesystem directory is not a deployment URL prefix. Preserve the Urbanist font license.
5. The current data boundary is `loadDataset(id, AbortSignal)` in `src/data/datasets.js`. Replace the demo dataset list and loader only after the authenticated backend contract is agreed. The module README documents the column/row schema and client-side scalability limits.
6. Preserve overview/quality calculations, searchable column profiles, record search/sort/filter/pagination/visibility, both CSV exports, keyboard navigation and mobile behavior. Run the existing calculation/loading tests and browser checks after adapting the shared shell.

The supplied module is ready to run independently. Mounting into Caleb's eventual shared application and connecting a backend remain follow-up team integration tasks.
