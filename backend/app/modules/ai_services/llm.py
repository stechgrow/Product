from dotenv import load_dotenv

load_dotenv()

import json
import logging
import os

logger = logging.getLogger(__name__)

SYSTEM = (
    "You explain analytics findings to business users. Use ONLY the facts given. "
    "Do not invent numbers or causes. Do not add currency symbols, units or "
    "metric names that are not in the facts. These are statistical associations, "
    "not proven causes. If evidence is thin, say so. Max 3 sentences."
)


def _timeout_s() -> float:
    return float(os.getenv("LLM_TIMEOUT_S", "10"))


def _call_gemini(findings: dict, key: str) -> str:
    from google import genai
    from google.genai import types

    model = os.getenv("LLM_MODEL")
    if not model:
        raise RuntimeError("LLM_MODEL is not set")
    client = genai.Client(
        api_key=key,
        http_options=types.HttpOptions(timeout=int(_timeout_s() * 1000)),  # milliseconds
    )
    resp = client.models.generate_content(
        model=model,
        contents=json.dumps(findings, default=str),
        config=types.GenerateContentConfig(system_instruction=SYSTEM, max_output_tokens=1024),
    )
    return (resp.text or "").strip()


def _call_anthropic(findings: dict, key: str) -> str:
    import anthropic

    client = anthropic.Anthropic(api_key=key, max_retries=1, timeout=_timeout_s())
    msg = client.messages.create(
        model=os.getenv("LLM_MODEL", "claude-sonnet-5-5"),
        max_tokens=1024, system=SYSTEM,
        messages=[{"role": "user", "content": json.dumps(findings, default=str)}],
    )
    return "".join(b.text for b in msg.content if b.type == "text").strip()


def explain(findings: dict, fallback: str, use_llm: bool = True) -> tuple[str, str]:
    provider = os.getenv("LLM_PROVIDER", "gemini").lower()
    if provider not in {"gemini", "anthropic"}:
        return fallback, "template"
    key = os.getenv("GEMINI_API_KEY" if provider == "gemini" else "ANTHROPIC_API_KEY")
    if not (use_llm and key):
        return fallback, "template"
    try:
        call = _call_gemini if provider == "gemini" else _call_anthropic
        text = call(findings, key)
        return (text, "llm") if text else (fallback, "template")
    except Exception:
        logger.exception("LLM explanation failed, using template")
        return fallback, "template"