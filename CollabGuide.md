# Suggested Collaboration Guide:
To help everyone Work together without getting merge conflicts or having to rewrite code, this is a suggested **modular standard**.

> [!NOTE]
> **Keep your existing code!** You do **not** need to discard or rewrite whatever you have already built. Just putting this guide as a suggestion for how to organize your files so that your work stays isolated, safe from merge conflicts, and easy for teammates and frontend developers to call.

---

## Well follow this Modular Pattern :
### Step 1: Keep Your Code in Your Dedicated Module Folder
Place your files in:
`backend/app/modules/<your_assigned_module>/`

Assignments:
- `auth/` (Rohita Prativadi Bhayamkaram)
- `ingestion/` (Athen Falcao)
- `datasets/` (Om Thakur)
- `eda/` (Sherly)
- `risk_health_advisory/` (Sven Tuscano)
- `ai_services/` (Arun)
- `integration/` (Shaury Tiwari)

By keeping your code inside your own folder, you guarantee that nobody else's work will overwrite yours.

---

### Step 2: Fill Out Two 5-Minute Contract Files
Inside your module directory, copy and fill these two simple markdown files:

1. **`ExpectedInput.md`**: Tells the team:
   *"Here is what my module needs to receive (e.g., dataset format, column types, query params)."*
2. **`FeaturesAndOutputs.md`**: Tells the frontend devs (and other backend members):
   *"Here are the calculations/features I built, and here is an example JSON response you will get."*

*(Ready-to-use templates are in `docs/templates/` — just copy, fill in the blanks, and you're done!)*

---

### Step 3: Expose Your Work via a FastAPI Router
If you have written functions or services, expose them using standard FastAPI `APIRouter` in a `router.py` file:
```python
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/my-feature", tags=["My Feature"])

@router.get("/summary")
def get_summary():
    return {"status": "success", "data": ...}
```
The central `app/main.py` automatically mounts your router. You don't have to worry about wiring up the rest of the application.

---

## Reference:
You could Look at `backend/app/modules/risk_health_advisory/` Or let suggest if theres a better way to do things.
For my part I did it like this :
- Modular structure (`router.py`, `schemas.py`, engine services).
- Completed `ExpectedInput.md` and `FeaturesAndOutputs.md`.
- A standalone web demo (`/demo`) showing how to test the module independently.