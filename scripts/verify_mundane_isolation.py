from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'docs/MUNDANE_PROTECTED_BASELINE_HASHES_20260901.json').read_text(encoding='utf-8'))['protected']
fail=[]
for rel,expected in manifest.items():
    p=root/rel
    if not p.exists(): fail.append((rel,'MISSING')); continue
    got=hashlib.sha256(p.read_bytes()).hexdigest()
    if got!=expected: fail.append((rel,got))
print(f'MUNDANE ISOLATION protected={len(manifest)} changed={len(fail)}')
for rel,got in fail[:50]: print('FAIL',rel,got)
if not fail: print('PASS protected natal/predictive/shared-core unchanged')
raise SystemExit(1 if fail else 0)
