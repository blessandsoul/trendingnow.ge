"""Apply the existing /lang mechanical gate to decoded draft JSON bodies."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

workspace, package = map(Path, sys.argv[1:3])
assert workspace.is_absolute() and package.is_absolute()
spec = importlib.util.spec_from_file_location('canonical_lang_lint', workspace / 'scripts' / 'lang_lint.py')
lint = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lint)
banned = lint.load_banned()
if not banned:
    raise RuntimeError('Canonical Georgian glossary was not loaded')
rows = []
for source in sorted((package / 'articles').glob('*.json')):
    raw = source.read_bytes()
    data = json.loads(raw)
    text = '\n\n'.join(data[field] for field in ['title', 'excerpt', 'bodyMarkdown'])
    errors, warnings = [], []
    lint.lint_text(source.name, text, 'TEXT', banned, errors.append, warnings.append)
    rows.append({'slug': data['slug'], 'sha256': hashlib.sha256(raw).hexdigest(), 'errors': errors, 'warnings': warnings})
result = {'files': len(rows), 'errors': sum(len(row['errors']) for row in rows), 'warnings': sum(len(row['warnings']) for row in rows), 'rows': rows, 'scope': 'Mechanical Georgian lint only, not meaning, translation fidelity or native review.'}
print(json.dumps(result, ensure_ascii=False, indent=2))
sys.exit(1 if result['errors'] or not rows else 0)
