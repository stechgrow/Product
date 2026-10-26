# Stechgrow OS — Risk & Health Scoring Rules, Assumptions & Validation

**Module**: Risk Detection, Business Health, Advisory & Reports


---

## 1. Product Rules & Algorithmic Foundations

This module computes business intelligence, risk detection, stability metrics, and advisory playbooks for Stechgrow OS. All calculations are implemented strictly according to reproducible mathematical formulas and the approved Figma design specifications.

### Rule 1: Outlier & Anomaly Detection
- **Primary Algorithm**: Modified Z-Score using Median Absolute Deviation (MAD).
  $$M_i = \frac{0.6745 \cdot |x_i - \tilde{x}|}{\text{MAD}}$$
  Where $\text{MAD} = \text{median}(|x_i - \tilde{x}|)$.
  - **Threshold**: Values with $M_i > 3.0$ are flagged as anomalies.
  - **Why MAD over Standard Deviation**: Extreme outliers heavily skew standard deviation and mean ($\bar{x}$). Median and MAD remain robust against revenue spikes and data collection anomalies.
- **Secondary Boundary Check**: Tukey's Interquartile Range (IQR) fences:
  $$\text{Lower} = Q_1 - 1.5 \cdot \text{IQR}, \quad \text{Upper} = Q_3 + 1.5 \cdot \text{IQR}$$
  Transactions falling outside Tukey fences are cross-validated as financial anomalies.

### Rule 2: Severity Classification Model
- **`High` Severity**:
  - $M_i > 4.5$ (extreme statistical anomaly).
  - Negative gross margins or negative transaction values.
  - Churn rate exceeding $20\%$ in any customer or subscription segment.
  - Top 10% of customers accounting for $>65\%$ of recurring revenue.
- **`Medium` Severity**:
  - $3.0 < M_i \le 4.5$ (moderate statistical anomaly).
  - Churn rate between $15\%$ and $20\%$.
  - Missing value or duplicate row frequency exceeding $1\%$ of dataset.
- **`Low` Severity**:
  - $2.0 < M_i \le 3.0$ (minor variance warning).

### Rule 3: Business Health Score Formula (0–100)
$$\text{Performance Score} = \text{clip}\left(100 - (w_{\text{high}} \cdot N_{\text{high}} + w_{\text{med}} \cdot N_{\text{med}} + w_{\text{churn}} \cdot \text{Penalty}_{\text{churn}}), 0, 100\right)$$
- Weights:
  - $w_{\text{high}} = 3.5$ points deduction per high severity anomaly.
  - $w_{\text{med}} = 1.5$ points deduction per medium severity anomaly.
  - $w_{\text{churn}} = 5.0$ points deduction if churn exceeds $15\%$.
- **Status Classification Bands**:
  - $\ge 75$: `Stable` (matches Figma value `78 Stable`).
  - $50 - 74$: `Moderate`.
  - $< 50$: `Critical`.
  - Rows $< 4$: `Insufficient Data`.

### Rule 4: Business Stability 4-Dimension Index
In `Risk Detection and Buisness Health.png`, Business Stability is indexed at **72% Moderate** with 4 components:
1. **Revenue Stability (69%)**: $100 - \min(100, \text{CV}_{\text{revenue}} \times 100)$, where $\text{CV} = \frac{\sigma}{\mu}$.
2. **Customer Resilience (75%)**: Retention rate baseline minus concentration exposure.
3. **Operational Stability (53%)**: Transaction variance and low anomaly frequency.
4. **Channel Resilience (80%)**: Distribution balance between digital channels and offline sales.

### Rule 5: Financial Impact Estimation Heuristic
$$\text{Estimated Impact} = \sum_{i \in \text{anomalies}} |x_i - \tilde{x}| \cdot \text{Margin Ratio}$$
- Formatted in Indian Rupee (`₹ 3,754`, `₹ 450K`, `₹ 1.2M`) to match the approved Figma mockups.

---

## 2. Documented Assumptions Submitted for Lead Approval

1. **Minimum Data Requirement (Insufficient Data Guard)**:
   - *Assumption*: Meaningful statistical anomaly detection and volatility analysis requires at least **4 rows** with at least one numeric metric column.
   - *Behavior when rows < 4*: The API sets `is_insufficient_data = True`, assigns `performance_status = "Insufficient Data"`, and returns a clear warning message rather than fabricating scores.
2. **Missing & Currency Column Sanitization**:
   - *Assumption*: User uploaded CSVs frequently format revenue numbers as strings (`"₹ 1,500"`, `"$2,400"`).
   - *Behavior*: The engine automatically strips currency symbols, commas, and whitespace before casting to `float64`.
3. **AI Narrative Guidance & Offline Reliability**:
   - *Assumption*: Production deployments might not always have an active `GEMINI_API_KEY` configured.
   - *Behavior*: When an API key is present, Google Gemini generates narrative diagnosis. When absent or offline, high-quality deterministic heuristics generate narrative insights that faithfully match the Figma screenshot text.

---

## 3. Test Evidence & Validation Results

The module test suite contains **36 automated unit, integration, and stress tests** covering:
- Normal business data (SaaS and Retail E-commerce)
- Boundary data (uniform numbers, zero variance, negative margins)
- Missing-data scenarios (null values, dirty string formats)
- Insufficient-data scenarios (0 rows, 1 row, 2 rows, 3 rows)
- End-to-end API endpoints, CSV upload, and PDF/CSV report generation.

**Test Run Evidence**:
```bash
cd backend && uv run pytest app/modules/risk_health_advisory/tests/ -v
# 36 passed in 0.85s (100% pass rate)
```
