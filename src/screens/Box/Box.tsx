import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import {
  Upload, Search, Bell, RefreshCw, SlidersHorizontal,
  AlignLeft, Info, ArrowUpRight, LayoutDashboard,
  ChartNoAxesCombined, ShieldCheck, ClipboardList,
  Settings, Palette, Headphones, ChevronDown, FileSpreadsheet,
  LoaderCircle, X, CircleAlert, PanelLeft
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine
} from "recharts";
import "./Box.css";

/* ============================== TYPES ============================== */
type Row = Record<string, string>;
type Tab = "details" | "anomalies";
type Tone = "pink" | "purple" | "green";
type SummaryRow = [label: string, value: string | number, tone: Tone];

/* ============================== CONSTANTS ============================== */
const initialRows: Row[] = [
  { Revenue: "1200", Orders: "35", Customers: "22", Rating: "4.2", Region: "Mumbai" },
  { Revenue: "1800", Orders: "48", Customers: "31", Rating: "4.5", Region: "Pune" },
  { Revenue: "900", Orders: "20", Customers: "15", Rating: "3.8", Region: "Mumbai" },
  { Revenue: "2500", Orders: "67", Customers: "43", Rating: "4.8", Region: "Delhi" },
  { Revenue: "1500", Orders: "39", Customers: "27", Rating: "4.1", Region: "Pune" },
  { Revenue: "5000", Orders: "90", Customers: "58", Rating: "4.9", Region: "Delhi" },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Exploratory Data Analysis", icon: ChartNoAxesCombined },
  { label: "Data Analysis", icon: ChartNoAxesCombined },
  { label: "Risk Detection & Health", icon: ShieldCheck },
  { label: "Advisory Recommendation", icon: ShieldCheck },
  { label: "Report", icon: ClipboardList },
  { label: "Employee Dashboard", icon: LayoutDashboard },
];

const BOTTOM_ITEMS = [
  { label: "Preferences", icon: SlidersHorizontal },
  { label: "Theme", icon: Palette },
  { label: "Help & Support", icon: Headphones },
  { label: "Settings", icon: Settings },
];

const AVATAR_URL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
const MISSING_TICKS = [200, 400, 600, 800, 1000];

// [height px, colour] for the little bar decorations on the cards
const CATEGORY_BARS: [number, string][] = [[40, "#ec4899"], [48, "#a855f7"], [32, "#34d399"]];
const DATETIME_BARS: [number, string][] = [[44, "#34d399"], [32, "#14b8a6"], [48, "#6ee7b7"]];

// Heatmap colours: first stop whose min is below the value wins; below all stops -> pink
const HEAT_STOPS: [number, string][] = [
  [0.75, "#FF5100"], [0.5, "#FF854C"], [0.25, "#FFC5AA"], [0, "#C4C4FF"],
  [-0.25, "#9B9BFF"], [-0.5, "#8787FF"], [-0.75, "#6767C5"],
];

/* ============================== HELPERS ============================== */
const isMissing = (value: unknown) => value == null || String(value).trim() === "";
const mean = (values: number[]) => values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
const formatNumber = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
const heatColor = (value: number) => HEAT_STOPS.find(([min]) => value > min)?.[1] ?? "#F275BB";
const axisLetter = (index: number) => String.fromCharCode(65 + (index % 26));

