# Stechgrow OS — Backend

FastAPI modular intelligence engine for Stechgrow OS.

## Modules
- `app/modules/auth/`: Authentication & onboarding (Rohita Prativadi Bhayamkaram)
- `app/modules/ingestion/`: Dataset upload & ingestion (Athen Falcao)
- `app/modules/datasets/`: Dataset lifecycle & persistence (Om Thakur)
- `app/modules/eda/`: Dashboard & EDA profiling (Sherly)
- `app/modules/risk_health_advisory/`: Risk detection, business health, advisory & reports (Sven Tuscano)
- `app/modules/ai_services/`: AI model services & inference contracts (Arun)
- `app/modules/integration/`: Cross-module integration (Shaury Tiwari)

## Quick Start
```bash
# Start server
uv run uvicorn app.main:app --reload --port 8000

# Open interactive demo
http://localhost:8000/demo

# Run tests
uv run pytest app/modules/risk_health_advisory/tests/ -v
```
