# Stechgrow Advisory Module — Integration & Developer Guide

This document explains the architecture of the **Advisory Module** built with Next.js (App Router, TypeScript, Vanilla CSS), designed to meet all project deliverables and enable modular integration into the main Stechgrow platform.

---

## 1. Deliverables Checklist

| Deliverable | Status | Implementation Details |
| :--- | :--- | :--- |
| **Completed Advisory page** | Completed | Available at `/` and `/advisory` routes with full navigation, headers, metrics, and actions. |
| **Recommendation cards & information panels** | Completed | `<RecommendationCard />` with checklist items + `<InformationPanel />` slide-over drawer with telemetry, variance table, root cause, and mitigations. |
| **Priority and status indicators** | Completed | Visual priority dots (`Critical`, `High`, `Medium`, `Low`), status pills (`Immediate Action Required`, `In Progress`, `Under Review`, `Completed`), and impact badges (`High Impact`, `Medium Impact`). |
| **Responsive advisory layout** | Completed | Fluid grid layouts with media breakpoints for desktop (>1200px), tablet (768px-1080px), and mobile (360px-640px) with collapsible sidebar and mobile drawer. |

---

## 2. Project Structure

```
Stechgrow/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with 'Urbanist' font & meta tags
│   │   ├── page.tsx               # Primary dashboard route (/)
│   │   └── advisory/
│   │       └── page.tsx           # Standalone advisory route (/advisory)
│   ├── components/
│   │   ├── advisory/
│   │   │   ├── index.ts           # Public barrel export
│   │   │   ├── AdvisorySection.tsx# Core modular Advisory Section
│   │   │   ├── AdvisoryMetrics.tsx# 4 Summary metric cards
│   │   │   ├── AdvisoryFilters.tsx# Real-time search, category & priority dropdowns
│   │   │   ├── RecommendationCard.tsx # Figma-accurate card with interactive checklist
│   │   │   ├── InformationPanel.tsx # Diagnostic slide-over drawer & KPI variance table
│   │   │   ├── ExecutiveReportModal.tsx # "Get your Report" modal & PDF export
│   │   │   ├── types.ts           # Complete TypeScript interfaces
│   │   │   └── mockData.ts        # Seed data matching Figma designs
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx# Shell layout (Sidebar + Header + Content)
│   │   │   ├── Sidebar.tsx        # Responsive collapsible navigation
│   │   │   └── TopHeader.tsx      # Header with search, upload, AI sparkle, & profile
│   │   └── ui/
│   │       └── Toast.tsx          # Real-time user feedback notification
│   └── styles/
│       ├── globals.css            # Figma color tokens & reset
│       ├── layout.css             # Responsive layout rules & drawer
│       └── advisory.css           # Advisory cards, grids, metrics & modal styles
├── index.html                     # Original static reference (preserved)
├── Styles.css                     # Original CSS reference (preserved)
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## 3. How to Integrate into the Main Full Website

### Option A: Import as a Complete Section
You can embed the advisory module anywhere into an existing page or layout:

```tsx
import { AdvisorySection } from '@/components/advisory';

export default function InsightsPage() {
  return (
    <div className="my-page-wrapper">
      <AdvisorySection />
    </div>
  );
}
```

### Option B: Pass Custom Telemetry Data & Metrics via Props
The `<AdvisorySection />` accepts optional props if data is fetched from an external API or database:

```tsx
import { AdvisorySection, Recommendation, MetricSummary } from '@/components/advisory';

export default function CustomAdvisory({ customRecs, customMetrics }) {
  return (
    <AdvisorySection
      initialRecommendations={customRecs}
      initialMetrics={customMetrics}
    />
  );
}
```

### Option C: Import Individual Subcomponents
Each subcomponent can also be used independently:
- `<AdvisoryMetrics metrics={metrics} />` — renders the 4 summary metrics cards.
- `<RecommendationCard recommendation={rec} onToggleAction={...} onOpenDetails={...} />` — individual cards.
- `<InformationPanel recommendation={selectedRec} isOpen={isOpen} onClose={...} />` — deep diagnostic drawer.
- `<ExecutiveReportModal isOpen={isOpen} onClose={...} metrics={metrics} />` — report dialog.

---

## 4. Key Interactive Features

1. **Interactive Checklist**: Clicking any action item inside a card marks it as completed with visual strikethrough, triggers toast feedback, and increments the "Completed" metrics summary count in real-time.
2. **Detailed Information Panel**: Clicking "View Diagnostics" on any card opens a slide-over panel showing:
   - Root cause diagnostics
   - Risk index score (0-100)
   - Affected business segments
   - Telemetry table with Current vs. Target vs. Variance
   - Action item ownership & timeline breakdown
   - Status toggling ("Immediate Action Required" ⟷ "Completed")
3. **Multi-dimensional Filtering**: Filter cards by Category (Revenue, Data Quality, Customer Retention, Operations), Priority (Critical, High, Medium, Low), or full-text live search.
4. **"Get your Report" CTA**: Opens the Executive Advisory Synthesis modal with options to trigger a report export.
5. **Full Responsiveness**: Tested across desktop (1440px+), laptop (1200px), tablet (768px-1024px), and mobile (360px-480px).
