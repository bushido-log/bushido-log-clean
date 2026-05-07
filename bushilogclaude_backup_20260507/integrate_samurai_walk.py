#!/usr/bin/env python3
"""
integrate_samurai_walk.py
Safe integration of SamuraiWalk screen into App.tsx.
Following the handoff doc: line-number-based editing, no pattern matching.

Usage:
  python3 integrate_samurai_walk.py

This script:
1. Adds the SamuraiWalkScreen import
2. Adds showSamuraiWalk state
3. Adds conditional rendering
4. Creates a backup before editing
"""

import os
import sys
import shutil
from datetime import datetime

APP_TSX = os.path.expanduser('~/Desktop/bushido-log-clean/bushilogclaude/App.tsx')

def main():
    if not os.path.exists(APP_TSX):
        print(f"[ERROR] App.tsx not found at: {APP_TSX}")
        sys.exit(1)

    # Backup
    backup = APP_TSX + f'.backup.{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    shutil.copy2(APP_TSX, backup)
    print(f"[OK] Backup created: {backup}")

    with open(APP_TSX, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    total = len(lines)
    print(f"[INFO] App.tsx has {total} lines")

    # ─── Step 1: Add import ──────────────────────────────────
    # Find the last import line
    import_line = "import SamuraiWalkScreen from './src/screens/SamuraiWalkScreen';\n"

    # Check if already imported
    joined = ''.join(lines)
    if 'SamuraiWalkScreen' in joined:
        print("[SKIP] SamuraiWalkScreen already imported")
    else:
        last_import_idx = -1
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith('import ') or stripped.startswith('from '):
                last_import_idx = i

        if last_import_idx == -1:
            print("[ERROR] Could not find any import statements")
            sys.exit(1)

        lines.insert(last_import_idx + 1, import_line)
        print(f"[OK] Added import at line {last_import_idx + 2}")

    # ─── Step 2: Add state ───────────────────────────────────
    state_line = "  const [showSamuraiWalk, setShowSamuraiWalk] = useState(false);\n"

    if 'showSamuraiWalk' in ''.join(lines):
        print("[SKIP] showSamuraiWalk state already exists")
    else:
        # Find a useState line to insert near
        state_idx = -1
        for i, line in enumerate(lines):
            if 'useState(' in line and 'const [' in line:
                state_idx = i

        if state_idx == -1:
            print("[WARN] Could not find useState, adding after imports")
            # Find end of imports
            for i, line in enumerate(lines):
                if line.strip().startswith('import '):
                    state_idx = i
            state_idx += 2

        lines.insert(state_idx + 1, state_line)
        print(f"[OK] Added state at line {state_idx + 2}")

    # ─── Step 3: Add screen rendering ────────────────────────
    render_block = """
      {/* === Samurai Walk === */}
      {showSamuraiWalk && (
        <SamuraiWalkScreen onClose={() => setShowSamuraiWalk(false)} />
      )}
"""

    if 'showSamuraiWalk &&' in ''.join(lines):
        print("[SKIP] SamuraiWalk rendering already exists")
    else:
        # Find 'return (' to insert rendering
        # Look for the main return statement with JSX
        return_idx = -1
        for i, line in enumerate(lines):
            # Look for a return followed by ( that contains View or Fragment
            if 'return (' in line or 'return(' in line:
                # Check next few lines for JSX indicators
                nearby = ''.join(lines[i:i+5])
                if '<' in nearby:
                    return_idx = i

        if return_idx == -1:
            print("[WARN] Could not find main return(), please add manually:")
            print(render_block)
        else:
            # Insert after the opening tag (usually next line or line after)
            insert_idx = return_idx + 1
            # Skip past the opening tag line
            for j in range(return_idx + 1, min(return_idx + 5, len(lines))):
                if '<' in lines[j] and '>' in lines[j]:
                    insert_idx = j + 1
                    break

            for render_line in reversed(render_block.split('\n')):
                lines.insert(insert_idx, render_line + '\n')
            print(f"[OK] Added render block near line {insert_idx}")

    # ─── Write ───────────────────────────────────────────────
    with open(APP_TSX, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    new_total = len(lines)
    print(f"\n[DONE] App.tsx: {total} -> {new_total} lines")
    print(f"[NOTE] Backup at: {backup}")
    print(f"\n[TODO] You still need to manually add the navigation button.")
    print(f"       Search for a good spot in your main menu/home screen and add:")
    print(f"       <TouchableOpacity onPress={{() => setShowSamuraiWalk(true)}}>")
    print(f"         <Text>\U0001F5FE \u6B66\u58EB\u306E\u9053</Text>")
    print(f"       </TouchableOpacity>")


if __name__ == '__main__':
    main()