function numericValues(rows: Row[], column: string): number[] {
  return rows
    .map(row => row[column])
    .filter(value => !isMissing(value))
    .map(Number)
    .filter(Number.isFinite);
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Pearson correlation of two columns (rows with a blank in either column are skipped)
function correlation(rows: Row[], a: string, b: string): number {
  const pairs: [number, number][] = [];
  for (const row of rows) {
    if (isMissing(row[a]) || isMissing(row[b])) continue;
    const x = Number(row[a]);
    const y = Number(row[b]);
    if (Number.isFinite(x) && Number.isFinite(y)) pairs.push([x, y]);
  }
  if (pairs.length < 2) return 0;

  const meanX = mean(pairs.map(p => p[0]));
  const meanY = mean(pairs.map(p => p[1]));
  let num = 0, varX = 0, varY = 0;
  for (const [x, y] of pairs) {
    num += (x - meanX) * (y - meanY);
    varX += (x - meanX) ** 2;
    varY += (y - meanY) ** 2;
  }
  const den = Math.sqrt(varX * varY);
  return den ? num / den : 0;
}

/* ============================== SMALL COMPONENTS ============================== */
const NavIcon = ({ icon: Icon }: { icon: typeof Upload }) => <Icon size={17} strokeWidth={1.8} />;

const SummaryRows = ({ rows, compact }: { rows: SummaryRow[]; compact?: boolean }) => (
  <div className={`summary-rows ${compact ? "summary-rows--compact" : ""}`}>
    {rows.map(([label, value, tone]) => (
      <div key={label}>
        <span>{label}</span>
        <strong>{value}</strong>
        <i className={`row-line row-line--${tone}`} />
      </div>
    ))}
  </div>
);

const BarGroup = ({ bars }: { bars: [number, string][] }) => (
  <div className="bar-group">
    {bars.map(([height, color]) => <i key={color} style={{ height, background: color }} />)}
  </div>
);

/* ============================== MAIN COMPONENT ============================== */
export const Box = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------- state ---------- */
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [fileName, setFileName] = useState("Sample dataset");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("details");
  const [activeNav, setActiveNav] = useState("Exploratory Data Analysis");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  /* ---------- column types ---------- */
  const columns = useMemo(() => (rows.length ? Object.keys(rows[0]) : []), [rows]);

  const numericColumns = useMemo(() => columns.filter(column => {
    const count = numericValues(rows, column).length;
    return count > 0 && count >= rows.length * 0.5;
  }), [columns, rows]);

  const datetimeColumns = useMemo(
    () => columns.filter(c => !numericColumns.includes(c) && /date|time|timestamp|created_at/i.test(c)),
    [columns, numericColumns]
  );

  const categoricalColumns = columns.filter(
    c => !numericColumns.includes(c) && !datetimeColumns.includes(c)
  );

  /* ---------- search ---------- */
  const query = search.toLowerCase();
  const matches = (name: string) => name.toLowerCase().includes(query);
  const visibleColumns = columns.filter(matches);

  /* ---------- missing values ---------- */
  const missingByColumn = useMemo(() => columns.map(name => {
    const missing = rows.filter(row => isMissing(row[name])).length;
    return { name, missing, percent: rows.length ? (missing / rows.length) * 100 : 0 };
  }), [columns, rows]);

  const totalMissing = missingByColumn.reduce((sum, item) => sum + item.missing, 0);
  const missingPercent = rows.length && columns.length
    ? (totalMissing / (rows.length * columns.length)) * 100
    : 0;

  // Spread columns evenly across a 200–1000 axis (keeps each column's missing count)
  const missingChart = missingByColumn.map((item, index) => ({
    name: missingByColumn.length <= 1 ? 600 : 200 + (index / (missingByColumn.length - 1)) * 800,
    missing: item.missing,
  }));

  /* ---------- statistics & outliers (IQR) ---------- */
  const statistics = useMemo(() => numericColumns.map(column => {
    const values = numericValues(rows, column);
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)));
    const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)));
    const low = q1 - 1.5 * (q3 - q1);
    const high = q3 + 1.5 * (q3 - q1);
    return {
      column,
      mean: mean(values),
      median: median(values),
      outliers: values.filter(v => v < low || v > high),
    };
  }), [numericColumns, rows]);

  const anomalyRows = statistics.flatMap(stat =>
    stat.outliers.map(value => ({ column: stat.column, value, mean: stat.mean, median: stat.median }))
  );

  const averageOf = (key: "mean" | "median") =>
    statistics.length ? formatNumber(mean(statistics.map(s => s[key]))) : "—";

  /* ---------- correlation heatmap ---------- */
  const heatmap = useMemo(() => numericColumns.map(a => ({
    name: a,
    cells: numericColumns.map(b => ({ column: b, value: correlation(rows, a, b) })),
  })), [numericColumns, rows]);

  const averageCorrelation = useMemo(() => {
    const values = heatmap.flatMap(row =>
      row.cells.filter(cell => cell.column !== row.name).map(cell => Math.abs(cell.value))
    );
    return mean(values);
  }, [heatmap]);

  const heatGrid = `repeat(${numericColumns.length}, minmax(0, 1fr))`;

  /* ---------- actions ---------- */
  const handleUpload = (file?: File) => {
    if (!file) return;
    setError("");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    setLoading(true);
    setFileName(file.name);

    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: header => header.trim(),
      complete: result => {
        const parsed = result.data.filter(row => Object.values(row).some(v => !isMissing(v)));

        if (!parsed.length || !Object.keys(parsed[0] ?? {}).length) {
          setError("This CSV has no usable data. Please check the file and try again.");
        } else {
          setRows(parsed);
          setTab("details");
          setSearch("");
        }
        if (result.errors.length) console.warn("CSV parsing warnings:", result.errors);
        setLoading(false);
      },
      error: () => {
        setError("The CSV could not be read. Please try another file.");
        setLoading(false);
      },
    });
  };

  const resetData = () => {
    setRows(initialRows);
    setFileName("Sample dataset");
    setError("");
    setSearch("");
  };

  const toggleSettings = () => setShowSettings(v => !v);
  const toggleInfo = () => setShowInfo(v => !v);
  const columnType = (column: string) =>
    numericColumns.includes(column) ? "numeric" : datetimeColumns.includes(column) ? "datetime" : "categorical";

  /* ============================== RENDER ============================== */
  return (
    <main className={`eda-app ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>

      {/* ---------- SIDEBAR ---------- */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>Stechgrow</span>
          <button
            className="brand-menu"
            type="button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed(v => !v)}
          >
            <PanelLeft size={19} />
          </button>
        </div>

        <button className="quick-search" onClick={() => document.getElementById("dataset-search")?.focus()}>
          <Search size={17} /> AI Quick Search
        </button>

        <nav className="main-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "nav-active" : ""}`}
              onClick={() => setActiveNav(item.label)}
            >
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {BOTTOM_ITEMS.map(item => (
            <button key={item.label} className="nav-item" onClick={toggleSettings}>
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="main-content">

        {/* ---------- TOPBAR ---------- */}
        <header className="topbar">
          <button className="upload-button" onClick={() => inputRef.current?.click()}>
            <Upload size={18} /> Upload
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={event => {
              handleUpload(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />

          <label className="search-box">
            <Search size={19} />
            <input
              id="dataset-search"
              placeholder="Search for anything"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            {search && <button onClick={() => setSearch("")}><X size={15} /></button>}
          </label>

          <div className="topbar-spacer" />

          <div className="topbar-icon-group">
            <button className="icon-button" title="Refresh dataset" onClick={resetData}><RefreshCw size={18} /></button>
            <button className="icon-button" title="Notifications" onClick={toggleInfo}><Bell size={18} /></button>
          </div>

          <div className="avatar-wrapper">
            <img src={AVATAR_URL} alt="Profile" />
            <span className="avatar-dot" />
          </div>
        </header>

        {/* ---------- PAGE HEADING ---------- */}
        <div className="page-heading">
          <div>
            <h1>Automated Exploratory Data Analysis</h1>
            <p className="dataset-name"><FileSpreadsheet size={14} /> {fileName}</p>
          </div>
          <div className="heading-actions">
            <button className="icon-button" title="Display settings" onClick={toggleSettings}><SlidersHorizontal size={18} /></button>
            <button className="icon-button" title="List view" onClick={() => setTab("details")}><AlignLeft size={18} /></button>
            <button className="icon-button" title="Reset sample data" onClick={resetData}><RefreshCw size={18} /></button>
            <button className="icon-button" title="Information" onClick={toggleInfo}><Info size={18} /></button>
            <button className="data-analysis-button" onClick={() => setActiveNav("Data Analysis")}>
              <LayoutDashboard size={18} /> Data Analysis
            </button>
          </div>
        </div>

        {/* ---------- BANNERS ---------- */}
        {error && (
          <div className="error-banner">
            <CircleAlert size={18} />
            <span>{error}</span>
            <button onClick={() => setError("")}><X size={16} /></button>
          </div>
        )}
        {loading && (
          <div className="loading-banner">
            <LoaderCircle size={19} className="spin" /> Processing your CSV file...
          </div>
        )}
        {showInfo && (
          <div className="notice-banner">
            This dashboard calculates statistics from the dataset currently loaded in your browser.
            <button onClick={() => setShowInfo(false)}><X size={15} /></button>
          </div>
        )}
        {showSettings && (
          <div className="notice-banner">
            <span>Heatmap display options</span>
            <button onClick={() => setShowSettings(false)}><X size={15} /></button>
          </div>
        )}

        {/* ---------- SUMMARY CARDS ---------- */}
        <section className="summary-grid">
          <article className="summary-card">
            <div className="card-heading">Data Summary <ArrowUpRight size={17} /></div>
            <div className="big-number">{formatNumber(rows.length)}</div>
            <SummaryRows rows={[
              ["Total Rows", formatNumber(rows.length), "pink"],
              ["Total Columns", columns.length, "purple"],
            ]} />
          </article>

          <article className="summary-card">
            <div className="card-heading">
              <span>Numeric Columns</span>
              <span className="correlation-badge">{averageCorrelation.toFixed(2)}</span>
            </div>
            <div className="big-number">{numericColumns.length}</div>
            <SummaryRows compact rows={[
              ["Mean", averageOf("mean"), "pink"],
              ["Median", averageOf("median"), "purple"],
              ["Average correlation", averageCorrelation.toFixed(2), "green"],
            ]} />
          </article>

          <article className="summary-card summary-card--split">
            <div>
              <div className="card-heading">Categorical Columns <ArrowUpRight size={17} /></div>
              <div className="big-number">{categoricalColumns.length}</div>
              <p className="muted">Detected text and category fields</p>
              <div className="category-pills">
                {categoricalColumns.slice(0, 4).map((column, index) => (
                  <span key={column} className={`pill pill-${index}`}>{column}</span>
                ))}
                {!categoricalColumns.length && <span className="muted">No categorical columns</span>}
              </div>
            </div>
            <BarGroup bars={CATEGORY_BARS} />
          </article>

          <article className="summary-card summary-card--split">
            <div>
              <div className="card-heading">Datetime Columns <ArrowUpRight size={17} /></div>
              <div className="big-number">{datetimeColumns.length}</div>
              <p className="muted">Detected date and time fields</p>
            </div>
            <BarGroup bars={DATETIME_BARS} />
          </article>
        </section>

        {/* ---------- ANALYSIS GRID ---------- */}
        <section className="analysis-grid">
          <div className="left-analysis">

            {/* Missing values */}
            <article className="panel missing-panel">
              <div className="panel-title">
                <h2>Missing values</h2>
                <span className="correlation-indicator">
                  Average correlation <strong>{averageCorrelation.toFixed(2)}</strong>
                </span>
              </div>

              <div className="missing-content">
                <div className="missing-stat">
                  <p>Empty cells found</p>
                  <div className="big-number">{formatNumber(totalMissing)}</div>
                  <span className="success-badge">{missingPercent.toFixed(2)}%</span>
                  <small>of all dataset cells</small>
                </div>

                <div className="missing-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={missingChart}>
                      <defs>
                        <linearGradient id="missingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      {MISSING_TICKS.map(tick => (
                        <ReferenceLine key={tick} x={tick} stroke="#3b3b43" strokeDasharray="3 4" strokeOpacity={0.6} />
                      ))}

                      <XAxis
                        type="number"
                        dataKey="name"
                        domain={[200, 1000]}
                        ticks={MISSING_TICKS}
                        interval={0}
                        padding={{ left: 15, right: 15 }}
                        allowDecimals={false}
                        tickFormatter={(value: number) => String(value)}
                        tick={{ fill: "#d0d0d5", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide domain={[0, (dataMax: number) => Math.max(1, dataMax * 1.15)]} />
                      <Tooltip contentStyle={{ background: "#1f222a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
                      <Area dataKey="missing" type="monotone" stroke="#a78bfa" strokeWidth={3} fill="url(#missingGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </article>

            {/* Dataset details / anomalies */}
            <article className="panel details-panel">
              <div className="tab-header">
                <button className={tab === "anomalies" ? "selected-tab" : ""} onClick={() => setTab("anomalies")}>
                  Top Anomalies
                </button>
                <button className={tab === "details" ? "selected-tab" : ""} onClick={() => setTab("details")}>
                  Dataset Details
                </button>
              </div>

              <div className="table-scroll">
                {tab === "details" ? (
                  <table>
                    <thead>
                      <tr><th>Column</th><th>Data type</th><th>Sample</th><th>Missing</th><th>Mean</th><th>Median</th></tr>
                    </thead>
                    <tbody>
                      {visibleColumns.map(column => {
                        const stat = statistics.find(s => s.column === column);
                        const missing = missingByColumn.find(m => m.name === column);
                        const sample = rows.find(row => !isMissing(row[column]))?.[column] ?? "—";
                        return (
                          <tr key={column}>
                            <td>{column}</td>
                            <td>{columnType(column)}</td>
                            <td>{String(sample).slice(0, 25)}</td>
                            <td>{missing?.missing ?? 0} ({(missing?.percent ?? 0).toFixed(1)}%)</td>
                            <td>{stat ? formatNumber(stat.mean) : "—"}</td>
                            <td>{stat ? formatNumber(stat.median) : "—"}</td>
                          </tr>
                        );
                      })}
                      {!visibleColumns.length && <tr><td colSpan={6}>No matching columns found.</td></tr>}
                    </tbody>
                  </table>
                ) : (
                  <table>
                    <thead>
                      <tr><th>Column</th><th>Outlier value</th><th>Mean</th><th>Median</th><th>Detection</th></tr>
                    </thead>
                    <tbody>
                      {anomalyRows.filter(item => matches(item.column)).map((item, index) => (
                        <tr key={`${item.column}-${index}`}>
                          <td>{item.column}</td>
                          <td>{formatNumber(item.value)}</td>
                          <td>{formatNumber(item.mean)}</td>
                          <td>{formatNumber(item.median)}</td>
                          <td><span className="warning-badge">Potential IQR outlier</span></td>
                        </tr>
                      ))}
                      {!anomalyRows.length && <tr><td colSpan={5}>No potential outliers detected.</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </article>
          </div>

          {/* Correlation heatmap */}
          <article className="panel heatmap-panel">
            <div className="panel-title">
              <h2>Co-relation Heatmap</h2>
              <button className="map-style-btn">
                <span>Map Style</span>
                <ChevronDown size={14} />
              </button>
            </div>

            {heatmap.length > 0 ? (
              <div className="heatmap-wrap">
                <div className="heatmap-row">
                  {/* Y labels */}
                  <div className="heatmap-axis heatmap-axis--y">
                    {heatmap.map((row, index) => (
                      <span key={row.name} title={row.name}>{axisLetter(index)}</span>
                    ))}
                  </div>

                  {/* Cells */}
                  <div className="heatmap-block" style={{ gridTemplateColumns: heatGrid, gridTemplateRows: heatGrid }}>
                    {heatmap.map(row => row.cells.map(cell => (
                      <div
                        key={`${row.name}-${cell.column}`}
                        className="heatmap-cell"
                        title={`${row.name} × ${cell.column}: ${cell.value.toFixed(3)}`}
                        style={{ backgroundColor: heatColor(cell.value) }}
                      />
                    )))}
                  </div>

                  {/* Scale legend */}
                  <div className="heatmap-scale">
                    <span>1.00</span>
                    <div className="heatmap-scale-bar" />
                    <span>-1.00</span>
                  </div>
                </div>

                {/* X labels */}
                <div className="heatmap-axis heatmap-axis--x">
                  {numericColumns.map((column, index) => (
                    <span key={column} title={column}>{axisLetter(index)}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <ChartNoAxesCombined size={34} />
                <h3>No numeric columns</h3>
                <p>Upload a CSV containing numeric data to calculate correlations.</p>
              </div>
            )}
          </article>
        </section>

        <footer className="page-footer">
          <span>Automated EDA · Browser-based analysis</span>
          <span>{rows.length.toLocaleString()} rows · {columns.length} columns</span>
        </footer>
      </section>
    </main>
  );
};