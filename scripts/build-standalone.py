#!/usr/bin/env python3
"""Inline the static assets into a self-contained HTML file (no dependencies)."""
import base64
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")

def inline_css(match):
    return "<style>\n" + (ROOT / match.group(1)).read_text(encoding="utf-8") + "\n</style>"

def inline_js(match):
    source = (ROOT / match.group(1)).read_text(encoding="utf-8")
    return "<script>\n" + re.sub(r"</script", lambda _: r"<\/script", source, flags=re.I) + "\n</script>"

html = re.sub(r'<link href="(assets/css/[^"]+)" rel="stylesheet"/>', inline_css, html)
html = re.sub(r'<script defer src="(assets/js/[^"]+)"></script>', inline_js, html)
icon = base64.b64encode((ROOT / "assets/favicon.svg").read_bytes()).decode("ascii")
html = html.replace('href="assets/favicon.svg"', f'href="data:image/svg+xml;base64,{icon}"')
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "aust_cgpa_calculator.html"
license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
html = html.replace("<!doctype html>", "<!doctype html>\n<!--\n" + license_text + "-->\n", 1)
out.write_text(html, encoding="utf-8")
print(out)
