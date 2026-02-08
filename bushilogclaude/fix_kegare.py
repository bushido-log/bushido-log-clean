#!/usr/bin/env python3
with open('App.tsx','r',encoding='utf-8') as f:
    c = f.read()

# 1. Remove modal from current location (inside main return)
old_modal_start = "      {/* Katana Polishing Modal */}"
old_modal_end = "      {/* Yokai Defeat Modal */}"

idx_start = c.find(old_modal_start)
idx_end = c.find(old_modal_end)

if idx_start > 0 and idx_end > idx_start:
    modal_code = c[idx_start:idx_end]
    c = c[:idx_start] + c[idx_end:]
    print('1/2 Removed modal from main return OK')
else:
    print('1/2 SKIP - modal not found')
    modal_code = None

# 2. Add modal BEFORE the early return for showStartScreen
old_early = """  if (showStartScreen && !isOnboarding) {
    return renderStartScreen();
  }"""

if modal_code and old_early in c:
    new_early = """  if (showStartScreen && !isOnboarding) {
    return (
      <>
        {renderStartScreen()}
""" + modal_code + """
      </>
    );
  }"""
    c = c.replace(old_early, new_early)
    print('2/2 Modal moved to start screen wrapper OK')
else:
    print('2/2 SKIP - early return not found')

with open('App.tsx','w',encoding='utf-8') as f:
    f.write(c)

print('=== DONE ===')
