import io
import csv
from datetime import datetime, timezone
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.modules.risk_health_advisory.schemas import RiskHealthSummary, AdvisoryHubData, RiskItem

class ReportEngine:
    """Compiles executive business health reports and provides downloadable PDF & CSV exports."""

    @classmethod
    def compile_executive_summary(
        cls, 
        summary: RiskHealthSummary, 
        advisory: AdvisoryHubData,
        risks: List[RiskItem] = None,
        dataset_name: str = "Stechgrow_Design_Dataset"
    ) -> Dict[str, Any]:
        """Compiles complete structured JSON report for downstream and frontend integration."""
        risks = risks or []
        return {
            "title": "Stechgrow OS Executive Business Health & Risk Audit",
            "dataset_name": dataset_name,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "performance_score": summary.performance_score,
            "performance_status": summary.performance_status,
            "stability_score": summary.stability.overall_pct,
            "total_anomalies": summary.total_anomalies,
            "retention_rate": f"{summary.customer_retention_rate}%",
            "critical_actions_count": advisory.overview.critical_actions,
            "potential_financial_impact": advisory.overview.potential_impact_formatted,
            "stability_dimensions": {
                "revenue": f"{summary.stability.revenue_pct}%",
                "customers": f"{summary.stability.customers_pct}%",
                "operations": f"{summary.stability.operational_pct}%",
                "sales_channels": f"{summary.stability.channel_pct}%"
            },
            "detected_risks": [r.model_dump() for r in risks],
            "advisory_cards": [c.model_dump() for c in advisory.cards]
        }

    @classmethod
    def generate_csv_report(
        cls,
        summary: RiskHealthSummary,
        advisory: AdvisoryHubData,
        risks: List[RiskItem] = None
    ) -> str:
        """Generates structured CSV export containing risks and advisory action playbooks."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Section 1: Executive KPI Header
        writer.writerow(["STECHGROW OS — BUSINESS HEALTH & RISK AUDIT"])
        writer.writerow(["Generated At", datetime.now(timezone.utc).isoformat()])
        writer.writerow(["Performance Score", f"{summary.performance_score}/100", summary.performance_status])
        writer.writerow(["Business Stability", f"{summary.stability.overall_pct}%", summary.stability.status_label])
        writer.writerow(["Anomalies Detected", summary.total_anomalies])
        writer.writerow(["Customer Retention", f"{summary.customer_retention_rate}%"])
        writer.writerow(["Potential Impact", advisory.overview.potential_impact_formatted])
        writer.writerow([])
        
        # Section 2: Detected Risks Register
        writer.writerow(["--- DETECTED RISKS REGISTER ---"])
        writer.writerow(["Risk ID", "Risk Type", "Metric", "Severity", "Business Impact", "Details"])
        for r in (risks or []):
            writer.writerow([r.id, r.risk_type, r.metric_name, r.severity, r.business_impact_formatted, r.details or ""])
        writer.writerow([])

        # Section 3: Advisory Playbooks
        writer.writerow(["--- STRATEGIC ADVISORY PLAYBOOK ---"])
        writer.writerow(["Card ID", "Title", "Category", "Impact Badge", "Estimated Impact", "Timeline", "Recommended Actions"])
        for c in advisory.cards:
            actions_joined = " | ".join(c.recommended_actions)
            writer.writerow([c.id, c.title, c.category_badge, c.impact_badge, c.estimated_impact_text, c.timeline_text, actions_joined])
            
        return output.getvalue()

    @classmethod
    def generate_pdf_report(
        cls,
        summary: RiskHealthSummary,
        advisory: AdvisoryHubData,
        dataset_name: str = "Stechgrow_Design_Dataset"
    ) -> bytes:
        """Generates an executive PDF report using ReportLab."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#1e1b4b'),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=15
        )
        h2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#4338ca'),
            spaceBefore=12,
            spaceAfter=8
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        
        story = []
        
        # Header
        story.append(Paragraph("Stechgrow OS — Business Health & Risk Audit", title_style))
        story.append(Paragraph(f"Dataset: <b>{dataset_name}</b> | Generated: {datetime.now(timezone.utc).strftime('%b %d, %Y %H:%M UTC')}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6366f1'), spaceAfter=15))
        
        # Top KPI Scorecard Table
        scorecard_data = [
            ["Metric", "Value", "Status", "Context"],
            ["Performance Score", f"{summary.performance_score}/100", summary.performance_status, f"Trend: +{summary.trend_delta_pct}%"],
            ["Business Stability", f"{summary.stability.overall_pct}%", summary.stability.status_label, "Composite 4-dimension index"],
            ["Anomalies Detected", str(summary.total_anomalies), f"{summary.high_severity_count} High, {summary.medium_severity_count} Med", "MAD / IQR Outliers"],
            ["Customer Retention", f"{summary.customer_retention_rate}%", summary.retention_status, "Monthly renewal resilience"],
            ["Potential Impact", advisory.overview.potential_impact_formatted, "Actionable", "Recoverable revenue/margin"]
        ]
        
        scorecard_table = Table(scorecard_data, colWidths=[130, 90, 110, 200])
        scorecard_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0e7ff')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e1b4b')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
        ]))
        story.append(scorecard_table)
        story.append(Spacer(1, 15))
        
        # Advisory Recommendations Section
        story.append(Paragraph("Priority Strategic Actions & Recommendations", h2_style))
        for card in advisory.cards[:3]:
            card_data = [
                [Paragraph(f"<b>{card.title}</b>", ParagraphStyle('C1', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#1e293b'))),
                 Paragraph(f"<font color='#dc2626'><b>{card.impact_badge}</b></font> | <b>{card.category_badge}</b>", body_style)],
                [Paragraph(card.description, body_style), ""],
                [Paragraph(f"<b>Estimated Impact:</b> {card.estimated_impact_text} | <b>Timeline:</b> {card.timeline_text}", ParagraphStyle('C2', parent=body_style, textColor=colors.HexColor('#059669'))), ""]
            ]
            t = Table(card_data, colWidths=[380, 150])
            t.setStyle(TableStyle([
                ('SPAN', (0, 1), (1, 1)),
                ('SPAN', (0, 2), (1, 2)),
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f1f5f9')),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                ('PADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(t)
            story.append(Spacer(1, 8))
            
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
