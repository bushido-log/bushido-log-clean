#!/usr/bin/env python3
"""
upgrade_hints.py - v1トースト版を削除してv2妖怪モーダル版に置換
"""

import shutil
from datetime import datetime

path = 'App.tsx'
shutil.copy2(path, path + f'.bak_hintfix_{datetime.now().strftime("%H%M%S")}')

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove v1 hint code blocks
removals = [
    # v1 state block
    ('  // === First-time Hints ===\n', '  };\n\n', True),
    # v1 loader
    ('  // Load hints shown\n', '  }, []);\n\n', True),
    # v1 showHintForTab + watcher
    ('  const showHintForTab = useCallback((key: string) => {\n', '  }, [tab]);\n\n', True),
]

for start_marker, end_marker, include_end in removals:
    idx_start = content.find(start_marker)
    if idx_start == -1:
        continue
    idx_end = content.find(end_marker, idx_start)
    if idx_end == -1:
        continue
    if include_end:
        idx_end += len(end_marker)
    removed = content[idx_start:idx_end]
    # Only remove if it's actually v1 code (has HINTS or hintsShown)
    if 'hintsShown' in removed or 'HINTS' in removed or 'showHintForTab' in removed:
        content = content[:idx_start] + content[idx_end:]
        print(f'\u2705 Removed v1 block: {start_marker.strip()[:40]}...')

# Remove samuraiWalk hint call if exists
content = content.replace("            showHintForTab('samuraiWalk');\n", '')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('\u2705 v1 removed. Now running v2 install...\n')

# Now run v2 install
import subprocess
import sys
result = subprocess.run([sys.executable, 'add_yokai_hints.py'], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print(result.stderr)
