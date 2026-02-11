#!/usr/bin/env python3
"""App.tsx内のサロゲートペアを修正"""
APP_PATH = "App.tsx"

def main():
    with open(APP_PATH, "rb") as f:
        raw = f.read()
    
    # Replace surrogate pair for 🔒 (U+D83D U+DD12 encoded as CESU-8 or raw)
    # In the JS code it appears as a string literal - replace with ⛔ or text
    content = raw.decode('utf-8', errors='replace')
    
    # Find and replace the problematic showSaveSuccess call
    # The surrogate appears as replacement chars after decode
    old_patterns = [
        # Try to find the lock emoji area and replace with simple text
    ]
    
    # More robust: just scan for any surrogate-like patterns and replace
    clean = []
    i = 0
    replaced = 0
    while i < len(content):
        cp = ord(content[i])
        if 0xD800 <= cp <= 0xDFFF:
            # Skip surrogate
            replaced += 1
            i += 1
            continue
        if content[i] == '\ufffd':
            # Skip replacement chars from surrogates
            replaced += 1
            i += 1
            continue
        clean.append(content[i])
        i += 1
    
    content = ''.join(clean)
    
    # Also fix the showSaveSuccess locked message if it got mangled
    if "showSaveSuccess('" in content and '\u524D\u306E\u30B9\u30C6\u30FC\u30B8' in content:
        # Find the line and ensure it has proper text
        import re
        content = re.sub(
            r"showSaveSuccess\('[^']*\u524D\u306E\u30B9\u30C6\u30FC\u30B8\u3092\u30AF\u30EA\u30A2[^']*'\)",
            "showSaveSuccess('\u26D4 \u524D\u306E\u30B9\u30C6\u30FC\u30B8\u3092\u30AF\u30EA\u30A2')",
            content
        )
    
    # Verify clean
    try:
        content.encode('utf-8')
        print(f"[OK] Surrogates removed ({replaced} chars)")
    except UnicodeEncodeError as e:
        print(f"[ERROR] Still has surrogates: {e}")
        return
    
    with open(APP_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("[OK] App.tsx cleaned")

if __name__ == "__main__":
    main()
