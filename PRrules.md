# Stechgrow OS — Pull Request Rules & Repository Standards

To ensure everyone's hard work merges cleanly without broken builds, lost code, or accidental overwrites, follow the following pull request and repository standards.

---

## 1. Branch Naming Policy
- **Never push directly to `main` or `develop`**. Direct pushes are disabled.
- Always create a dedicated branch off `develop` (or `main`):
  - **Feature branch**: `feat/<your-name>/<module-name>`
    - *Example*: `feat/sven/risk-health-advisory`
    - *Example*: `feat/athen/dataset-ingestion`
    - *Example*: `feat/sherly/eda-profiling`
    - *Example*: `feat/om/persistence-models`
    - *Example*: `feat/rohita/auth-onboarding`
  - **Bugfix branch**: `fix/<your-name>/<bug-description>`
    - *Example*: `fix/sven/iqr-zero-division`

---

## 2. Scope Containment (Zero File Collisions)
- **Work within your designated module directory**: Keep all your changes inside:
  `backend/app/modules/<your_assigned_module>/`
- **Do not modify files in another member's module**. If you need an integration adjustment or a shared utility, reach out to that teammate or coordinate with the team lead.
- **Shared changes**: Modifications to `backend/app/main.py`, `pyproject.toml`, or `core/` should be minimal and coordinated with Shaury Tiwari (Integration Lead).

---

## PR Checklist (not really a rule, but reccomended, Tumhi aple aple bagha, normally this section is included in the rules so I put it here.. ):-
Before submitting a pull request, confirm the following:
- [ ] Application starts cleanly (`uv run uvicorn app.main:app`).
- [ ] Module endpoints are registered via an `APIRouter`.
- [ ] Automated tests exist in your module's `tests/` directory and pass cleanly (`uv run pytest`).
- [ ] `ExpectedInput.md` and `FeaturesAndOutputs.md` are up to date.
- [ ] No hardcoded placeholder values in final calculations.
- [ ] No `.env` or sensitive credentials committed.
- [ ] The PR description clearly explains:
  1. What was built or fixed.
  2. How a teammate or reviewer can test it.
