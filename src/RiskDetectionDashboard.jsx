import './risk-detection-dashboard.css';

import notificationBell from './assets/notification-bell.svg';
import upload from './assets/upload.svg';
import avatar from './assets/avatar.png';
import dashboardLine from './assets/dashboard-line.svg';
import logo from './assets/logo.svg';
import magnifierQuick from './assets/magnifier-quick.svg';
import avatarStatus from './assets/avatar-status.svg';
import chatAi from './assets/chat-ai.svg';
import magnifierSearch from './assets/magnifier-search.svg';
import advisoryFlag from './assets/advisory-flag.svg';
import info from './assets/info.svg';
import refresh from './assets/refresh.svg';
import menu from './assets/menu.svg';
import filter from './assets/filter.svg';
import arrowUp from './assets/arrow-up.svg';
import trendUp from './assets/trend-up.svg';
import trendDown from './assets/trend-down.svg';
import line4 from './assets/line-4.svg';
import line5 from './assets/line-5.svg';
import chartCurve from './assets/chart-curve.svg';
import markerLinePeak from './assets/marker-line-peak.svg';
import markerLineHigh from './assets/marker-line-high.svg';
import markerLineMid from './assets/marker-line-mid.svg';
import markerLineLow from './assets/marker-line-low.svg';
import markerDot from './assets/marker-dot.svg';
import legendRevenue from './assets/legend-revenue.svg';
import legendCustomers from './assets/legend-customers.svg';
import legendStable from './assets/legend-stable.svg';
import legendOffline from './assets/legend-offline.svg';
import patternA from './assets/pattern-a.svg';
import patternB from './assets/pattern-b.svg';
import patternC from './assets/pattern-c.svg';
import clipboardRow from './assets/clipboard-row.svg';
import dashboardLineNav from './assets/dashboard-line-nav.svg';
import navEda from './assets/nav-eda.svg';
import navDataAnalysis from './assets/nav-data-analysis.svg';
import navRiskDetection from './assets/nav-risk-detection.svg';
import navAdvisory from './assets/nav-advisory.svg';
import navReport from './assets/nav-report.svg';
import navPreferences from './assets/nav-preferences.svg';
import navTheme from './assets/nav-theme.svg';
import navHelp from './assets/nav-help.svg';
import navSettings from './assets/nav-settings.svg';

const Icon = ({ cls, src }) => (
  <div className={`icon ${cls}`}>
    <img alt="" src={src} />
  </div>
);

const ArrowButton = ({ name }) => (
  <>
    <div className={`arrow-button arrow-button-${name}`} />
    <Icon cls={`arrow-icon arrow-icon-${name}`} src={arrowUp} />
  </>
);

const Badge = ({ name, children }) => (
  <>
    <div className={`badge badge-${name}`} />
    <p className={`badge-label badge-label-${name}`}>{children}</p>
  </>
);

const GrowthIndicator = () => (
  <>
    <p className="growth-text">+4.8%</p>
    <div className="growth-arrow">
      <img alt="" src={trendUp} />
    </div>
  </>
);

const MarkerLine = ({ name, src }) => (
  <div className={`chart-marker-line chart-marker-line-${name}`}>
    <div className="chart-marker-line-inner">
      <img alt="" src={src} />
    </div>
  </div>
);

const MarkerDot = ({ name }) => (
  <div className={`chart-marker-dot chart-marker-dot-${name}`}>
    <img alt="" src={markerDot} />
  </div>
);

const GridLine = ({ name, src }) => (
  <div className={`chart-grid-line chart-grid-line-${name}`}>
    <div className="chart-grid-line-inner">
      <img alt="" src={src} />
    </div>
  </div>
);

const ProgressBar = ({ name, percent, legendIcon, legendLabel }) => (
  <>
    <Icon cls={`legend-icon legend-icon-${name}`} src={legendIcon} />
    <p className={`legend-label legend-label-${name}`}>{legendLabel}</p>
    <div className={`progress-bar progress-bar-${name}`}>
      <div className="progress-pattern progress-pattern-a">
        <div className="progress-pattern-inner">
          <img alt="" src={patternA} />
        </div>
      </div>
      <div className="progress-pattern progress-pattern-b">
        <div className="progress-pattern-inner">
          <img alt="" src={patternB} />
        </div>
      </div>
      <div className="progress-pattern progress-pattern-c">
        <div className="progress-pattern-inner">
          <img alt="" src={patternC} />
        </div>
      </div>
      <div className={`progress-fill progress-fill-${name}`} />
      <div className={`progress-divider progress-divider-${name}`} />
    </div>
    <p className={`progress-percent progress-percent-${name}`}>{percent}</p>
  </>
);

