#!/usr/bin/env python3
"""Fail if the Natal hardening layer imports/executes sibling astrology engines.

This is intentionally narrow: documentary provenance may contain words such as
'horary' or 'mundane', but runtime imports/calls from Natal into those engines are
not allowed.
"""
from pathlib import Path
import re, sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / 'src/app/lib/natalAnalysis.ts',
    ROOT / 'src/app/lib/natalTechnicalReport.ts',
    ROOT / 'src/app/lib/natalPrecision.ts',
    ROOT / 'src/app/lib/natalProductionValidation.ts',
    ROOT / 'src/app/lib/natalAiForm.ts',
    ROOT / 'src/app/api/birth-chart/route.ts',
    *sorted((ROOT / 'src/traditions/western/natal').glob('*.ts')),
    *sorted((ROOT / 'src/traditions/western/natal').glob('*.tsx')),
]
FORBIDDEN_IMPORT_FRAGMENTS = (
    '/horary', '/electional', '/synastry', '/mundane', '/predictive',
    'western/horary', 'western/electional', 'western/synastry', 'western/mundane', 'western/predictive',
)
failures=[]
for path in TARGETS:
    if not path.exists():
        continue
    text=path.read_text(encoding='utf-8')
    for line_no,line in enumerate(text.splitlines(),1):
        if not re.search(r'\b(?:import|export)\b.*\bfrom\b|\brequire\s*\(', line):
            continue
        low=line.lower()
        if any(fragment in low for fragment in FORBIDDEN_IMPORT_FRAGMENTS):
            failures.append(f'{path.relative_to(ROOT)}:{line_no}: {line.strip()}')

if failures:
    print('NATAL_ISOLATION=FAIL')
    print('\n'.join(failures))
    sys.exit(1)
print(f'NATAL_ISOLATION=PASS | files={len([p for p in TARGETS if p.exists()])}')
