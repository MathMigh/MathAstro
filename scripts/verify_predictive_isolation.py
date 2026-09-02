#!/usr/bin/env python3
from pathlib import Path
import hashlib, json, sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'docs' / 'PREDITIVA_PROTECTED_NATAL_HASHES_20260831.json'
data = json.loads(MANIFEST.read_text(encoding='utf-8'))
failures=[]
for item in data['files']:
    p=ROOT/item['path']
    if not p.exists():
        failures.append(f"MISSING {item['path']}")
        continue
    actual=hashlib.sha256(p.read_bytes()).hexdigest()
    if actual != item['sha256']:
        failures.append(f"CHANGED {item['path']} expected={item['sha256']} actual={actual}")
if failures:
    print('PREDICTIVE ISOLATION: FAIL')
    print('\n'.join(failures))
    sys.exit(1)
print(f"PREDICTIVE ISOLATION: PASS ({len(data['files'])} protected natal/shared-core files unchanged)")