const NavItem = ({ name, icon, iconCls = '', children }) => (
  <div className={`nav-item nav-item-${name}`}>
    <div className={`nav-icon ${iconCls}`.trim()}>
      <img alt="" src={icon} />
    </div>
    <p className="nav-label">{children}</p>
  </div>
);

export default function RiskDetectionDashboard() {
  return (
    <div className="risk-detection-page">
      
      <div className="brand-card" />
      <div className="stat-card stat-card-performance" />
      <div className="stat-card stat-card-anomalies" />
      <div className="stat-card stat-card-retention" />
      <div className="stat-card stat-card-confidence" />
      <div className="panel-business-metrics-chart" />
      <div className="panel-business-metrics-table" />
      <div className="panel-business-stability" />
      <div className="panel-ai-insight" />
      <div className="sidebar" />

      
      <Icon cls="brand-toggle-icon" src={dashboardLine} />
      <Icon cls="brand-logo" src={logo} />
      <div className="quick-search" />
      <p className="quick-search-label">AI Quick Search</p>
      <div className="quick-search-icon-bg" />
      <Icon cls="quick-search-icon" src={magnifierQuick} />

      
      <div className="upload-button">
        <div className="upload-content">
          <div className="icon upload-icon">
            <img alt="" src={upload} />
          </div>
          <p className="upload-label">Upload</p>
        </div>
      </div>

      <div className="search-bar" />
      <div className="search-bar-content">
        <div className="icon search-bar-icon">
          <img alt="" src={magnifierSearch} />
        </div>
        <p className="search-bar-text">Search for anything</p>
      </div>

      <div className="ai-chat-button" />
      <Icon cls="ai-chat-icon" src={chatAi} />

      <div className="notification-button">
        <div className="notification-button-bg" />
        <div className="notification-button-icon">
          <img alt="" src={notificationBell} />
        </div>
      </div>

      <div className="avatar-frame">
        <div className="avatar-image-clip">
          <img alt="" src={avatar} />
        </div>
      </div>
      <Icon cls="avatar-status" src={avatarStatus} />

      
      <p className="page-title">Risk Detection &amp; Business Heath</p>

      <div className="tool-button tool-button-filter" />
      <Icon cls="tool-icon-filter" src={filter} />
      <div className="tool-button tool-button-menu" />
      <Icon cls="tool-icon-menu" src={menu} />
      <div className="tool-button tool-button-refresh" />
      <Icon cls="tool-icon-refresh" src={refresh} />
      <div className="tool-button tool-button-info" />
      <Icon cls="tool-icon-info" src={info} />

      <div className="get-advisory-button" />
      <p className="get-advisory-label">Get Advisory</p>
      <Icon cls="get-advisory-icon" src={advisoryFlag} />

      
      <p className="card-title title-performance-score">Performance Score</p>
      <p className="card-value value-performance">78</p>
      <Badge name="stable-performance">Stable</Badge>
      <GrowthIndicator />
      <ArrowButton name="performance" />

      <p className="card-title title-anomalies-detected">Anomalies Detected </p>
      <p className="card-value value-anomalies">13</p>
      <Badge name="high-anomalies">4 High</Badge>
      <Badge name="medium-anomalies">6 Medium</Badge>
      <ArrowButton name="anomalies" />

      
      <p className="card-title title-customer-retention">Customer Retention Rate</p>
      <p className="card-value value-retention">87%</p>
      <Badge name="stable-retention">Stable</Badge>
      <ArrowButton name="retention" />

     
      <p className="card-title title-ai-confidence">AI Confidence</p>
      <p className="card-value value-confidence">94%</p>
      <Badge name="high-confidence">4 High</Badge>
      <ArrowButton name="confidence" />

      
      <p className="card-title title-business-metrics">Business Metrics</p>
      <ArrowButton name="chart" />

      <div className="metric-tab metric-tab-revenue">
        <p className="metric-tab-label">Revnue</p>
      </div>
      <div className="metric-tab metric-tab-churn">
        <p className="metric-tab-label">Customer churn</p>
      </div>
      <div className="metric-tab metric-tab-conversion">
        <p className="metric-tab-label">Conversion</p>
      </div>
      <div className="metric-tab metric-tab-acquisition">
        <p className="metric-tab-label">Acquisition</p>
      </div>

      <p className="axis-label axis-label-300">300</p>
      <p className="axis-label axis-label-200">200</p>
      <p className="axis-label axis-label-100">100</p>
      <p className="axis-label axis-label-days">30D 14D</p>

      <GridLine name="300" src={line4} />
      <GridLine name="200" src={line5} />
      <GridLine name="100" src={line5} />
      <GridLine name="0" src={line5} />

      <Icon cls="chart-curve" src={chartCurve} />
      <MarkerLine name="peak" src={markerLinePeak} />
      <div className="chart-tooltip">
        <p className="chart-tooltip-text">192</p>
      </div>
      <MarkerLine name="high" src={markerLineHigh} />
      <MarkerDot name="high" />
      <MarkerDot name="mid" />
      <MarkerLine name="mid" src={markerLineMid} />
      <MarkerLine name="low" src={markerLineLow} />
      <MarkerDot name="low" />

      <div className="series-tab series-tab-risk-score">
        <p className="series-tab-label">Risk Score</p>
      </div>
      <div className="series-tab series-tab-revenue-impact">
        <p className="series-tab-label">Revenue Impact</p>
      </div>
      <div className="series-tab series-tab-churn-pattern">
        <p className="series-tab-label">Churn Pattern</p>
      </div>

      
      <p className="card-title title-business-stability">Business Stability</p>
      <ArrowButton name="stability" />
      <p className="card-value value-stability">72%</p>
      <Badge name="moderate">Moderate</Badge>

      <ProgressBar name="revenue" percent="69%" legendIcon={legendRevenue} legendLabel="Revenue" />
      <ProgressBar name="customers" percent="75%" legendIcon={legendCustomers} legendLabel="Customers" />
      <ProgressBar name="stable" percent="53%" legendIcon={legendStable} legendLabel="Stable" />
      <ProgressBar name="offline" percent="80%" legendIcon={legendOffline} legendLabel="Offline Sales" />

      
      <p className="card-title title-business-metrics-table">Business Metrics</p>
      <ArrowButton name="insight" />

      <p className="table-head table-head-risk-type">Risk Type</p>
      <p className="table-head table-head-metric">Metric</p>
      <p className="table-head table-head-severity">Severity</p>
      <p className="table-head table-head-impact">Business Impact</p>

      <div className="table-row table-row-1" />
      <div className="table-row-icon-box table-row-icon-box-1" />
      <Icon cls="table-row-icon table-row-icon-1" src={clipboardRow} />
      <p className="table-cell-text table-cell-name-1">Stechgorw_Design...</p>
      <div className="table-trend-up">
        <img alt="" src={trendUp} />
      </div>
      <p className="table-cell-text table-cell-metric-1">Subscription B</p>
      <div className="severity-pill severity-pill-high" />
      <p className="severity-label severity-label-high">High</p>
      <p className="table-cell-text table-cell-impact-1">Estimated- ₹ 3754</p>

      <div className="table-row table-row-2" />
      <div className="table-row-icon-box table-row-icon-box-2" />
      <Icon cls="table-row-icon table-row-icon-2" src={clipboardRow} />
      <p className="table-cell-text table-cell-name-2">Stechgorw_Design...</p>
      <div className="table-trend-down">
        <div className="table-trend-down-inner">
          <div>
            <img alt="" src={trendDown} />
          </div>
        </div>
      </div>
      <p className="table-cell-text table-cell-metric-2">Transaction</p>
      <div className="severity-pill severity-pill-medium" />
      <p className="severity-label severity-label-medium">Medium</p>
      <p className="table-cell-text table-cell-impact-2">Estimated- ₹ 3754</p>

      <div className="scrollbar-track" />
      <div className="scrollbar-thumb" />

     
      <p className="card-title title-ai-insight">AI Insight</p>
      <p className="insight-text">{`Revenue decline observed in Subscription Plan B, correlation with increased churn in Segment B,  adjust retention offers to mitgate impact.`}</p>
      <div className="detail-button">
        <div className="detail-button-bg" />
        <p className="detail-button-label">View Detailed Analysis</p>
      </div>

      
      <NavItem name="dashboard" icon={dashboardLineNav} iconCls="nav-icon-dashboard">Dashboard</NavItem>
      <NavItem name="eda" icon={navEda}>Exploratory Data Analysis</NavItem>
      <NavItem name="data-analysis" icon={navDataAnalysis}>Data Analysis</NavItem>

      <div className="nav-item nav-item-risk-detection">
        <div className="nav-icon-risk-detection">
          <div className="nav-icon-risk-detection-group">
            <img alt="" src={navRiskDetection} />
          </div>
        </div>
        <p className="nav-label">Risk Detection &amp; Health</p>
      </div>

      <NavItem name="advisory" icon={navAdvisory} iconCls="nav-icon-advisory">Advisory Recommendation</NavItem>
      <NavItem name="report" icon={navReport}>Report</NavItem>
      <NavItem name="employee-dashboard" icon={dashboardLineNav} iconCls="nav-icon-employee-dashboard">Employee Dashboard</NavItem>
      <NavItem name="preferences" icon={navPreferences}>Preferences</NavItem>
      <NavItem name="theme" icon={navTheme}>Theme</NavItem>
      <NavItem name="help" icon={navHelp}>Help &amp; Support</NavItem>
      <NavItem name="settings" icon={navSettings}>Settings</NavItem>
    </div>
  );
}
