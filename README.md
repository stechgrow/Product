# Stechgrow Product

The existing `PRODUCT` placeholder is preserved. Dataset Exploration is supplied as an independent frontend module for the team's later application integration.

## Dataset Exploration — Aditya Arakkal

Location: [`frontend/dataset-exploration/`](frontend/dataset-exploration/).

Use Node.js 22.12 or newer and npm:

```bash
cd frontend/dataset-exploration
npm ci
npm run dev
```

Run `npm test` and `npm run build` from that directory. Each command uses the module's own package configuration and lockfile; no root package configuration is required.

See the [module README](frontend/dataset-exploration/README.md) for features and verification, and the [integration handoff](frontend/dataset-exploration/INTEGRATION.md) for source provenance, branch inspection and guidance for Caleb.
