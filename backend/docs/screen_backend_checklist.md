# Screen Backend Checklist
BACKEND COVERAGE CHECKLIST .

Starting/Entry Screens and Navigation
•	Splash / Brand Logo Screens: Frontend-only. Static branding assets require no backend state or lookup.
•	Navigation / Sidebar Menu: Requires backend lookup for user role/permissions to render available modules. Owner: Shaury + Rohita.
Authentication and Onboarding
•	Log In / Sign Up: Requires endpoints for registration, login, and JWT/token generation. Owner: Rohita.
•	OTP / Verify Email: Requires secure OTP generation, email dispatch, and validation endpoints. Owner: Rohita.
•	Reset Password: Requires secure password reset link generation and state handling. Owner: Rohita.
•	Set up your business: Requires endpoints to save company structure, industry, revenue streams, and operational parameters to the user/account model. Owner: Rohita + Om.
Upload/Import Flow
•	Upload Document / Connect Database: Requires multipart file upload API and database connection string handling. Owner: Athen.
•	File Cleaning & Progress: Requires asynchronous file validation, parsing, and status tracking endpoints (e.g., "Estimated Time: 3:00 min"). Owner: Athen.
•	Upload History / Success States: Requires dataset metadata retrieval to show previously uploaded documents. Owner: Athen + Om.
Dataset Listing/Details/Management
•	Dataset File Information / Data Preview: Requires endpoints to fetch dataset ownership, row/column counts, data types, and a preview of rows. Owner: Om.
Dashboard / Overview & EDA
•	Main Dashboard (Total Sales, Profit, KPIs): Requires endpoints summarizing real persisted dataset results based on time filters (week/month/year). Owner: Sherly.
•	Automated Exploratory Data Analysis (EDA): Requires statistical calculation APIs for data summaries, missing values, top anomalies, and chart-ready correlation heatmaps. Owner: Sherly.
Risk / Business Health & Advisory
•	Risk Detection & Business Health: Requires APIs outputting performance scores, anomaly counts, retention rates, and risk scoring metrics based on agreed rules. Owner: Sven (+ Arun for AI).
•	Advisory Recommendations: Requires AI-backed text generation/service logic for insights (e.g., "Revenue decline observed... adjust retention offers") and critical action steps. Owner: Sven (+ Arun for AI).
Reports / Exports
•	Reports Dashboard: Requires endpoints to list generated/scheduled reports and fetch report file sizes. Owner: Sven.
•	Fund Utilisation: Frontend-only. This is a static strategic investment allocation breakdown and does not submit or load dynamic data.
Additional Screens (My tasks)
•	Employee Dashboard: Requires endpoints to fetch metrics like "Files Cleaned," "EDA Reports," "Streak Days," and "Recent Files" activity logs. Owner: Shaury.
•	Subscription & Billing: Requires endpoints for fetching trial status, upgrading plans (Starter/Pro/Enterprise), and calculating billing summaries with discounts. Owner: Shaury.
•	Preferences / Theme / Help & Support / Settings: Requires shared configuration/profile endpoints. Note: If "Theme" is just a local browser toggle, mark it explicitly as frontend-only. Owner: Shaury.
Cross-Module Integration
•	Integration Checks: Requires standardizing CORS, router registration, common API response/error conventions, and full end-to-end API checks across all the above modules. Owner: Shaury + all owners.
